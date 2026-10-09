# Voice assistant for the Junaid Alani portfolio.
# Pipeline: Groq whisper-large-v3-turbo (STT) -> Groq gpt-oss-120b (LLM)
# -> Kokoro-82M (TTS, local) with Groq Orpheus as hosted fallback.
#
# Endpoints:
#   GET  /health        - status + configured models
#   POST /voice         - multipart audio file -> JSON {transcript, reply, audio (base64 wav)}
#   POST /call          - call-center-ai compatible outbound-call stub (needs Twilio env)
#
# Run:  uvicorn main:app --port 8790   (from this directory)
import base64
import io
import json
import os
import re
import wave

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env.local"))

GROQ_STT_KEY = os.environ.get("GROQ_STT_API_KEY", "")
GROQ_LLM_KEY = os.environ.get("GROQ_LLM_API_KEY", "")
HF_TOKEN = os.environ.get("HF_TOKEN", "")
LLM_MODEL = os.environ.get("LLM_MODEL", "openai/gpt-oss-120b")
STT_MODEL = os.environ.get("STT_MODEL", "whisper-large-v3-turbo")
TTS_MODEL = os.environ.get("TTS_MODEL", "canopylabs/orpheus-v1-english")

# llama-3.3-70b-versatile was retired by Groq; gpt-oss-120b is the replacement.
PERSONA = os.environ.get(
    "ASSISTANT_PERSONA",
    "You are Junaid Alani's voice assistant on his portfolio site. "
    "Junaid is a BSc Computer Science (Artificial Intelligence) graduate of Keele University "
    "in Manchester, UK, focused on data analysis and AI. Be friendly and brief: spoken answers "
    "should be one to three sentences. If asked something you do not know, say so and suggest "
    "emailing junaid.alani.1@gmail.com. No em dashes in spoken text.",
)

app = FastAPI(title="Portfolio voice agent")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("ALLOW_ORIGINS", "*").split(","),
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

_KOKORO = None


def _get_kokoro():
    """Lazily load the local Kokoro-82M model (first call downloads weights)."""
    global _KOKORO
    if _KOKORO is None:
        from kokoro import KPipeline

        _KOKORO = KPipeline(lang_code="a")
    return _KOKORO


def _floats_to_wav_base64(samples, sample_rate=24000) -> str:
    import struct

    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sample_rate)
        frames = bytearray()
        for s in samples:
            clipped = max(-1.0, min(1.0, float(s)))
            frames += struct.pack("<h", int(clipped * 32767))
        w.writeframes(bytes(frames))
    return base64.b64encode(buf.getvalue()).decode()


def _sanitize_for_speech(text: str) -> str:
    # Kokoro and Orpheus both choke on markdown and long text.
    text = re.sub(r"[*_`#>\[\]()]|https?://\S+", " ", text)
    return re.sub(r"\s+", " ", text).strip()[:600]


async def stt(audio: bytes, filename: str) -> str:
    async with httpx.AsyncClient(timeout=60) as c:
        r = await c.post(
            "https://api.groq.com/openai/v1/audio/transcriptions",
            headers={"Authorization": f"Bearer {GROQ_STT_KEY}"},
            files={"file": (filename, audio)},
            data={"model": STT_MODEL, "response_format": "json"},
        )
        r.raise_for_status()
        return r.json()["text"].strip()


async def llm_reply(history: list) -> str:
    messages = [
        {"role": "system", "content": PERSONA},
        *[{"role": m.get("role", "user"), "content": str(m.get("content", ""))} for m in history[-12:]],
    ]
    async with httpx.AsyncClient(timeout=60) as c:
        r = await c.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {GROQ_LLM_KEY}"},
            json={"model": LLM_MODEL, "temperature": 0.6, "max_tokens": 300, "messages": messages},
        )
        r.raise_for_status()
        return r.json()["choices"][0]["message"]["content"].strip()


async def tts(text: str):
    """Returns (audio_wav_bytes, engine_used). Local Kokoro first, Groq Orpheus fallback."""
    text = _sanitize_for_speech(text)
    if text:
        try:
            pipe = _get_kokoro()
            import numpy as np

            chunks = []
            for _, _, audio in pipe(text, voice="af_heart", speed=1.0):
                chunks.append(np.asarray(audio))
            if chunks:
                merged = np.concatenate(chunks)
                return _floats_to_wav_base64(merged), "kokoro-82M (local)"
        except Exception as e:
            print(f"local kokoro unavailable ({e}); falling back to hosted TTS")
    async with httpx.AsyncClient(timeout=60) as c:
        r = await c.post(
            "https://api.groq.com/openai/v1/audio/speech",
            headers={"Authorization": f"Bearer {GROQ_LLM_KEY}"},
            json={"model": TTS_MODEL, "input": text, "voice": "tara"},
        )
        r.raise_for_status()
        return base64.b64encode(r.content).decode(), TTS_MODEL


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "stt": STT_MODEL,
        "llm": LLM_MODEL,
        "tts": "kokoro-82M local, fallback " + TTS_MODEL,
    }


@app.post("/voice")
async def voice(file: UploadFile = File(...), history: str = Form("[]")):
    if not GROQ_STT_KEY or not GROQ_LLM_KEY:
        return JSONResponse(status_code=500, content={"error": "GROQ_STT_API_KEY / GROQ_LLM_API_KEY not set"})
    audio = await file.read()
    if not audio:
        return JSONResponse(status_code=400, content={"error": "empty audio"})
    try:
        transcript = await stt(audio, file.filename or "audio.wav")
        if not transcript:
            return JSONResponse(status_code=400, content={"error": "no speech detected"})
        try:
            turns = json.loads(history)
        except json.JSONDecodeError:
            turns = []
        turns.append({"role": "user", "content": transcript})
        reply = await llm_reply(turns)
        audio_b64, engine = await tts(reply)
        return {"transcript": transcript, "reply": reply, "tts_engine": engine, "audio": audio_b64}
    except httpx.HTTPStatusError as e:
        detail = e.response.text[:300]
        return JSONResponse(status_code=502, content={"error": f"upstream error: {detail}"})


@app.post("/call")
async def call(req: dict):
    # Compatible with microsoft/call-center-ai's POST /call contract so the site's
    # "Call me" button (VITE_CALL_CENTER_URL) can point here unchanged.
    phone = (req or {}).get("phone_number", "")
    task = (req or {}).get("task", "Portfolio assistant call")
    if not re.match(r"^\+?[\d\s()-]{7,}$", phone or ""):
        return JSONResponse(status_code=400, content={"error": "valid phone_number required"})
    sid = os.environ.get("TWILIO_ACCOUNT_SID", "")
    token = os.environ.get("TWILIO_AUTH_TOKEN", "")
    twilio_from = os.environ.get("TWILIO_FROM_NUMBER", "")
    if not (sid and token and twilio_from):
        return JSONResponse(
            status_code=501,
            content={
                "error": "Outbound calling needs a telephony provider. Set TWILIO_ACCOUNT_SID, "
                "TWILIO_AUTH_TOKEN and TWILIO_FROM_NUMBER (see README.md), then restart.",
                "hint": "Browser voice chat works now via POST /voice.",
                "phone_number": phone,
            },
        )
    # Twilio wired but full duplex voice streaming is not implemented yet:
    # place a call that speaks the task intro with hosted TTS and records a voicemail.
    async with httpx.AsyncClient(timeout=60) as c:
        r = await c.post(
            f"https://api.twilio.com/2010-04-01/Accounts/{sid}/Calls.json",
            auth=(sid, token),
            data={
                "To": phone,
                "From": twilio_from,
                "Twiml": (
                    f"<Response><Say>{task}</Say>"
                    "<Record maxLength='120' transcribe='true' "
                    "transcribeCallback='' playBeep='true'/></Response>"
                ),
            },
        )
    if r.status_code >= 400:
        return JSONResponse(status_code=502, content={"error": r.text[:300]})
    return {"status": "dialing", "call_sid": r.json().get("sid"), "phone_number": phone}

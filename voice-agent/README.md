# Voice agent

Voice assistant backend for the portfolio. Groq `whisper-large-v3-turbo` for
speech-to-text, Groq `openai/gpt-oss-120b` for the reply, Kokoro-82M for the
voice, with Groq's hosted TTS as fallback.

Note on models: `llama-3.3-70b-versatile` was retired by Groq. The service uses
`openai/gpt-oss-120b` (Groq's current flagship). Override with `LLM_MODEL`.

Note on Kokoro: Hugging Face no longer serves `hexgrad/Kokoro-82M` through its
hosted inference API, so this service runs Kokoro locally through the official
`kokoro` pip package (first call downloads the model weights). If the local
model is unavailable it falls back to `canopylabs/orpheus-v1-english` on Groq,
which needs a one-time terms acceptance at
https://console.groq.com/playground?model=canopylabs%2Forpheus-v1-english

## Setup

```bash
python -m venv .venv
.venv/Scripts/pip install -r requirements.txt   # Windows
# .venv/bin/pip install -r requirements.txt     # mac/linux
```

Keys live in `../.env.local` (gitignored): `GROQ_STT_API_KEY`, `GROQ_LLM_API_KEY`.

## Run

```bash
.venv/Scripts/uvicorn main:app --port 8790
```

## Test the whole pipeline

```bash
curl -s -o test.wav -F "file=@some-audio.wav" http://localhost:8790/voice
# -> {"transcript": "...", "reply": "...", "audio": "<base64 wav>"}
```

## Outbound phone calls

`POST /call` accepts the same payload as microsoft/call-center-ai
(`phone_number`, `task`, `bot_company`, `bot_name`), so the site's
"Call me" button can point here via `VITE_CALL_CENTER_URL`. Dialing needs a
telephony provider, currently Twilio:

1. Twilio trial account, buy/verify a number.
2. Set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` in `../.env.local`.
3. Restart. `POST /call` places a call that speaks the intro and records the
   caller's voicemail (full duplex conversation streaming is the next step,
   e.g. LiveKit Agents with a Twilio SIP trunk).

## Deploying

Any host that runs Python works (Railway, Fly.io, a VPS). Set the same env
vars, expose the port, then point `VITE_CALL_CENTER_URL` at the deployed URL.

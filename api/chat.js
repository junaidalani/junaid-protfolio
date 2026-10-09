// Junaid Alani portfolio chatbot.
// Powered by Groq (OpenAI-compatible endpoint, llama-3.3-70b-versatile).
// The system prompt bakes in Junaid's CV as the knowledge base and adopts the
// writing rules from hardikpandya/stop-slop so replies don't sound like
// generic AI slop.

import { createClient } from '@supabase/supabase-js';

// Reads only need the anon key; row level security allows public selects.
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';
// llama-3.3-70b-versatile was retired by Groq; gpt-oss-120b is the current
// flagship on the platform. Override with GROQ_MODEL if needed.
const DEFAULT_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

// stop-slop rules distilled from hardikpandya/stop-slop/SKILL.md
const STOP_SLOP_RULES = `
Writing rules — remove AI tells:
- Cut filler phrases and throat-clearing openers ("Certainly!", "Great question!", "Here's what..."). Get to the point.
- No adverbs. Trim emphasis crutches ("truly", "really", "very", "quite").
- Active voice only. Every sentence needs a human subject doing something.
- Be specific. Name the thing. Avoid vague declaratives.
- No "not X, it's Y" contrasts. State Y directly.
- Vary sentence rhythm. Mix short and long. No metronomic pacing.
- No em dashes. Use commas, semicolons, or two sentences.
- Plain ASCII punctuation only: no unicode dashes, curly quotes, or invisible marks.
- No pull-quote flourishes. No dramatic one-line paragraphs.
- Trust the reader. Skip softening and hand-holding.
- Never open with "I" or "As an AI". Never say "I'm just an AI".
`;

function buildSystemPrompt(profile, skills, experience, education, volunteer, interests) {
  const skillLines = (skills || []).map((s) => `- ${s.category}: ${s.name}`).join('\n');
  const expLines = (experience || [])
    .map((e) => `- ${e.role} @ ${e.company} (${e.period}): ${e.details}`)
    .join('\n');
  const eduLines = (education || [])
    .map((e) => `- ${e.qualification} @ ${e.institution} (${e.period})${e.details ? ': ' + e.details : ''}`)
    .join('\n');
  const volLines = (volunteer || [])
    .map((v) => `- ${v.role} @ ${v.org}: ${v.details}`)
    .join('\n');
  const langs = (interests || []).filter((i) => i.category === 'Language').map((i) => i.label).join(', ');
  const hobbies = (interests || []).filter((i) => i.category === 'Hobby').map((i) => i.label).join(', ');

  return `You are the personal portfolio assistant for ${profile.full_name}. You answer questions about Junaid on his behalf — his experience, skills, education, availability, and how to reach him. You are friendly, concise, and honest. When you do not know something, say so and suggest the visitor email him directly.

--- PROFILE ---
Name: ${profile.full_name}
Title: ${profile.title}
Location: ${profile.location}
Email: ${profile.email}
Phone: ${profile.phone}
Summary: ${profile.summary}
Languages: ${langs}
Hobbies: ${hobbies}

--- SKILLS ---
${skillLines}

--- WORK EXPERIENCE ---
${expLines}

--- EDUCATION ---
${eduLines}

--- VOLUNTEER ---
${volLines}

--- ANSWERING STYLE ---
Reply in 1-3 short paragraphs unless asked for detail. Use plain text; use markdown bullets sparingly. Never invent projects, employers, dates, or credentials that are not listed above. If a recruiter or employer asks about availability, encourage them to email ${profile.email} or use the contact form on this site.

${STOP_SLOP_RULES}`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GROQ_LLM_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'The chatbot needs a GROQ_LLM_API_KEY. Set it in the server environment and redeploy.',
    });
  }

  try {
    const { messages } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array required' });
    }

    // Load Junaid's data straight from Supabase every request so the bot stays
    // in sync with any edits made in the DB.
    const [{ data: profile }, { data: skills }, { data: experience }, { data: education }, { data: volunteer }, { data: interests }] = await Promise.all([
      supabase.from('profile').select('*').limit(1),
      supabase.from('skills').select('*').order('sort'),
      supabase.from('experience').select('*').order('sort'),
      supabase.from('education').select('*').order('sort'),
      supabase.from('volunteer').select('*').order('sort'),
      supabase.from('interests').select('*').order('sort'),
    ]);

    if (!profile || !profile[0]) return res.status(500).json({ error: 'Profile not found' });
    const system = buildSystemPrompt(profile[0], skills, experience, education, volunteer, interests);

    // Clamp user history to last 12 turns to keep context predictable.
    const trimmed = messages.slice(-12).map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content || '').slice(0, 4000),
    }));

    const upstream = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        temperature: 0.6,
        max_tokens: 600,
        messages: [{ role: 'system', content: system }, ...trimmed],
      }),
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      console.error('groq error:', upstream.status, text);
      return res.status(502).json({ error: 'Upstream model error', detail: text.slice(0, 400) });
    }

    const json = await upstream.json();
    const reply = json?.choices?.[0]?.message?.content?.trim() || 'I could not generate a reply. Try again?';
    return res.status(200).json({ reply });
  } catch (err) {
    console.error('chat error:', err);
    return res.status(500).json({ error: err.message });
  }
}

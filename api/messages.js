import supabase from './db-client.js';
import { createEmailClient } from '@opencoredev/email-sdk';
import { resend } from '@opencoredev/email-sdk/resend';

// Owner inbox — every contact submission is forwarded here.
const OWNER_EMAIL = 'junaid.alani.1@gmail.com';

// Lazily construct the client so a missing RESEND_API_KEY doesn't crash the
// entire route (submissions still get persisted to Supabase).
function getEmailClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return createEmailClient({
    adapters: [resend({ apiKey })],
  });
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'POST') {
      const { name, email, message } = req.body || {};
      if (!name || !email || !message) return res.status(400).json({ error: 'Missing fields' });

      // 1) Persist to Supabase so nothing is lost even if email delivery fails.
      const { data, error } = await supabase
        .from('messages')
        .insert({ name, email, message })
        .select()
        .single();
      if (error) throw error;

      // 2) Forward to the owner inbox via @opencoredev/email-sdk (Resend adapter).
      const client = getEmailClient();
      let emailStatus = 'skipped-no-api-key';
      if (client) {
        try {
          await client.send({
            from: process.env.EMAIL_FROM || 'Portfolio <onboarding@resend.dev>',
            to: OWNER_EMAIL,
            replyTo: email,
            subject: `New portfolio message from ${name}`,
            html: `
              <div style="font-family:system-ui,sans-serif;max-width:560px;margin:auto;padding:24px;background:#0F0E0C;color:#F5EFE6;border-radius:12px">
                <h2 style="font-family:Georgia,serif;font-style:italic;color:#CFFF3B;margin:0 0 16px">New message from your portfolio</h2>
                <p style="margin:0 0 8px"><strong>Name:</strong> ${escapeHtml(name)}</p>
                <p style="margin:0 0 16px"><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}" style="color:#CFFF3B">${escapeHtml(email)}</a></p>
                <div style="border-top:1px solid #2A2620;padding-top:16px;white-space:pre-wrap;line-height:1.6">${escapeHtml(message)}</div>
              </div>
            `,
            text: `New message from ${name} <${email}>\n\n${message}`,
          });
          emailStatus = 'sent';
        } catch (mailErr) {
          console.error('email-sdk send failed:', mailErr);
          emailStatus = 'failed';
        }
      }

      return res.status(201).json({ ...data, emailStatus });
    }

    if (req.method === 'GET') {
      const { data, error } = await supabase.from('messages').select('*').order('id', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('messages error:', err);
    res.status(500).json({ error: err.message });
  }
}

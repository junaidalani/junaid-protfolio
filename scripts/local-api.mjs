// Local test runner: mounts the Vercel-style api/ handlers on a plain Node
// server so the whole site can be developed and tested without Vercel.
// Usage: node scripts/local-api.mjs   (listens on http://localhost:8787)
import http from 'node:http';
import fs from 'node:fs';

// Minimal .env.local loader (no dotenv dependency).
const envFile = new URL('../.env.local', import.meta.url);
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
  }
}

const routes = {
  '/api/chat': (await import('../api/chat.js')).default,
  '/api/messages': (await import('../api/messages.js')).default,
};

const server = http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');
  // Polyfill the Vercel response helpers the handlers expect.
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (obj) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(obj)); };

  const handler = routes[pathname];
  if (!handler) return res.status(404).json({ error: `No route for ${pathname}` });

  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString('utf8');
  req.body = raw && (req.headers['content-type'] || '').includes('json') ? JSON.parse(raw) : {};

  try {
    await handler(req, res);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.status(500).json({ error: String(err) });
  }
});

server.listen(8787, () => console.log('local api on http://localhost:8787'));

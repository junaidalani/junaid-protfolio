# FormBee (contact form → email)

The contact form on the site POSTs its `{name, email, message}` payload to
`VITE_FORMBEE_ENDPOINT` (set in `.env.local`, gitignored). When that variable is
empty the form falls back to `POST /api/messages`.

FormBee is open source (github.com/FormBee/FormBee); its hosted service went
offline in July 2026, so this runs the self-hosted email-only backend. A
reference clone lives in `.tools/FormBee` (gitignored).

Deliveries go to **junaid.alani.1@gmail.com**.

## Run the email-only backend

From a clone of FormBee, in `docker-images/email-only`:

```bash
npm install
npx tsx index.ts
```

Env vars (`.env` in that folder):

```
PORT=8788
ORIGIN=https://junaidportifolio.co.uk      # CORS: your site origin
EMAIL_PROVIDER=smtp.gmail.com              # or your SMTP host
SMTP_PORT=465
SMTP_SECURE=true
EMAIL_USER=junaid.alani.1@gmail.com
EMAIL_PASSWORD=your-gmail-app-password     # Gmail: create an App Password
EMAIL_TO=junaid.alani.1@gmail.com
```

Gmail SMTP needs an **App Password** (Google Account → Security → 2-Step
Verification → App passwords), not the normal password.

Then point the site at it:

```
VITE_FORMBEE_ENDPOINT=https://your-formbee-host/formbee/email-only
```

## Hosting options

- **Railway**: FormBee has an official "Email Only" template —
  https://railway.app/template/NR9kSH — set the env vars above, deploy, and use
  the generated URL as `VITE_FORMBEE_ENDPOINT`.
- **Docker**: `docker-images/` in the FormBee repo contains variants
  (email-only, email-and-captcha, webhooks) with Dockerfiles.
- **Any Node host**: the email-only backend is a small Express app; run it with
  the env vars above.

## Local test rig

`smtp-catcher` style testing was used during development: run FormBee with
`EMAIL_PROVIDER=127.0.0.1`, `SMTP_PORT=1025`, `SMTP_SECURE=false` against a
local SMTP catcher, POST a form payload to
`http://localhost:8788/formbee/email-only`, and confirm the message addressed
to junaid.alani.1@gmail.com arrives in the catcher.

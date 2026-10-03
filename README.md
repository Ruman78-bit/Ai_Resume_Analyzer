# ResumeIQ — AI Resume Analyzer

Paste resume text and get an ATS score, strengths, weaknesses, keywords found and missing, a top improvement tip, and suggested job roles. The analysis comes from the Claude API.

## How it works

```
Browser (index.html)
  → POST /.netlify/functions/analyze   { "resume": "<text>" }
  → Netlify Function (netlify/functions/analyze.js)
       checks length (50–12,000 characters)
       calls the Anthropic Messages API with the key from an environment variable
       parses the JSON reply
  → browser renders the result
```

The API key stays on the server and is never sent to the browser. Text returned by the model is escaped before it is put on the page.

## Tech

- HTML, CSS and JavaScript (no framework)
- Netlify Functions (Node.js)
- Anthropic Claude API

## Run it locally

Requirements: Node.js 18+, the [Netlify CLI](https://docs.netlify.com/cli/get-started/), and an [Anthropic API key](https://console.anthropic.com/).

```bash
npm i -g netlify-cli
echo "ANTHROPIC_API_KEY=your_key_here" > .env
netlify dev            # http://localhost:8888
```

## Deploy on Netlify

1. Push this repo to GitHub.
2. In Netlify: **Add new site → Import an existing project** and pick the repo. Build settings come from `netlify.toml`.
3. Under **Site configuration → Environment variables**, add `ANTHROPIC_API_KEY`. Optionally add `ANTHROPIC_MODEL` to change the model (default: `claude-haiku-4-5-20251001`).
4. Redeploy.

## Notes

- The function URL is public, so anyone with the site link can trigger API calls on your key. Set a monthly spend limit on the key in the Anthropic console.
- Pasted resume text is sent to the Anthropic API. Do not paste anything you do not want processed there.
- The ATS score is a language-model estimate, not the output of a real applicant tracking system.

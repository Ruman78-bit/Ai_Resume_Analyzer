// Netlify Function: keeps the Anthropic API key on the server.
// The browser calls POST /.netlify/functions/analyze with { "resume": "<text>" }.

const MAX_CHARS = 12000;
const MIN_CHARS = 50;
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001';

const SYSTEM_PROMPT = `You are an expert resume analyzer and career coach. Analyze the given resume and respond ONLY with a valid JSON object. No preamble, no markdown, no backticks. Just raw JSON.

Return exactly this structure:
{
  "ats_score": <number 0-100>,
  "score_label": "<Excellent|Good|Fair|Needs Work>",
  "score_summary": "<one sentence about overall quality>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
  "keywords_found": ["<keyword1>", "<keyword2>", "<keyword3>", "<keyword4>", "<keyword5>"],
  "keywords_missing": ["<keyword1>", "<keyword2>", "<keyword3>"],
  "top_tip": "<single most important actionable tip>",
  "roles_suited": ["<role 1>", "<role 2>", "<role 3>"]
}`;

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY is not set');
    return json(500, { error: 'Server is not configured' });
  }

  let resume;
  try {
    ({ resume } = JSON.parse(event.body || '{}'));
  } catch {
    return json(400, { error: 'Request body must be valid JSON' });
  }

  if (typeof resume !== 'string' || resume.trim().length < MIN_CHARS) {
    return json(400, { error: `Resume text must be at least ${MIN_CHARS} characters` });
  }
  if (resume.length > MAX_CHARS) {
    return json(413, { error: `Resume text must be under ${MAX_CHARS} characters` });
  }

  let upstream;
  try {
    upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: `Analyze this resume:\n\n${resume}` }],
      }),
    });
  } catch (err) {
    console.error('Network error calling Anthropic:', err.message);
    return json(502, { error: 'Could not reach the AI service' });
  }

  if (!upstream.ok) {
    console.error('Anthropic API returned', upstream.status);
    return json(502, { error: 'The AI service returned an error. Try again later.' });
  }

  const data = await upstream.json();
  const raw = (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('');

  let result;
  try {
    result = JSON.parse(raw.replace(/```json|```/g, '').trim());
  } catch {
    return json(502, { error: 'The AI response was not valid JSON. Try again.' });
  }

  return json(200, result);
};

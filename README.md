# ResumeIQ — AI Resume Analyzer

Paste your resume and get an instant ATS score, strengths, weaknesses, missing keywords, a top tip, and suggested roles — powered by Google's Gemini API.

**Live demo:** https://airesumeanalyzer8.netlify.app/

## Features

- ATS score (0–100) with a quality label and one-line summary
- Strengths and weaknesses of the resume
- Keywords found and keywords missing
- One actionable top tip
- Suggested roles that fit the resume

## How it works

1. The browser sends the pasted resume text to a Netlify Function: `POST /.netlify/functions/analyze`.
2. The function validates the input (50–12,000 characters) and calls the Gemini API with a prompt that requires a fixed JSON structure.
3. The function parses the model's reply and returns clean JSON.
4. The front end renders the score, strengths, weaknesses, keywords, tip, and roles.

The API key stays on the server inside the Netlify Function, so it is never exposed in the browser.

## Tech stack

- HTML, CSS, JavaScript (front end)
- Netlify Functions (Node.js serverless backend)
- Google Gemini API (AI analysis)
- Hosted on Netlify, auto-deployed from GitHub

## Project structure

```
.
├── index.html                  # UI and client-side logic
└── netlify/
    └── functions/
        └── analyze.js          # Serverless function that calls Gemini
```

## Run it yourself

1. Fork or clone this repository.
2. Get a free API key from [Google AI Studio](https://aistudio.google.com/).
3. Deploy the repo on [Netlify](https://www.netlify.com/).
4. In Netlify, go to **Environment variables** and add:

   | Variable | Required | Description |
   | --- | --- | --- |
   | `GEMINI_API_KEY` | Yes | Your Gemini API key |
   | `GEMINI_MODEL` | No | Model name. Defaults to `gemini-3.1-flash-lite` |

5. Trigger a new deploy so the variables take effect.

To test locally, install the [Netlify CLI](https://docs.netlify.com/cli/get-started/), add the variables to a `.env` file, and run `netlify dev`.

## Troubleshooting

- **"The AI service returned an error":** Open Netlify → Functions → `analyze` and read the log. The real error from the API is printed there.
- **401 / invalid API key:** Check that `GEMINI_API_KEY` is set correctly, has no extra spaces or quotes, and that you redeployed after changing it.
- **Model not found (404):** Google retires models regularly. Set `GEMINI_MODEL` to a current Flash or Flash-Lite model from AI Studio.
- **429 / quota exceeded:** The free tier has rate limits. Wait a minute and try again.

## Notes

- This project originally used the Claude API and was moved to Gemini's free tier. Only the API call in `analyze.js` changed; the rest of the app is the same.
- On Gemini's free tier, Google may use inputs to improve its models, so avoid analyzing other people's private data.

## Author

Built by Mohammed Rouman.

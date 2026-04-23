# 👶 Baby Predictor

AI-powered baby face predictor. Upload photos of two parents and get a realistic portrait of what their child might look like, along with a genetic inheritance breakdown.

**Pipeline:** Claude Vision analyzes facial genetics → FLUX.1-schnell generates a 768×768 baby portrait.

![Baby Predictor UI](https://placehold.co/520x320/1a1a1a/b85c9a?text=Baby+Predictor)

---

## Features

- **Drag-and-drop photo uploads** for mother and father
- **Gender picker** — Girl, Boy, or Surprise
- **Genetic analysis** via Claude Vision using Mendelian inheritance rules
- **AI portrait generation** via Together AI's FLUX.1-schnell (free tier)
- **Inheritance breakdown** — color-coded bars showing which parent each feature came from
- **Parent feature grid** — eye color, nose shape, lips, skin tone, hair, face shape
- **Download** the generated baby portrait
- **Dark mode** support
- API keys stored locally only (never sent anywhere except the respective APIs)

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite 5 |
| Backend | Express 4 (Node 18+) |
| Face analysis | Claude Vision (`claude-opus-4-5`) |
| Image generation | Together AI — `FLUX.1-schnell-Free` |

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/sid-senthilkumar/BabyPredictor.git
cd BabyPredictor
npm install
```

### 2. Get API keys

| Key | Where to get it |
|---|---|
| **Claude API key** | [console.anthropic.com](https://console.anthropic.com) |
| **Together AI key** | [api.together.ai](https://api.together.ai) — FLUX.1-schnell is on the free tier |

### 3. Build the frontend

```bash
npm run build
```

### 4. Start the server

```bash
npm start
# → http://localhost:3939
```

Open the app, click the ⚙️ gear icon, and paste in your API keys. They're saved to `.settings.json` on your machine only.

---

## Development

Run the backend and Vite dev server concurrently:

```bash
# Terminal 1 — backend
npm run dev

# Terminal 2 — frontend (with HMR)
npx vite web
```

The Vite dev server proxies `/api` requests to `http://localhost:3939`.

---

## Environment variables

You can also set keys via environment variables instead of the Settings UI:

```bash
cp .env.example .env
# then edit .env
CLAUDE_API_KEY=sk-ant-...
TOGETHER_API_KEY=...
```

The `PORT` variable overrides the default port (3939).

---

## How it works

1. Both parent photos are base64-encoded in the browser and sent to `POST /api/predict`
2. The server sends both images to Claude Vision with a genetics prompt — Claude returns structured JSON with `motherFeatures`, `fatherFeatures`, `inheritance[]`, and a detailed FLUX image prompt
3. The FLUX prompt is sent to Together AI, which returns a 768×768 portrait as `b64_json`
4. The result (image + analysis) is returned to the frontend

---

## Disclaimer

This is an AI-generated artistic prediction for entertainment purposes only. It does not represent actual genetic science.

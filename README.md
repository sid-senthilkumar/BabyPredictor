# 👶 Baby Predictor

AI-powered baby face predictor. Upload photos of two parents and get a realistic portrait of what their child might look like, along with a genetic inheritance breakdown.

**Pipeline:** Claude Vision analyzes facial genetics → FLUX.1-schnell generates a 768×768 baby portrait.

---

## Adding your API keys

You have two options — pick whichever is easier.

---

### Option A — Settings UI (recommended)

1. Run the app (see [Setup](#setup) below)
2. Open `http://localhost:3939` in your browser
3. Click the **⚙️ gear icon** in the top-right corner
4. Paste your **Claude API key** (`sk-ant-...`) into the first field
5. Paste your **Together AI key** into the second field
6. Click **Save Keys**

Keys are written to `.settings.json` in the project folder — never sent anywhere except the respective APIs.

---

### Option B — Environment file

1. In the project root, copy the example file:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and fill in your keys:
   ```
   CLAUDE_API_KEY=sk-ant-api03-...
   TOGETHER_API_KEY=...
   ```
3. Save the file, then start the server. Keys in `.env` are picked up automatically.

> **Note:** `.env` and `.settings.json` are both in `.gitignore` — your keys will never be committed.

---

## Where to get the keys

| Key | Link | Notes |
|---|---|---|
| **Claude API key** | [console.anthropic.com](https://console.anthropic.com) → API Keys | Starts with `sk-ant-` |
| **Together AI key** | [api.together.ai](https://api.together.ai) → Settings → API Keys | FLUX.1-schnell is on the free tier |

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/sid-senthilkumar/BabyPredictor.git
cd BabyPredictor
npm install
```

### 2. Build the frontend

```bash
npm run build
```

### 3. Start the server

```bash
npm start
# → http://localhost:3939
```

Then add your API keys via the ⚙️ Settings screen (or via `.env` — see above).

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

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite 5 |
| Backend | Express 4 (Node 18+) |
| Face analysis | Claude Vision (`claude-opus-4-5`) |
| Image generation | Together AI — `FLUX.1-schnell-Free` |

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

## How it works

1. Both parent photos are base64-encoded in the browser and sent to `POST /api/predict`
2. The server sends both images to Claude Vision with a genetics prompt — Claude returns structured JSON with `motherFeatures`, `fatherFeatures`, `inheritance[]`, and a detailed FLUX image prompt
3. The FLUX prompt is sent to Together AI, which returns a 768×768 portrait as `b64_json`
4. The result (image + analysis) is returned to the frontend

---

## Disclaimer

This is an AI-generated artistic prediction for entertainment purposes only. It does not represent actual genetic science.

import { getSettings } from './settings.js';

const GEMINI_MODEL = 'gemini-2.0-flash';
const TOGETHER_MODEL = 'black-forest-labs/FLUX.1-schnell-Free';

export async function predictBaby({ momBase64, dadBase64, momMime, dadMime, gender }) {
    const settings = await getSettings();

    if (!settings.geminiApiKey) {
        throw new Error('Gemini API key not configured. Open Settings to add it.');
    }
    if (!settings.togetherApiKey) {
        throw new Error('Together AI API key not configured. Open Settings to add it.');
    }

    const analysis = await analyzeParents(settings.geminiApiKey, momBase64, dadBase64, momMime, dadMime, gender);
    const babyImageUrl = await generatePortrait(settings.togetherApiKey, analysis.prompt);

    return { babyImageUrl, analysis };
}

async function analyzeParents(apiKey, momBase64, dadBase64, momMime, dadMime, gender) {
    const genderLabel = gender === 'boy' ? 'baby boy' : gender === 'girl' ? 'baby girl' : 'baby';

    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { inlineData: { mimeType: momMime, data: momBase64 } },
                        { inlineData: { mimeType: dadMime, data: dadBase64 } },
                        {
                            text: `You are a genetic features analyst predicting child appearance from parent photos.
Image 1 = MOTHER. Image 2 = FATHER.

Analyze visible facial genetics of each parent using Mendelian inheritance principles:
- Darker eye colors are dominant over lighter
- Broader/stronger nose bridges tend to be dominant
- Fuller lips blend between parents
- Face shapes often blend or one dominates

Respond ONLY with valid JSON — no prose, no markdown fences:
{
  "motherFeatures": {
    "eyes": "color and shape",
    "nose": "shape description",
    "lips": "shape and fullness",
    "faceShape": "oval|round|square|heart|diamond",
    "skinTone": "description",
    "hairColor": "description"
  },
  "fatherFeatures": {
    "eyes": "color and shape",
    "nose": "shape description",
    "lips": "shape and fullness",
    "faceShape": "oval|round|square|heart|diamond",
    "skinTone": "description",
    "hairColor": "description"
  },
  "inheritance": [
    {"feature": "Eyes",       "from": "Mother", "percent": 65, "description": "one sentence about this trait in the child"},
    {"feature": "Nose",       "from": "Father", "percent": 70, "description": "one sentence"},
    {"feature": "Lips",       "from": "Both",   "percent": 50, "description": "one sentence"},
    {"feature": "Face Shape", "from": "Both",   "percent": 50, "description": "one sentence"},
    {"feature": "Skin Tone",  "from": "Both",   "percent": 50, "description": "one sentence"},
    {"feature": "Hair",       "from": "Father", "percent": 60, "description": "one sentence"}
  ],
  "prompt": "photorealistic portrait photograph, professional studio lighting, adorable ${genderLabel} toddler 2-3 years old, [REPLACE WITH SPECIFIC CHILD FEATURE DESCRIPTION blending both parents], chubby cheeks, innocent wide eyes, soft smile, neutral blurred background, Canon EOS R5, 85mm f/1.8, sharp focus, 8K, hyperrealistic"
}

In the prompt field, replace [REPLACE WITH SPECIFIC CHILD FEATURE DESCRIPTION blending both parents] with a very specific description: exact eye color+shape, nose shape, lip shape, skin tone, hair color+texture, face shape — derived from the genetic blend you predicted. Do not leave placeholder text in the prompt.`
                        }
                    ]
                }]
            })
        }
    );

    if (!res.ok) {
        const body = await res.text();
        throw new Error(`Gemini API error ${res.status}: ${body}`);
    }

    const data = await res.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Could not parse face analysis from Gemini. Please try again.');

    try {
        return JSON.parse(match[0]);
    } catch {
        throw new Error('Invalid JSON from analysis step. Please try again.');
    }
}

async function generatePortrait(apiKey, prompt) {
    const res = await fetch('https://api.together.xyz/v1/images/generations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: TOGETHER_MODEL,
            prompt,
            n: 1,
            width: 768,
            height: 768,
            steps: 4,
            response_format: 'b64_json'
        })
    });

    if (!res.ok) {
        const body = await res.text();
        throw new Error(`Together AI error ${res.status}: ${body}`);
    }

    const data = await res.json();
    const item = data.data?.[0];
    if (!item) throw new Error('No image returned from generation API.');

    if (item.b64_json) return `data:image/png;base64,${item.b64_json}`;
    if (item.url) return item.url;

    throw new Error('Unrecognized image response format.');
}

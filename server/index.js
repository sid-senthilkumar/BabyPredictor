import express from 'express';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import { getSettings, saveSettings } from './settings.js';
import { predictBaby } from './babyPredictor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3939;

app.use(express.json({ limit: '25mb' }));
app.use(express.static(join(__dirname, '../web/dist')));

app.get('/api/settings', async (req, res) => {
    const s = await getSettings();
    res.json({
        geminiApiKey:   s.geminiApiKey   ? '••••' + s.geminiApiKey.slice(-4)   : '',
        togetherApiKey: s.togetherApiKey ? '••••' + s.togetherApiKey.slice(-4) : ''
    });
});

app.post('/api/settings', async (req, res) => {
    const incoming = req.body;
    if (incoming.geminiApiKey?.startsWith('••••'))   delete incoming.geminiApiKey;
    if (incoming.togetherApiKey?.startsWith('••••')) delete incoming.togetherApiKey;
    await saveSettings(incoming);
    res.json({ ok: true });
});

app.post('/api/predict', async (req, res) => {
    try {
        const { momImage, dadImage, momMimeType, dadMimeType, gender } = req.body;
        if (!momImage || !dadImage) {
            return res.status(400).json({ error: 'Both parent photos are required.' });
        }
        const result = await predictBaby({
            momBase64: momImage,
            dadBase64: dadImage,
            momMime: momMimeType || 'image/jpeg',
            dadMime: dadMimeType || 'image/jpeg',
            gender: gender || 'surprise'
        });
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(join(__dirname, '../web/dist/index.html'));
});

createServer(app).listen(PORT, () => {
    console.log(`\n  Baby Predictor running at http://localhost:${PORT}\n`);
});

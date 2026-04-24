import React, { useState, useEffect } from 'react';

export default function Settings({ onBack }) {
    const [keys, setKeys] = useState({ geminiApiKey: '', togetherApiKey: '' });
    const [status, setStatus] = useState('idle');

    useEffect(() => {
        fetch('/api/settings').then(r => r.json()).then(setKeys);
    }, []);

    const save = async () => {
        setStatus('saving');
        const payload = { ...keys };
        if (payload.geminiApiKey?.startsWith('••••'))   delete payload.geminiApiKey;
        if (payload.togetherApiKey?.startsWith('••••')) delete payload.togetherApiKey;
        await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        setStatus('saved');
        setTimeout(() => setStatus('idle'), 2200);
    };

    return (
        <div className="app">
            <header className="app-header">
                <div className="app-brand">
                    <button className="icon-btn" onClick={onBack}>←</button>
                    <div>
                        <div className="app-name">Settings</div>
                        <div className="app-tagline">API keys are stored locally only</div>
                    </div>
                </div>
            </header>
            <main className="app-main">
                <div className="settings-form">
                    <div className="field-group">
                        <label className="field-label">Gemini API Key <span className="field-badge">Required</span></label>
                        <p className="field-desc">Used for face analysis via Gemini Vision. Get yours free at aistudio.google.com.</p>
                        <input type="password" className="field-input" placeholder="AIza..."
                            value={keys.geminiApiKey}
                            onChange={e => setKeys({ ...keys, geminiApiKey: e.target.value })} />
                    </div>
                    <div className="field-group">
                        <label className="field-label">Together AI API Key <span className="field-badge">Required</span></label>
                        <p className="field-desc">Used for FLUX image generation. Free tier at together.ai — FLUX.1‑schnell is free.</p>
                        <input type="password" className="field-input" placeholder="..."
                            value={keys.togetherApiKey}
                            onChange={e => setKeys({ ...keys, togetherApiKey: e.target.value })} />
                    </div>
                    <button className="predict-btn" onClick={save} disabled={status === 'saving'}>
                        {status === 'saving' ? 'Saving…' : status === 'saved' ? '✓ Saved' : 'Save Keys'}
                    </button>
                    <div className="settings-note">
                        Keys are written to <code>.settings.json</code> on your local machine only.
                    </div>
                </div>
            </main>
        </div>
    );
}

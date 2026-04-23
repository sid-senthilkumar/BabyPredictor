import React, { useState, useRef, useCallback } from 'react';

const LOADING_STEPS = [
    'Analyzing parent features…',
    'Predicting genetic inheritance…',
    'Generating baby portrait with FLUX…'
];

function UploadZone({ label, roleColor, photo, onPhoto, onClear }) {
    const inputRef = useRef(null);
    const [dragging, setDragging] = useState(false);

    const processFile = useCallback((file) => {
        if (!file || !file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target.result;
            const base64 = dataUrl.split(',')[1];
            onPhoto({ base64, mime: file.type, preview: dataUrl });
        };
        reader.readAsDataURL(file);
    }, [onPhoto]);

    const onDrop = useCallback((e) => {
        e.preventDefault();
        setDragging(false);
        processFile(e.dataTransfer.files[0]);
    }, [processFile]);

    const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
    const onDragLeave = () => setDragging(false);

    const zoneClass = [
        'upload-zone',
        dragging ? 'dragging' : '',
        photo ? 'has-photo' : ''
    ].filter(Boolean).join(' ');

    return (
        <div
            className={zoneClass}
            style={{ '--role-color': roleColor }}
            onClick={() => !photo && inputRef.current?.click()}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
        >
            {photo ? (
                <>
                    <img className="photo-img" src={photo.preview} alt={label} />
                    <div className="photo-overlay">
                        <button className="overlay-btn" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>Change</button>
                        <button className="overlay-btn" onClick={(e) => { e.stopPropagation(); onClear(); }}>Remove</button>
                    </div>
                    <div className="photo-label">{label}</div>
                </>
            ) : (
                <div className="upload-placeholder">
                    <div className="upload-icon">📷</div>
                    <div className="upload-label">{label}</div>
                    <div className="upload-hint">Drop photo or tap to browse</div>
                </div>
            )}
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => processFile(e.target.files[0])}
            />
        </div>
    );
}

function InheritanceRow({ feature, from, percent, description }) {
    const fromLower = from?.toLowerCase();
    const fillColor = fromLower === 'mother' ? 'var(--mom)' : fromLower === 'father' ? 'var(--dad)' : 'var(--both)';
    const fromLabel = from || 'Both';

    return (
        <div className="inh-row">
            <div className="inh-top">
                <span className="inh-feature">{feature}</span>
                <span className="inh-from" style={{ color: fillColor }}>{fromLabel} · {percent}%</span>
            </div>
            <div className="inh-track">
                <div className="inh-fill" style={{ width: `${percent}%`, background: fillColor }} />
            </div>
            <div className="inh-desc">{description}</div>
        </div>
    );
}

function FeatureGrid({ motherFeatures, fatherFeatures }) {
    const keys = ['eyes', 'nose', 'lips', 'faceShape', 'skinTone', 'hairColor'];
    const labels = { eyes: 'Eyes', nose: 'Nose', lips: 'Lips', faceShape: 'Face Shape', skinTone: 'Skin Tone', hairColor: 'Hair' };

    return (
        <div className="pf-grid">
            <div className="pf-col">
                <div className="pf-heading" style={{ color: 'var(--mom)' }}>Mother</div>
                {keys.map(k => (
                    <div className="pf-item" key={k}>
                        <span className="pf-key">{labels[k]}</span>
                        <span className="pf-val">{motherFeatures?.[k] || '—'}</span>
                    </div>
                ))}
            </div>
            <div className="pf-col">
                <div className="pf-heading" style={{ color: 'var(--dad)' }}>Father</div>
                {keys.map(k => (
                    <div className="pf-item" key={k}>
                        <span className="pf-key">{labels[k]}</span>
                        <span className="pf-val">{fatherFeatures?.[k] || '—'}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function BabyPredictor({ onSettingsClick }) {
    const [momPhoto, setMomPhoto] = useState(null);
    const [dadPhoto, setDadPhoto] = useState(null);
    const [gender, setGender] = useState('surprise');
    const [loading, setLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState(0);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const canPredict = momPhoto && dadPhoto && !loading;

    const stepForward = (stepIndex) => {
        setLoadingStep(stepIndex);
    };

    const predict = async () => {
        if (!canPredict) return;
        setLoading(true);
        setError('');
        setResult(null);
        setLoadingStep(0);

        const stepTimer1 = setTimeout(() => stepForward(1), 3000);
        const stepTimer2 = setTimeout(() => stepForward(2), 6000);

        try {
            const res = await fetch('/api/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    momImage: momPhoto.base64,
                    dadImage: dadPhoto.base64,
                    momMimeType: momPhoto.mime,
                    dadMimeType: dadPhoto.mime,
                    gender
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Prediction failed.');
            setResult(data);
        } catch (err) {
            setError(err.message);
        } finally {
            clearTimeout(stepTimer1);
            clearTimeout(stepTimer2);
            setLoading(false);
        }
    };

    const download = () => {
        if (!result?.babyImageUrl) return;
        const a = document.createElement('a');
        a.href = result.babyImageUrl;
        a.download = 'baby-prediction.png';
        a.click();
    };

    const reset = () => {
        setResult(null);
        setError('');
        setLoadingStep(0);
    };

    return (
        <div className="app">
            <header className="app-header">
                <div className="app-brand">
                    <div className="app-logo">👶</div>
                    <div>
                        <div className="app-name">Baby Predictor</div>
                        <div className="app-tagline">AI-powered child face prediction</div>
                    </div>
                </div>
                <button className="icon-btn" onClick={onSettingsClick} title="Settings">⚙️</button>
            </header>

            <main className="app-main">
                <div className="how-it-works">
                    <div className="step-pill"><span className="step-num">1</span>Upload parent photos</div>
                    <div className="step-pill"><span className="step-num">2</span>Claude analyzes genetics</div>
                    <div className="step-pill"><span className="step-num">3</span>FLUX generates portrait</div>
                </div>

                {!result && (
                    <>
                        <div className="upload-row">
                            <UploadZone
                                label="Mother"
                                roleColor="var(--mom)"
                                photo={momPhoto}
                                onPhoto={setMomPhoto}
                                onClear={() => setMomPhoto(null)}
                            />
                            <div className="upload-separator">
                                <div className="separator-heart">♥</div>
                            </div>
                            <UploadZone
                                label="Father"
                                roleColor="var(--dad)"
                                photo={dadPhoto}
                                onPhoto={setDadPhoto}
                                onClear={() => setDadPhoto(null)}
                            />
                        </div>

                        <div className="gender-section">
                            <div className="gender-label">Baby gender</div>
                            <div className="gender-row">
                                {[['girl', '👧 Girl'], ['boy', '👦 Boy'], ['surprise', '🎁 Surprise']].map(([val, lbl]) => (
                                    <button
                                        key={val}
                                        className={`gender-btn${gender === val ? ' active' : ''}`}
                                        onClick={() => setGender(val)}
                                    >{lbl}</button>
                                ))}
                            </div>
                        </div>

                        <button className="predict-btn" onClick={predict} disabled={!canPredict}>
                            {loading ? (
                                <span className="btn-loading">
                                    <span className="spinner" />
                                    {LOADING_STEPS[loadingStep]}
                                </span>
                            ) : 'Predict Baby ✨'}
                        </button>

                        {!momPhoto && !dadPhoto && (
                            <p className="upload-tip">Upload a photo of each parent to get started.</p>
                        )}

                        {error && <div className="error-box">{error}</div>}
                    </>
                )}

                {result && (
                    <div className="results">
                        <div className="result-frame">
                            <img className="result-img" src={result.babyImageUrl} alt="Predicted baby" />
                            <div className="result-badge">AI Generated</div>
                        </div>

                        <div className="result-btns">
                            <button className="btn-primary" onClick={download}>⬇ Download</button>
                            <button className="btn-secondary" onClick={reset}>↩ Try Again</button>
                        </div>

                        {result.analysis?.inheritance?.length > 0 && (
                            <div className="section">
                                <div className="section-title">Genetic Inheritance</div>
                                <div className="legend">
                                    <span className="legend-dot" style={{ background: 'var(--mom)' }} />Mom
                                    <span className="legend-dot" style={{ background: 'var(--dad)' }} />Dad
                                    <span className="legend-dot" style={{ background: 'var(--both)' }} />Both
                                </div>
                                {result.analysis.inheritance.map((row, i) => (
                                    <InheritanceRow key={i} {...row} />
                                ))}
                            </div>
                        )}

                        {(result.analysis?.motherFeatures || result.analysis?.fatherFeatures) && (
                            <div className="section">
                                <div className="section-title">Parent Features</div>
                                <FeatureGrid
                                    motherFeatures={result.analysis.motherFeatures}
                                    fatherFeatures={result.analysis.fatherFeatures}
                                />
                            </div>
                        )}

                        <p className="disclaimer">
                            This is an AI-generated artistic prediction for entertainment purposes only.
                            It does not represent actual genetic science.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}

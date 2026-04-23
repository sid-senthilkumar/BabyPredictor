import React, { useState } from 'react';
import BabyPredictor from './components/BabyPredictor.jsx';
import Settings from './components/Settings.jsx';

export default function App() {
    const [view, setView] = useState('home');

    if (view === 'settings') {
        return <Settings onBack={() => setView('home')} />;
    }

    return <BabyPredictor onSettingsClick={() => setView('settings')} />;
}

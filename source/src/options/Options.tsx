import React, { useState, useEffect } from 'react';
import './Options.css';

interface Settings {
  apiKey: string;
  targetLanguage: string;
  isEnabled: boolean;
}

const LANGUAGES = [
  { code: 'Hindi', name: 'Hindi (हिंदी)' },
  { code: 'Tamil', name: 'Tamil (தமிழ்)' },
  { code: 'Telugu', name: 'Telugu (తెలుగు)' },
  { code: 'English', name: 'English' },
  { code: 'Spanish', name: 'Spanish (Español)' },
  { code: 'French', name: 'French (Français)' },
  { code: 'German', name: 'German (Deutsch)' },
  { code: 'Japanese', name: 'Japanese (日本語)' },
  { code: 'Korean', name: 'Korean (한국어)' },
  { code: 'Chinese', name: 'Chinese (中文)' }
];

const Options: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({
    apiKey: '',
    targetLanguage: 'Hindi',
    isEnabled: true
  });
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    chrome.storage.local.get(['apiKey', 'targetLanguage', 'isEnabled'], (result) => {
      setSettings({
        apiKey: result.apiKey || '',
        targetLanguage: result.targetLanguage || 'Hindi',
        isEnabled: result.isEnabled !== false
      });
    });
  }, []);

  const handleSave = () => {
    chrome.storage.local.set(settings, () => {
      setStatus('Settings saved successfully!');
      setTimeout(() => setStatus(''), 3000);
    });
  };

  return (
    <div className="options-container">
      <header className="options-header">
        <div className="logo-container">
          <svg width="32" height="32" viewBox="0 0 128 128">
            <rect width="128" height="128" rx="28" fill="#1d9bf0" />
            <path d="M70 55 L100 85 M100 55 L70 85" stroke="white" stroke-width="10" />
          </svg>
          <h1>Tweet Auto Translator</h1>
        </div>
      </header>

      <div className="settings-card">
        <div className="input-group">
          <label>GROQ API Key</label>
          <input
            type="password"
            placeholder="gsk_..."
            value={settings.apiKey}
            onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
          />
          <small>Get your key from <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer">GROQ Console</a></small>
        </div>

        <div className="input-group">
          <label>Target Language</label>
          <select
            value={settings.targetLanguage}
            onChange={(e) => setSettings({ ...settings, targetLanguage: e.target.value })}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <div className="toggle-group">
          <label className="switch">
            <input
              type="checkbox"
              checked={settings.isEnabled}
              onChange={(e) => setSettings({ ...settings, isEnabled: e.target.checked })}
            />
            <span className="slider round"></span>
          </label>
          <span>Enable Auto-Translation</span>
        </div>

        <button className="save-button" onClick={handleSave}>
          Save Configuration
        </button>

        {status && <div className="status-message">{status}</div>}
      </div>

      <div className="info-footer">
        <p>This extension runs automatically on X.com and Twitter.com.</p>
        <p>It respects your privacy: only tweet text is sent to GROQ for translation.</p>
      </div>
    </div>
  );
};

export default Options;
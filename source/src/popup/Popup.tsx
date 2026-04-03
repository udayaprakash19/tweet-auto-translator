import React, { useState, useEffect } from 'react';
import './Popup.css';

const Popup: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    chrome.storage.local.get(['isEnabled'], (result) => {
      setIsEnabled(result.isEnabled !== false);
    });
  }, []);

  const toggleTranslation = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    chrome.storage.local.set({ isEnabled: newState });
  };

  const openOptions = () => {
    chrome.runtime.openOptionsPage();
  };

  return (
    <div className="popup-container">
      <div className="popup-header">
        <svg width="24" height="24" viewBox="0 0 128 128">
          <rect width="128" height="128" rx="28" fill="#1d9bf0" />
          <path d="M70 55 L100 85 M100 55 L70 85" stroke="white" stroke-width="10" />
        </svg>
        <span>Tweet Translator</span>
      </div>
      
      <div className="popup-content">
        <div className="status-row">
          <span>Auto-Translate</span>
          <button 
            className={`toggle-btn ${isEnabled ? 'on' : 'off'}`}
            onClick={toggleTranslation}
          >
            {isEnabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>
        
        <button className="settings-link" onClick={openOptions}>
          Open All Settings
        </button>
      </div>
    </div>
  );
};

export default Popup;
/**
 * Content Script for Tweet Auto Translator
 */

let API_KEY = '';
let TARGET_LANG = 'Hindi';
let IS_ENABLED = true;

// Rate limiting queue
const requestQueue: string[] = [];
let isProcessing = false;
const CALLS_PER_SECOND = 5;
const DELAY_BETWEEN_CALLS = 1000 / CALLS_PER_SECOND;

const loadSettings = () => {
  chrome.storage.local.get(['apiKey', 'targetLanguage', 'isEnabled'], (result) => {
    API_KEY = result.apiKey || '';
    TARGET_LANG = result.targetLanguage || 'Hindi';
    IS_ENABLED = result.isEnabled !== false;
  });
};

// Character set detection for Hindi (Devanagari)
const isHindi = (text: string): boolean => {
  return /[\u0900-\u097F]/.test(text);
};

// General language pattern check (heuristics)
const shouldTranslate = (text: string, targetLang: string): boolean => {
  if (!text || text.length < 3) return false;
  
  if (targetLang === 'Hindi') {
    return !isHindi(text);
  }
  
  // For other languages, we assume we should translate if it's not the target script
  // This is a simple fallback for this specific logic requirement
  return true; 
};

const translateText = async (text: string): Promise<string | null> => {
  try {
    // Send message to background script to bypass CORS
    const response = await new Promise<any>((resolve) => {
      chrome.runtime.sendMessage({
        action: 'translate',
        text: text,
        targetLang: TARGET_LANG,
        apiKey: API_KEY
      }, resolve);
    });

    if (response && response.error) {
      console.error('[TweetTranslator] Background returned error:', response.error);
      return null;
    }

    return response?.translatedText || null;
  } catch (error) {
    console.error('[TweetTranslator] Messaging Error:', error);
    return null;
  }
};

const processQueue = async () => {
  if (isProcessing || requestQueue.length === 0) return;
  isProcessing = true;

  while (requestQueue.length > 0) {
    const task = requestQueue.shift();
    if (task) {
      // In a real implementation, we would associate the task with its DOM element
      // For this simplified logic, we process inside the MutationObserver directly
      // using a local throttler to maintain the 5/sec limit.
    }
    await new Promise(r => setTimeout(r, DELAY_BETWEEN_CALLS));
  }
  isProcessing = false;
};

const injectTranslation = (tweetElement: HTMLElement, translatedText: string) => {
  const container = document.createElement('div');
  container.className = 'tweet-auto-translation';
  container.style.marginTop = '12px';
  container.style.paddingLeft = '12px';
  container.style.borderLeft = '3px solid #1d9bf0'; // Subtle left border
  container.style.color = '#eff3f4';
  
  const label = document.createElement('div');
  label.innerText = `Translated to ${TARGET_LANG}`;
  label.style.fontSize = '12px';
  label.style.color = '#71767b';
  label.style.marginBottom = '4px';
  label.style.fontWeight = 'bold';
  
  const text = document.createElement('div');
  text.innerText = translatedText;
  text.style.fontSize = '15px';
  text.style.lineHeight = '20px';

  container.appendChild(label);
  container.appendChild(text);
  
  // Inject directly AFTER the tweet text element to avoid breaking internal DOM structure
  tweetElement.insertAdjacentElement('afterend', container);
  tweetElement.setAttribute('data-translated', 'true');
};

let lastCallTime = 0;
const throttleCall = async () => {
  const now = Date.now();
  const timeSinceLast = now - lastCallTime;
  if (timeSinceLast < DELAY_BETWEEN_CALLS) {
    await new Promise(r => setTimeout(r, DELAY_BETWEEN_CALLS - timeSinceLast));
  }
  lastCallTime = Date.now();
};

const findTweetsAndTranslate = async () => {
  if (!IS_ENABLED || !API_KEY) return;

  const tweetTexts = document.querySelectorAll('[data-testid="tweetText"]:not([data-translated])');
  
  for (const tweet of tweetTexts) {
    const htmlElement = tweet as HTMLElement;
    const text = htmlElement.innerText;

    if (shouldTranslate(text, TARGET_LANG)) {
      // Prevent double processing while waiting for API
      htmlElement.setAttribute('data-translated', 'pending');
      
      await throttleCall();
      const translation = await translateText(text);
      
      if (translation) {
        injectTranslation(htmlElement, translation);
      } else {
        htmlElement.removeAttribute('data-translated'); // Retry later if failed
      }
    } else {
      htmlElement.setAttribute('data-translated', 'skipped');
    }
  }
};

// Initialize
loadSettings();

// Watch for storage changes
chrome.storage.onChanged.addListener((changes) => {
  if (changes.apiKey) API_KEY = changes.apiKey.newValue;
  if (changes.targetLanguage) TARGET_LANG = changes.targetLanguage.newValue;
  if (changes.isEnabled) IS_ENABLED = changes.isEnabled.newValue;
});

// Observe page changes (Twitter is SPA)
const observer = new MutationObserver(() => {
  findTweetsAndTranslate();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

console.log('[TweetTranslator] Content script loaded');

export {};
chrome.runtime.onInstalled.addListener(() => {
  console.log('[TweetTranslator] Extension installed');
  // Set defaults
  chrome.storage.local.get(['targetLanguage', 'isEnabled'], (result) => {
    if (result.targetLanguage === undefined) {
      chrome.storage.local.set({ targetLanguage: 'Hindi' });
    }
    if (result.isEnabled === undefined) {
      chrome.storage.local.set({ isEnabled: true });
    }
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'translate') {
    handleTranslation(request.text, request.targetLang, request.apiKey)
      .then(sendResponse)
      .catch(err => {
        console.error('[TweetTranslator] Background Translation Error:', err);
        sendResponse({ error: err.message || 'Translation failed' });
      });
    
    // Return true to indicate that the response will be sent asynchronously
    return true; 
  }
});

async function handleTranslation(text: string, targetLang: string, apiKey: string) {
  // Use provided key from storage, fallback to environment variable
  const keyToUse = apiKey;
  
  if (!keyToUse) {
    console.error('[TweetTranslator] No API key available. Please configure in options.');
    return { error: 'No API key configured' };
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${keyToUse}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", // Upgraded to a highly versatile model
        messages: [
          { 
            role: "system", 
            content: `You are an expert translator. Translate the following text to ${targetLang}. Return ONLY the translated text, nothing else. Do not include quotes or conversational filler.` 
          },
          { role: "user", content: text }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
       const errText = await response.text();
       console.error(`[TweetTranslator] API Error ${response.status}:`, errText);
       return { error: `API Error ${response.status}` };
    }

    const data = await response.json();
    return { translatedText: data.choices[0]?.message?.content?.trim() || null };
  } catch (error: any) {
    console.error('[TweetTranslator] Fetch Error:', error);
    return { error: error.message || 'Network request failed' };
  }
}

export {};
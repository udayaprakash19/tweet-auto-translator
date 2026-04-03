# AutoPostTranslate

> Automatically translates text posts on any webpage into your preferred language.

## The Problem

@b_nnett on X/Twitter asked if there was a Chrome extension to automatically translate posts. This is a common need for those who follow international content. A seamless automatic translator would be a huge time-saver.

[Original request by @b_nnett](https://x.com/b_nnett/status/2038052929727525133) on X/Twitter.

## What It Does

- Automatically translates text on webpages.
- Allows the user to select their preferred language via a popup.
- Persists language preference across sessions.

## How to Install

1. Download/clone this repo
2. Open `chrome://extensions`
3. Enable **Developer Mode**
4. Click **Load unpacked**
5. Select the project folder
6. The extension appears in your toolbar

## How It Works

The extension injects a content script into all webpages. This script identifies text nodes and uses the Google Translate API to translate the text. User preferences are stored using `chrome.storage.sync`.

## API Key Setup

This extension requires a **GROQ API key** to function. You need to set it up before use:

1. Go to [console.groq.com/keys](https://console.groq.com/keys) and create a free API key.
2. Click the extension icon in your toolbar and open **Settings** (or right-click the extension and select **Options**).
3. Paste your API key into the **GROQ API Key** field and click **Save Configuration**.

> **Note:** Never share or commit your real API key.

### For Developers

If you want to modify the source code, the original source files are in the `source/` directory. After making changes:

1. Replace `YOUR_GROQ_API_KEY_HERE` in `source/.env` with your actual key.
2. Run `npm install && npm run build` from the `source/` directory to rebuild.

## Built With

[![Built with PlugThis.ai](https://plugthis.ai/plugthis-og.png)](https://plugthis.ai)

Built in 2 min with [PlugThis](https://plugthis.ai). Describe any extension, get it built. [Try it](https://plugthis.ai) — LTDs from $89.

## Contributing

PRs welcome.

## License

MIT

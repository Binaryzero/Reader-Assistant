// content.js

// Constants
const FONT_SIZE_STEP = 0.025;
const MIN_LINE_SPACING = 1;
const MAX_LINE_SPACING = 2;
const MIN_COLUMN_WIDTH = 50;
const MAX_COLUMN_WIDTH = 100;
const DEFAULT_LINE_SPACING = 1.5;
const DEFAULT_COLUMN_WIDTH = 80;

// State
let currentURL = '';
let siteSettings = {
  darkMode: false,
  fontSizeAdjustment: 0,
  openDyslexicActive: false,
  readerModeActive: false,
  lineSpacing: DEFAULT_LINE_SPACING,
  columnWidth: DEFAULT_COLUMN_WIDTH
};

// Utility Functions
function getCurrentURL() {
  return window.location.hostname;
}

function isAnyFeatureActive() {
  return siteSettings.darkMode || 
         siteSettings.fontSizeAdjustment !== 0 || 
         siteSettings.openDyslexicActive || 
         siteSettings.readerModeActive;
}

// Settings Management
function loadSettings() {
  currentURL = getCurrentURL();
  chrome.storage.sync.get(currentURL, (result) => {
    if (chrome.runtime.lastError) {
      console.error('Error loading settings:', chrome.runtime.lastError);
      return;
    }
    if (result[currentURL]) {
      siteSettings = { ...siteSettings, ...result[currentURL] };
    }
    applySettings();
  });
}

function saveSettings() {
  const data = { [currentURL]: siteSettings };
  chrome.storage.sync.set(data, () => {
    if (chrome.runtime.lastError) {
      console.error('Error saving settings:', chrome.runtime.lastError);
    }
  });
}

function resetSiteSettings() {
  chrome.storage.sync.remove(currentURL, () => {
    if (chrome.runtime.lastError) {
      console.error('Error resetting settings:', chrome.runtime.lastError);
      return;
    }
    siteSettings = {
      darkMode: false,
      fontSizeAdjustment: 0,
      openDyslexicActive: false,
      readerModeActive: false,
      lineSpacing: DEFAULT_LINE_SPACING,
      columnWidth: DEFAULT_COLUMN_WIDTH
    };
    applySettings();
  });
}

// Style Management
function injectStyles() {
  if (!document.getElementById('extension-styles')) {
    const style = document.createElement('style');
    style.id = 'extension-styles';
    document.head.appendChild(style);
  }
}

function removeInjectedStyles() {
  const style = document.getElementById('extension-styles');
  if (style) {
    style.remove();
  }
}

function updateStyles() {
  const style = document.getElementById('extension-styles');
  if (!style) return;

  const darkModeStyles = `
    html, body {
      background-color: #222 !important;
      color: #ddd !important;
    }
    * {
      color: #ddd !important;
      border-color: #444 !important;
    }
    div, p, header, footer, nav, article, aside, section, main {
      background-color: #222 !important;
    }
    input, textarea, select {
      background-color: #333 !important;
      color: #ddd !important;
      border-color: #555 !important;
    }
    a, a:visited, a:active {
      color: #9cf !important;
    }
    pre, code {
      background-color: #2d2d2d !important;
      color: #f0f0f0 !important;
    }
  `;

  const lightModeStyles = `
    html, body {
      background-color: #fff !important;
      color: #333 !important;
    }
    * {
      color: #333 !important;
      border-color: #ccc !important;
    }
    div, p, header, footer, nav, article, aside, section, main {
      background-color: #fff !important;
    }
    input, textarea, select {
      background-color: #fff !important;
      color: #333 !important;
      border-color: #ccc !important;
    }
    a, a:visited, a:active {
      color: #0645ad !important;
    }
    pre, code {
      background-color: #f0f0f0 !important;
      color: #333 !important;
    }
  `;

  style.textContent = `
    @font-face {
      font-family: 'OpenDyslexic';
      src: url('chrome-extension://__MSG_@@extension_id__/fonts/OpenDyslexic-Regular.otf') format('opentype');
    }

    ${siteSettings.darkMode ? darkModeStyles : lightModeStyles}

    /* Preserve original colors for media elements */
    img, video, picture, canvas, svg, [style*="background-image"], iframe, .preserve-color {
      background-color: transparent !important;
      filter: none !important;
    }

    *:not(img) {
      ${siteSettings.fontSizeAdjustment !== 0 ? `font-size: calc(1em * (1 + ${siteSettings.fontSizeAdjustment * 0.5})) !important;` : ''}
      ${siteSettings.openDyslexicActive ? "font-family: 'OpenDyslexic', sans-serif !important;" : ""}
    }

    ${siteSettings.readerModeActive ? `
      .reader-mode-container {
        max-width: 100%;
        margin: 0 auto;
        padding: 20px;
        box-sizing: border-box;
      }
      .reader-content {
        width: 100%;
        max-width: ${siteSettings.columnWidth}%;
        margin: 0 auto;
        line-height: ${siteSettings.lineSpacing};
        font-size: ${16 * (1 + siteSettings.fontSizeAdjustment * 0.5)}px;
      }
      @media (max-width: 768px) {
        .reader-content {
          width: 95%;
          max-width: none;
        }
      }
      .reader-controls {
        position: fixed;
        top: 10px;
        right: 10px;
        background: ${siteSettings.darkMode ? '#333' : '#f0f0f0'};
        padding: 10px;
        border-radius: 5px;
        z-index: 9999;
      }
      .reader-controls button {
        margin: 0 5px;
        background: ${siteSettings.darkMode ? '#555' : '#ddd'};
        color: ${siteSettings.darkMode ? '#ddd' : '#333'};
        border: none;
        padding: 5px 10px;
        cursor: pointer;
        border-radius: 3px;
      }
      .reader-controls button:hover {
        background: ${siteSettings.darkMode ? '#777' : '#bbb'};
      }
    ` : ''}
  `;
}

// Feature Toggle Functions
function toggleDarkMode() {
  siteSettings.darkMode = !siteSettings.darkMode;
  applySettings();
  saveSettings();
}

function adjustFontSize(change) {
  siteSettings.fontSizeAdjustment += change * FONT_SIZE_STEP;
  applySettings();
  saveSettings();
}

function toggleOpenDyslexic() {
  siteSettings.openDyslexicActive = !siteSettings.openDyslexicActive;
  applySettings();
  saveSettings();
}

function toggleReaderMode() {
  console.log("Toggling reader mode. Current state:", siteSettings.readerModeActive);
  siteSettings.readerModeActive = !siteSettings.readerModeActive;
  console.log("New reader mode state:", siteSettings.readerModeActive);
  
  if (siteSettings.readerModeActive) {
    console.log("Enabling reader mode");
    enableReaderMode();
  } else {
    console.log("Disabling reader mode");
    disableReaderMode();
  }
  
  applySettings();
  saveSettings();
  console.log("Reader mode toggle complete. Current state:", siteSettings.readerModeActive);
}

function enableReaderMode() {
  console.log("Enabling reader mode");
  if (!document.body.classList.contains('reader-mode')) {
    const content = extractMainContent();
    const readerModeContainer = createReaderModeContainer(content);
    document.body.innerHTML = '';
    document.body.appendChild(readerModeContainer);
    document.body.classList.add('reader-mode');
    addReaderModeListeners();
  }
}

function adjustLineSpacing(change) {
  siteSettings.lineSpacing = Math.max(MIN_LINE_SPACING, Math.min(MAX_LINE_SPACING, siteSettings.lineSpacing + change));
  applySettings();
  saveSettings();
}

function adjustColumnWidth(change) {
  siteSettings.columnWidth = Math.max(MIN_COLUMN_WIDTH, Math.min(MAX_COLUMN_WIDTH, siteSettings.columnWidth + change));
  applySettings();
  saveSettings();
}

// Reader Mode Functions
function enableReaderMode() {
  if (!document.body.classList.contains('reader-mode')) {
    const content = extractMainContent();
    const readerModeContainer = createReaderModeContainer(content);
    document.body.innerHTML = '';
    document.body.appendChild(readerModeContainer);
    document.body.classList.add('reader-mode');
    addReaderModeListeners();
  }
}

function disableReaderMode() {
  document.body.classList.remove('reader-mode');
  location.reload();
}

function extractMainContent() {
  // Since we can't use the Readability library directly in a content script,
  // we'll use a simplified content extraction method
  const article = document.querySelector('article');
  if (article) {
    return article.innerHTML;
  }
  
  const main = document.querySelector('main');
  if (main) {
    return main.innerHTML;
  }
  
  // If no article or main tag is found, return the body content
  return document.body.innerHTML;
}

function createReaderModeContainer(content) {
  const container = document.createElement('div');
  container.className = 'reader-mode-container';
  container.innerHTML = `
    <div class="reader-controls">
      <button id="toggleDarkMode" title="Toggle Dark Mode">🌓</button>
      <button id="increaseFontSize" title="Increase Font Size">A+</button>
      <button id="decreaseFontSize" title="Decrease Font Size">A-</button>
      <button id="toggleOpenDyslexic" title="Toggle OpenDyslexic Font">Dy</button>
      <button id="increaseLineSpacing" title="Increase Line Spacing">↕+</button>
      <button id="decreaseLineSpacing" title="Decrease Line Spacing">↕-</button>
      <button id="increaseWidth" title="Increase Column Width">↔+</button>
      <button id="decreaseWidth" title="Decrease Column Width">↔-</button>
      <button id="exitReaderMode" title="Exit Reader Mode">✕</button>
    </div>
    <div class="reader-content">${content}</div>
  `;
  
  return container;
}

function addReaderModeListeners() {
  const addListener = (id, func) => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('click', func);
    } else {
      console.error(`Element with id '${id}' not found`);
    }
  };

  addListener('toggleDarkMode', toggleDarkMode);
  addListener('increaseFontSize', () => adjustFontSize(1));
  addListener('decreaseFontSize', () => adjustFontSize(-1));
  addListener('toggleOpenDyslexic', toggleOpenDyslexic);
  addListener('increaseLineSpacing', () => adjustLineSpacing(0.1));
  addListener('decreaseLineSpacing', () => adjustLineSpacing(-0.1));
  addListener('increaseWidth', () => adjustColumnWidth(5));
  addListener('decreaseWidth', () => adjustColumnWidth(-5));
  addListener('exitReaderMode', toggleReaderMode);
}

// Main Functions
function applySettings() {
  if (isAnyFeatureActive()) {
    injectStyles();
    updateStyles();
    document.documentElement.classList.toggle('dark-mode', siteSettings.darkMode);
  } else {
    removeInjectedStyles();
    document.documentElement.classList.remove('dark-mode');
  }
}

function initExtension() {
  loadSettings();
  
  // Set up MutationObserver to watch for DOM changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        applySettings();
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received in content script:", request);
  const actions = {
    toggleDarkMode,
    increaseFontSize: () => adjustFontSize(1),
    decreaseFontSize: () => adjustFontSize(-1),
    toggleOpenDyslexic,
    toggleReaderMode,
    resetSite: resetSiteSettings
  };

  if (actions[request.action]) {
    console.log("Executing action:", request.action);
    try {
      actions[request.action]();
      console.log("Action executed successfully:", request.action);
      if (request.action === 'toggleReaderMode') {
        console.log("Reader mode state after toggle:", siteSettings.readerModeActive);
      }
      sendResponse({status: "Action executed: " + request.action, success: true});
    } catch (error) {
      console.error("Error executing action:", request.action, error);
      sendResponse({status: "Error executing action: " + request.action, success: false, error: error.message});
    }
  } else {
    console.error("Unknown action:", request.action);
    sendResponse({status: "Error: Unknown action", success: false});
  }
  return true; // Indicates that the response will be sent asynchronously
});

// Run the initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initExtension);
} else {
  initExtension();
}

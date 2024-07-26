// content.js
let currentURL = '';
let siteSettings = {
  darkMode: false,
  fontSizeAdjustment: 0,
  openDyslexicActive: false,
  readerModeActive: false,
  lineSpacing: 1.5,
  columnWidth: 80
};

const fontSizeStep = 0.1;

function getCurrentURL() {
  return window.location.hostname;
}

function loadSettings() {
  currentURL = getCurrentURL();
  chrome.storage.sync.get(currentURL, (result) => {
    if (result[currentURL]) {
      siteSettings = result[currentURL];
    }
    applySettings();
  });
}

function saveSettings() {
  let data = {};
  data[currentURL] = siteSettings;
  chrome.storage.sync.set(data);
}

function isAnyFeatureActive() {
  return siteSettings.darkMode || 
         siteSettings.fontSizeAdjustment !== 0 || 
         siteSettings.openDyslexicActive || 
         siteSettings.readerModeActive;
}

function applySettings() {
  if (isAnyFeatureActive()) {
    injectStyles();
    updateStyles();
    if (siteSettings.readerModeActive) {
      enableReaderMode();
    }
    if (siteSettings.darkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  } else {
    removeInjectedStyles();
    document.documentElement.classList.remove('dark-mode');
    if (document.body.classList.contains('reader-mode')) {
      disableReaderMode();
    }
  }
}

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

  style.textContent = `
    @font-face {
      font-family: 'OpenDyslexic';
      src: url('chrome-extension://__MSG_@@extension_id__/fonts/OpenDyslexic-Regular.otf') format('opentype');
    }

    :root {
      --main-bg: ${siteSettings.darkMode ? '#1a1a1a' : '#ffffff'};
      --main-text: ${siteSettings.darkMode ? '#f0f0f0' : '#333333'};
      --link-color: ${siteSettings.darkMode ? '#6699cc' : '#0000EE'};
      --border-color: ${siteSettings.darkMode ? '#555' : '#ccc'};
    }

    html {
      ${siteSettings.darkMode ? `
        filter: invert(100%) hue-rotate(180deg) !important;
        background-color: #000 !important;
      ` : ''}
    }

    body {
      ${siteSettings.darkMode ? `
        background-color: #fff !important;
      ` : ''}
    }

    video, picture, [style*="background-image"] {
      ${siteSettings.darkMode ? `
        filter: invert(100%) hue-rotate(180deg) !important;
      ` : ''}
    }
    img {
      filter: none !important;
    }

    /* Preserve original colors for these elements */
    iframe, .preserve-color {
      ${siteSettings.darkMode ? `
        filter: invert(100%) hue-rotate(180deg) !important;
      ` : ''}
    }

    /* Adjust input elements */
    input, textarea, select {
      ${siteSettings.darkMode ? `
        background-color: #222 !important;
        color: #ddd !important;
        border-color: #444 !important;
      ` : ''}
    }

    /* Adjust link colors */
    a, a:visited, a:active {
      ${siteSettings.darkMode ? `
        color: #3391ff !important;
      ` : ''}
    }

    *:not(img) {
      ${siteSettings.fontSizeAdjustment !== 0 ? `font-size: calc(1em + ${siteSettings.fontSizeAdjustment}em) !important;` : ''}
      ${siteSettings.openDyslexicActive ? "font-family: 'OpenDyslexic', sans-serif !important;" : ""}
    }
    img {
      filter: none !important;
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
        font-size: ${16 + siteSettings.fontSizeAdjustment * 10}px;
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
        background: var(--main-bg);
        padding: 10px;
        border-radius: 5px;
        z-index: 9999;
      }
      .reader-controls button {
        margin: 0 5px;
        background: ${siteSettings.darkMode ? '#555' : '#f0f0f0'};
        color: var(--main-text);
        border: none;
        padding: 5px 10px;
        cursor: pointer;
      }
    ` : ''}
  `;
}

function toggleDarkMode() {
  siteSettings.darkMode = !siteSettings.darkMode;
  applySettings();
  saveSettings();
}

function adjustFontSize(change) {
  siteSettings.fontSizeAdjustment += change * fontSizeStep;
  applySettings();
  saveSettings();
}

function toggleOpenDyslexic() {
  siteSettings.openDyslexicActive = !siteSettings.openDyslexicActive;
  applySettings();
  saveSettings();
}

function toggleReaderMode() {
  siteSettings.readerModeActive = !siteSettings.readerModeActive;
  applySettings();
  saveSettings();
}

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
  const article = document.querySelector('article') || document.querySelector('main') || document.body;
  return article.innerHTML;
}

function createReaderModeContainer(content) {
  const container = document.createElement('div');
  container.className = 'reader-mode-container';
  container.innerHTML = `
    <div class="reader-controls">
      <button id="toggleDarkMode">🌓</button>
      <button id="increaseFontSize">A+</button>
      <button id="decreaseFontSize">A-</button>
      <button id="toggleOpenDyslexic">Dy</button>
      <button id="increaseLineSpacing">↕+</button>
      <button id="decreaseLineSpacing">↕-</button>
      <button id="increaseWidth">↔+</button>
      <button id="decreaseWidth">↔-</button>
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
}

function adjustLineSpacing(change) {
  siteSettings.lineSpacing = Math.max(1, Math.min(2, siteSettings.lineSpacing + change));
  applySettings();
  saveSettings();
}

function adjustColumnWidth(change) {
  siteSettings.columnWidth = Math.max(50, Math.min(100, siteSettings.columnWidth + change));
  applySettings();
  saveSettings();
}

function resetSiteSettings() {
  chrome.storage.sync.remove(currentURL, () => {
    siteSettings = {
      darkMode: false,
      fontSizeAdjustment: 0,
      openDyslexicActive: false,
      readerModeActive: false,
      lineSpacing: 1.5,
      columnWidth: 80
    };
    applySettings();
  });
}

// Initialize extension
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
  if (request.action === 'toggleDarkMode') {
    toggleDarkMode();
  } else if (request.action === 'increaseFontSize') {
    adjustFontSize(1);
  } else if (request.action === 'decreaseFontSize') {
    adjustFontSize(-1);
  } else if (request.action === 'toggleOpenDyslexic') {
    toggleOpenDyslexic();
  } else if (request.action === 'toggleReaderMode') {
    toggleReaderMode();
  } else if (request.action === 'resetSite') {
    resetSiteSettings();
  }
});

// Run the initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initExtension);
} else {
  initExtension();
}

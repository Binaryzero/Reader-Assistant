// popup.js
document.addEventListener('DOMContentLoaded', function() {
  const darkModeToggle = document.getElementById('toggleDarkMode');
  const increaseFontSize = document.getElementById('increaseFontSize');
  const decreaseFontSize = document.getElementById('decreaseFontSize');
  const openDyslexicToggle = document.getElementById('toggleOpenDyslexic');
  const readerModeToggle = document.getElementById('toggleReaderMode');
  const resetSiteButton = document.getElementById('resetSite');

  function sendMessage(action) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: action});
    });
  }

  function updateButtonStates(settings) {
    if (darkModeToggle) darkModeToggle.textContent = settings.darkMode ? 'Disable Dark Mode' : 'Enable Dark Mode';
    if (openDyslexicToggle) openDyslexicToggle.textContent = settings.openDyslexicActive ? 'Disable OpenDyslexic' : 'Enable OpenDyslexic';
    if (readerModeToggle) readerModeToggle.textContent = settings.readerModeActive ? 'Disable Reader Mode' : 'Enable Reader Mode';
    
    // Update font size buttons
    if (increaseFontSize) increaseFontSize.disabled = settings.fontSizeAdjustment >= 0.5; // Limit max increase
    if (decreaseFontSize) decreaseFontSize.disabled = settings.fontSizeAdjustment <= -0.3; // Limit max decrease
  }

  function getCurrentTabUrl(callback) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0] && tabs[0].url) {
        const url = new URL(tabs[0].url);
        callback(url.hostname);
      } else {
        console.error('Unable to get current tab URL');
        callback(null);
      }
    });
  }

  function loadSettings() {
    getCurrentTabUrl(function(hostname) {
      if (hostname) {
        chrome.storage.sync.get(hostname, function(result) {
          const settings = result[hostname] || {
            darkMode: false,
            fontSizeAdjustment: 0,
            openDyslexicActive: false,
            readerModeActive: false
          };
          updateButtonStates(settings);
        });
      }
    });
  }

  function addClickListener(element, action) {
    if (element) {
      element.addEventListener('click', () => {
        sendMessage(action);
        loadSettings(); // Refresh button states
      });
    } else {
      console.error(`Element for action "${action}" not found`);
    }
  }

  addClickListener(darkModeToggle, 'toggleDarkMode');
  addClickListener(increaseFontSize, 'increaseFontSize');
  addClickListener(decreaseFontSize, 'decreaseFontSize');
  addClickListener(openDyslexicToggle, 'toggleOpenDyslexic');
  addClickListener(readerModeToggle, 'toggleReaderMode');
  addClickListener(resetSiteButton, 'resetSite');

  // Load initial settings
  loadSettings();
});
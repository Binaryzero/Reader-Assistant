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
      darkModeToggle.textContent = settings.darkMode ? 'Disable Dark Mode' : 'Enable Dark Mode';
      openDyslexicToggle.textContent = settings.openDyslexicActive ? 'Disable OpenDyslexic' : 'Enable OpenDyslexic';
      readerModeToggle.textContent = settings.readerModeActive ? 'Disable Reader Mode' : 'Enable Reader Mode';
      
      // Update font size buttons
      increaseFontSize.disabled = settings.fontSizeAdjustment >= 0.5; // Limit max increase
      decreaseFontSize.disabled = settings.fontSizeAdjustment <= -0.3; // Limit max decrease
    }
  
    function getCurrentTabUrl(callback) {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const url = new URL(tabs[0].url);
        callback(url.hostname);
      });
    }
  
    function loadSettings() {
      getCurrentTabUrl(function(hostname) {
        chrome.storage.sync.get(hostname, function(result) {
          const settings = result[hostname] || {
            darkMode: false,
            fontSizeAdjustment: 0,
            openDyslexicActive: false,
            readerModeActive: false
          };
          updateButtonStates(settings);
        });
      });
    }
  
    darkModeToggle.addEventListener('click', () => {
      sendMessage('toggleDarkMode');
      loadSettings(); // Refresh button states
    });
  
    increaseFontSize.addEventListener('click', () => {
      sendMessage('increaseFontSize');
      loadSettings(); // Refresh button states
    });
  
    decreaseFontSize.addEventListener('click', () => {
      sendMessage('decreaseFontSize');
      loadSettings(); // Refresh button states
    });
  
    openDyslexicToggle.addEventListener('click', () => {
      sendMessage('toggleOpenDyslexic');
      loadSettings(); // Refresh button states
    });
  
    readerModeToggle.addEventListener('click', () => {
      sendMessage('toggleReaderMode');
      loadSettings(); // Refresh button states
    });
  
    resetSiteButton.addEventListener('click', () => {
      sendMessage('resetSite');
      loadSettings(); // Refresh button states
    });
  
    // Load initial settings
    loadSettings();
  });
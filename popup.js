// Popup launcher - opens game in new tab
document.getElementById('launch-btn').addEventListener('click', () => {
  chrome.tabs.create({ url: 'fullscreen.html' });
});


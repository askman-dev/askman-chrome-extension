try {
  chrome.devtools.panels.create('Dev Tools', 'icon-128.png', 'src/pages/panel/index.html');
} catch (e) {
  console.error(e);
}

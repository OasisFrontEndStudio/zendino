// 背景服务工作脚本
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: 'index.html' });
});

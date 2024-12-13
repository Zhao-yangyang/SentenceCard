chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "exportQuote",
    title: "导出金句",
    contexts: ["selection"]
  });
});

// 存储选中的文本
let selectedText = '';

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "exportQuote") {
    // 存储选中的文本
    chrome.storage.local.set({ selectedText: info.selectionText }, () => {
      // 打开popup（不需要额外操作，会自动使用default_popup）
      chrome.action.openPopup();
    });
  }
});

// 处理来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getSelectedText") {
    sendResponse({ text: selectedText });
  }
}); 
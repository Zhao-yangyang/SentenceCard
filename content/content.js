chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getSelection") {
    const selectedText = window.getSelection().toString();
    chrome.runtime.sendMessage({
      action: "showPopup",
      text: selectedText
    });
  }
}); 
import { scorePost, optimizePost, generateVariants, rewriteHooks, predictViralScore } from '../utils/api';

// Open side panel on action click (if user clicks the toolbar icon while on a page)
chrome.sidePanel?.setPanelBehavior?.({ openPanelOnActionClick: false }).catch(() => {});

// Handle messages from popup, sidepanel, and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { type, post } = message;

  if (type === 'OPEN_SIDEPANEL') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (tabId) {
        (chrome.sidePanel as any).open({ tabId }).catch(() => {
          // fallback: just set the panel options
          chrome.sidePanel.setOptions({ tabId, enabled: true });
        });
      }
    });
    sendResponse({ ok: true });
    return false;
  }

  if (type === 'SCORE_POST') {
    scorePost(post)
      .then(data => sendResponse({ data }))
      .catch(err => sendResponse({ error: err.message }));
    return true;
  }

  if (type === 'OPTIMIZE_POST') {
    optimizePost(post)
      .then(data => sendResponse({ data }))
      .catch(err => sendResponse({ error: err.message }));
    return true;
  }

  if (type === 'GENERATE_VARIANTS') {
    generateVariants(post)
      .then(data => sendResponse({ data }))
      .catch(err => sendResponse({ error: err.message }));
    return true;
  }

  if (type === 'REWRITE_HOOKS') {
    rewriteHooks(post)
      .then(data => sendResponse({ data }))
      .catch(err => sendResponse({ error: err.message }));
    return true;
  }

  if (type === 'PREDICT_VIRAL') {
    predictViralScore(post)
      .then(data => sendResponse({ data }))
      .catch(err => sendResponse({ error: err.message }));
    return true;
  }

  if (type === 'POST_FROM_LINKEDIN') {
    // Forward post text to the side panel
    chrome.runtime.sendMessage({ type: 'POST_TEXT', post });
    sendResponse({ ok: true });
    return false;
  }

  return false;
});

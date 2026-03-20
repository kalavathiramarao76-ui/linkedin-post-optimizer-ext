// LinkedIn Post Optimizer - Content Script
// Injects an "Optimize Post" button near the LinkedIn post composer

const BUTTON_ID = 'lpo-optimize-btn';

function getPostComposerText(): string {
  // LinkedIn's composer uses contenteditable divs
  const selectors = [
    '.ql-editor[data-placeholder]',
    '.ql-editor',
    '[role="textbox"][contenteditable="true"]',
    '.editor-content [contenteditable="true"]',
    '.share-creation-state__text-editor .ql-editor',
    '.msg-form__contenteditable',
  ];

  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el && el.textContent?.trim()) {
      return el.textContent.trim();
    }
  }

  return '';
}

function createOptimizeButton(): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.id = BUTTON_ID;
  btn.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
    Optimize Post
  `;

  Object.assign(btn.style, {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 14px',
    fontSize: '13px',
    fontWeight: '600',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#ffffff',
    background: 'linear-gradient(135deg, #0a66c2, #004182)',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(10, 102, 194, 0.3)',
    transition: 'all 0.2s ease',
    zIndex: '9999',
    marginLeft: '8px',
  });

  btn.onmouseenter = () => {
    btn.style.transform = 'scale(1.05)';
    btn.style.boxShadow = '0 4px 12px rgba(10, 102, 194, 0.4)';
  };
  btn.onmouseleave = () => {
    btn.style.transform = 'scale(1)';
    btn.style.boxShadow = '0 2px 8px rgba(10, 102, 194, 0.3)';
  };

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    const postText = getPostComposerText();
    if (!postText) {
      showToast('Write something in the composer first!');
      return;
    }

    // Send post text to background -> side panel
    chrome.runtime.sendMessage({ type: 'POST_FROM_LINKEDIN', post: postText });
    chrome.runtime.sendMessage({ type: 'OPEN_SIDEPANEL' });
    showToast('Post sent to optimizer!');
  });

  return btn;
}

function showToast(message: string) {
  const existing = document.getElementById('lpo-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'lpo-toast';
  toast.textContent = message;
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #0a66c2, #004182)',
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: '600',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(10, 102, 194, 0.3)',
    zIndex: '999999',
    animation: 'lpoFadeIn 0.3s ease',
    transition: 'opacity 0.3s ease',
  });

  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

function injectButton() {
  if (document.getElementById(BUTTON_ID)) return;

  // Find the share box / composer action bar
  const actionBarSelectors = [
    '.share-creation-state__footer',
    '.share-box_actions',
    '.share-creation-state__action-bar',
    '.share-box--footer',
    '.comments-comment-box__controls',
  ];

  for (const sel of actionBarSelectors) {
    const bar = document.querySelector(sel);
    if (bar) {
      bar.appendChild(createOptimizeButton());
      return;
    }
  }

  // Fallback: attach near the share box itself
  const shareBox = document.querySelector('.share-box-feed-entry__trigger') ||
    document.querySelector('.share-creation-state') ||
    document.querySelector('[data-test-id="share-box"]');

  if (shareBox && shareBox.parentElement) {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display:flex;justify-content:flex-end;padding:4px 8px;';
    wrapper.appendChild(createOptimizeButton());
    shareBox.parentElement.insertBefore(wrapper, shareBox.nextSibling);
  }
}

// Inject CSS animation
const style = document.createElement('style');
style.textContent = `
  @keyframes lpoFadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(style);

// Run injection
function init() {
  injectButton();

  // Re-inject on DOM changes (LinkedIn is a SPA)
  const observer = new MutationObserver(() => {
    if (!document.getElementById(BUTTON_ID)) {
      injectButton();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

// Wait for page to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

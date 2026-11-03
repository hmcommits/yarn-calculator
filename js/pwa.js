/**
 * PWA Registration, Lifecycle, and Install Prompt Controller
 */

let deferredPrompt = null;

export function initPWA({ onInstallStateChange, onNetworkChange }) {
  // 1. Register Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then((registration) => {
          // Check for waiting service worker
          if (registration.waiting) {
            notifyUpdateAvailable(registration.waiting);
          }
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                notifyUpdateAvailable(newWorker);
              }
            });
          });
        })
        .catch((err) => {
          console.warn('Service Worker registration skipped/failed:', err);
        });
    });
  }

  // 2. Handle beforeinstallprompt for Android & Desktop Chrome/Edge
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (onInstallStateChange) {
      onInstallStateChange({ canInstall: true, platform: 'standard' });
    }
  });

  // 3. Detect if already installed (standalone mode)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  if (isStandalone) {
    if (onInstallStateChange) {
      onInstallStateChange({ isInstalled: true });
    }
  }

  // Detect iOS Safari
  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  if (isIos && !isStandalone) {
    if (onInstallStateChange) {
      onInstallStateChange({ canInstall: true, platform: 'ios' });
    }
  }

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    if (onInstallStateChange) {
      onInstallStateChange({ isInstalled: true });
    }
  });

  // 4. Online/Offline network monitoring
  window.addEventListener('online', () => {
    if (onNetworkChange) onNetworkChange(true);
  });
  window.addEventListener('offline', () => {
    if (onNetworkChange) onNetworkChange(false);
  });
}

/**
 * Triggers the native install prompt
 */
export async function promptInstall() {
  if (!deferredPrompt) return false;
  
  deferredPrompt.prompt();
  const choice = await deferredPrompt.userChoice;
  deferredPrompt = null;
  return choice.outcome === 'accepted';
}

function notifyUpdateAvailable(worker) {
  const updateBar = document.getElementById('update-notification');
  if (updateBar) {
    updateBar.classList.remove('hidden');
    const updateBtn = document.getElementById('update-reload-btn');
    if (updateBtn) {
      updateBtn.onclick = () => {
        worker.postMessage({ action: 'skipWaiting' });
        window.location.reload();
      };
    }
  }
}

/**
 * Service Worker Registration and Offline State Manager
 */

export interface SWState {
  isRegistered: boolean;
  isOffline: boolean;
  hasUpdate: boolean;
}

type SWListener = (state: SWState) => void;

class ServiceWorkerManager {
  private listeners: Set<SWListener> = new Set();
  private state: SWState = {
    isRegistered: false,
    isOffline: !navigator.onLine,
    hasUpdate: false,
  };

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.updateState({ isOffline: false }));
      window.addEventListener('offline', () => this.updateState({ isOffline: true }));
    }
  }

  public register() {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.log('[SW Manager] Service Workers not supported in this environment.');
      return;
    }

    window.addEventListener('load', () => {
      // Register Service Worker
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[SW Manager] Service Worker successfully registered with scope:', registration.scope);
          this.updateState({ isRegistered: true });

          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[SW Manager] New offline build update available!');
                  this.updateState({ hasUpdate: true });
                }
              };
            }
          };
        })
        .catch((error) => {
          console.warn('[SW Manager] Service Worker registration failed:', error);
        });
    });
  }

  public subscribe(listener: SWListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState(): SWState {
    return this.state;
  }

  private updateState(partial: Partial<SWState>) {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((listener) => listener(this.state));
  }
}

export const swManager = new ServiceWorkerManager();

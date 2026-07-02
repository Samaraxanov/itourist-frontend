// Thin wrapper around the Telegram Mini App SDK (window.Telegram.WebApp).
// Everything degrades gracefully when the app runs in a normal browser.

interface TelegramWebApp {
  initData: string;
  initDataUnsafe?: { user?: { id: number; first_name?: string; username?: string; photo_url?: string } };
  ready: () => void;
  expand: () => void;
  colorScheme?: 'light' | 'dark';
  themeParams?: Record<string, string>;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  BackButton?: { show: () => void; hide: () => void; onClick: (cb: () => void) => void };
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

export const tg = (): TelegramWebApp | undefined => window.Telegram?.WebApp;

// True only when actually launched from inside Telegram (initData is signed & present).
export const isTelegram = (): boolean => Boolean(tg()?.initData);

export const telegramInitData = (): string => tg()?.initData ?? '';

// Prepare the viewport once at startup.
export function initTelegram() {
  const app = tg();
  if (!app || !app.initData) return;
  try {
    app.ready();
    app.expand();
    app.setHeaderColor?.('#0c73fe'); // brand blue
    app.setBackgroundColor?.('#f8fafc');
  } catch {
    /* ignore — non-critical viewport setup */
  }
}

export {};

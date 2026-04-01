'use client';

import { useEffect, useState, useCallback } from 'react';
import { X, Download, Smartphone, Monitor, Share2, WifiOff, CheckCircle2, Chrome, Compass, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [offline, setOffline] = useState(false);
  const [platform, setPlatform] = useState<'android' | 'ios' | 'desktop'>('desktop');
  const [installed, setInstalled] = useState(false);
  const [clientReady, setClientReady] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    const initTimer = setTimeout(() => {
      setClientReady(true);

      const ua = navigator.userAgent;
      if (/android/i.test(ua)) setPlatform('android');
      else if (/iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) setPlatform('ios');
      else setPlatform('desktop');

      setOffline(!navigator.onLine);

      // Check if already dismissed (persist for 24h)
      const dismissedAt = sessionStorage.getItem('shopnexa_install_dismissed');
      if (dismissedAt) {
        const elapsed = Date.now() - parseInt(dismissedAt, 10);
        if (elapsed < 24 * 60 * 60 * 1000) {
          setBannerDismissed(true);
          return;
        }
      }

      // Check standalone mode
      const standalone = window.matchMedia('(display-mode: standalone)').matches
        || (window.navigator as unknown as Record<string, unknown>).standalone === true;
      if (standalone) {
        setInstalled(true);
        return;
      }

      // Show banner after 2.5s
      setTimeout(() => setShowBanner(true), 2500);
    }, 0);

    const goOnline = () => setOffline(false);
    const goOffline = () => setOffline(true);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    // Register service worker
    try {
      if ('serviceWorker' in navigator && window.self === window.top) {
        (async () => {
          try {
            const reg = await navigator.serviceWorker.register('/sw.js');
            // Force update to pick up new cache version
            await reg.update();
            if (reg.waiting) {
              reg.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
            reg.addEventListener('updatefound', () => {
              const newWorker = reg.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                  }
                });
              }
            });
            // Reload when new service worker takes control to clear stale caches
            navigator.serviceWorker.addEventListener('controllerchange', () => {
              window.location.reload();
            });
          } catch {}
        })();
      }
    } catch {}

    // Capture beforeinstallprompt
    const installHandler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', installHandler);

    // Listen for appinstalled
    const installedHandler = () => {
      setInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      clearTimeout(initTimer);
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('beforeinstallprompt', installHandler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        setDeferredPrompt(null);
        if (outcome === 'dismissed') return;
      } catch {
        // fallback to guide
      }
    }
    // Open the install guide
    setShowGuide(true);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setShowBanner(false);
    sessionStorage.setItem('shopnexa_install_dismissed', Date.now().toString());
    setBannerDismissed(true);
  }, []);

  const handleGuideClose = useCallback(() => {
    setShowGuide(false);
  }, []);

  // Don't render until client is ready
  if (!clientReady) return null;

  // Already installed as PWA — don't show anything
  if (installed) return null;

  // Offline mode indicator
  if (offline) {
    return (
      <div className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-4 sm:max-w-sm z-[100] animate-in slide-in-from-bottom-4 duration-300">
        <div className="bg-white rounded-2xl shadow-2xl border border-orange-200 p-3.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
              <WifiOff className="h-4 w-4 text-orange-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900">You&apos;re Offline</p>
              <p className="text-[11px] text-muted-foreground">Cached pages available. Check connection.</p>
            </div>
            <button onClick={() => window.location.reload()} className="text-xs font-bold text-orange-600 hover:text-orange-700 px-2.5 py-1.5 rounded-lg hover:bg-orange-50">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Install Banner — always visible until dismissed or installed */}
      <AnimatePresence>
        {showBanner && !bannerDismissed && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-4 sm:max-w-[360px] z-[100]"
          >
            <div className="bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-gray-200/60 overflow-hidden">
              {/* Gradient top bar */}
              <div className="h-1 bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500" />

              <div className="p-4 pb-3">
                <div className="flex items-start gap-3">
                  {/* App icon */}
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 via-rose-500 to-pink-600 flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/25">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <path d="M16 10a4 4 0 01-8 0" />
                    </svg>
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[15px] text-gray-900">
                      Install{' '}
                      <span className="bg-gradient-to-r from-orange-600 to-rose-500 bg-clip-text text-transparent">Shopnexa</span>{' '}
                      App
                    </h3>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                      Fast access &bull; Works offline &bull; No Play Store
                    </p>
                  </div>

                  {/* Close */}
                  <button
                    onClick={handleDismiss}
                    className="p-1 rounded-full hover:bg-gray-100 text-gray-300 hover:text-gray-500 shrink-0 transition-colors mt-0.5"
                    aria-label="Dismiss"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Features list */}
                <div className="flex items-center gap-3 mt-3">
                  {[
                    { icon: <Smartphone className="h-3.5 w-3.5" />, text: 'App-like experience' },
                    { icon: <WifiOff className="h-3.5 w-3.5" />, text: 'Offline support' },
                    { icon: <Download className="h-3.5 w-3.5" />, text: 'No download needed' },
                  ].map((f, i) => (
                    <div key={i} className="flex items-center gap-1 text-[10px] text-gray-500">
                      <span className="text-orange-500">{f.icon}</span>
                      <span>{f.text}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Buttons */}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={handleInstall}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-700 hover:to-rose-700 active:scale-[0.97] text-white text-[13px] font-bold py-3 rounded-xl transition-all shadow-md shadow-orange-500/25"
                  >
                    <Download className="h-4 w-4" />
                    Install Now
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="text-[12px] text-gray-400 hover:text-gray-600 font-medium px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Later
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-Screen Install Guide Modal */}
      <AnimatePresence>
        {showGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center"
            onClick={handleGuideClose}
          >
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 60, scale: 0.95 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 px-5 pt-5 pb-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
                      <Download className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Install Shopnexa App</h2>
                      <p className="text-[11px] text-gray-500">
                        {platform === 'android' && 'Android Device'}
                        {platform === 'ios' && 'iPhone / iPad'}
                        {platform === 'desktop' && 'Desktop Browser'}
                      </p>
                    </div>
                  </div>
                  <button onClick={handleGuideClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-5">
                {/* Platform-specific steps */}
                {platform === 'android' && <AndroidSteps />}
                {platform === 'ios' && <IOSSteps />}
                {platform === 'desktop' && <DesktopSteps />}

                {/* Tip section */}
                <div className="mt-5 p-4 bg-orange-50 rounded-xl border border-orange-100">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-orange-900">Why install?</p>
                      <p className="text-xs text-orange-700 mt-1 leading-relaxed">
                        Installing Shopnexa as an app gives you fast access, push notifications, offline browsing, and a smooth app-like experience without downloading from Play Store or App Store.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Done button */}
                <button
                  onClick={handleGuideClose}
                  className="w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-rose-600 text-white font-bold text-sm py-3.5 rounded-xl shadow-md shadow-orange-500/25 active:scale-[0.98] transition-all"
                >
                  Got it, thanks!
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ───────── Platform-specific step guides ───────── */

function AndroidSteps() {
  return (
    <div className="space-y-4">
      <StepCard
        number={1}
        icon={<Chrome className="h-5 w-5 text-blue-500" />}
        title="Open in Chrome"
        description="Make sure you're using Google Chrome browser (not Firefox, Samsung Internet, etc.)"
        highlight="Use Chrome for best results"
      />
      <StepCard
        number={2}
        icon={<Share2 className="h-5 w-5 text-blue-500" />}
        title="Tap the 3-dot menu"
        description="Tap the three vertical dots in the top-right corner of Chrome"
        highlight="⋮ Menu button"
      />
      <StepCard
        number={3}
        icon={<Download className="h-5 w-5 text-green-500" />}
        title="Tap 'Add to Home screen'"
        description="Scroll down in the menu and tap &quot;Add to Home screen&quot; or &quot;Install app&quot;"
        highlight="Install app"
      />
      <StepCard
        number={4}
        icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
        title="Tap Install"
        description="Confirm by tapping &quot;Install&quot; in the popup. The app icon will appear on your home screen!"
        highlight="You're done!"
      />
    </div>
  );
}

function IOSSteps() {
  return (
    <div className="space-y-4">
      <StepCard
        number={1}
        icon={<Compass className="h-5 w-5 text-blue-500" />}
        title="Open in Safari"
        description="Safari is the only browser that supports PWA install on iPhone/iPad"
        highlight="Use Safari browser"
      />
      <StepCard
        number={2}
        icon={<Share2 className="h-5 w-5 text-blue-500" />}
        title="Tap the Share button"
        description="Tap the Share icon (square with arrow pointing up) at the bottom center of Safari"
        highlight="Share button ↑"
      />
      <StepCard
        number={3}
        icon={<Download className="h-5 w-5 text-green-500" />}
        title="Scroll & tap 'Add to Home Screen'"
        description="In the share menu, scroll down and tap &quot;Add to Home Screen&quot;"
        highlight="Add to Home Screen"
      />
      <StepCard
        number={4}
        icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
        title="Tap 'Add'"
        description="Confirm by tapping &quot;Add&quot; in the top-right corner. The app icon will be added!"
        highlight="You're done!"
      />
    </div>
  );
}

function DesktopSteps() {
  return (
    <div className="space-y-4">
      <StepCard
        number={1}
        icon={<Monitor className="h-5 w-5 text-gray-600" />}
        title="Look for the install icon"
        description="Check the right side of the address bar for a computer-with-download icon, or a puzzle piece icon"
        highlight="Address bar → install icon"
      />
      <StepCard
        number={2}
        icon={<Chrome className="h-5 w-5 text-blue-500" />}
        title="Click 'Install Shopnexa'"
        description="Click the install icon. A popup will appear asking to install Shopnexa"
        highlight="Click install"
      />
      <StepCard
        number={3}
        icon={<Download className="h-5 w-5 text-green-500" />}
        title="Or use the 3-dot menu"
        description="Click the three dots in Chrome &rarr; &quot;Install Shopnexa&quot; or &quot;Cast, save and share&quot; &rarr; &quot;Install this page as an app&quot;"
        highlight="⋮ → Install"
      />
      <StepCard
        number={4}
        icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
        title="Click 'Install' in popup"
        description="Confirm in the popup. Shopnexa will open as a standalone window like a native app!"
        highlight="You're done!"
      />
    </div>
  );
}

/* ───────── Step card component ───────── */

function StepCard({ number, icon, title, description, highlight }: {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  highlight: string;
}) {
  return (
    <div className="flex gap-3.5 items-start p-3.5 bg-gray-50 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/30 transition-colors">
      <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-200 flex items-center justify-center shrink-0 text-lg font-bold text-orange-500">
        {number}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {icon}
          <h4 className="text-sm font-bold text-gray-900">{title}</h4>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">{description}</p>
        <span className="inline-block mt-1.5 text-[10px] font-semibold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
          {highlight}
        </span>
      </div>
    </div>
  );
}

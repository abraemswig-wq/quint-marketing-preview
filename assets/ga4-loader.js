/* ═══════════════════════════════════════════════════════════════════
   Quint GA4 Loader — lädt gtag.js NUR nach Consent
   ═══════════════════════════════════════════════════════════════════
   Wartet auf 'quint:consent'-Event vom Cookie-Consent-Script.
   Wenn analytics_storage = 'granted': gtag.js wird nachgeladen und
   GA4 mit IP-Anonymisierung initialisiert.
   ═══════════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  // ▶ PLATZHALTER: vor Go-Live durch echte GA4 Measurement ID ersetzen
  //   Format: 'G-XXXXXXXXXX' (bekommst du in Google Analytics unter
  //   Verwaltung → Datenströme → Web-Datenstrom)
  const GA_MEASUREMENT_ID = 'G-PLACEHOLDER';

  let loaded = false;

  function loadGA4() {
    if (loaded) return;
    if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === 'G-PLACEHOLDER') {
      console.info('[Quint GA4] Kein GA_MEASUREMENT_ID gesetzt — Analytics deaktiviert.');
      return;
    }
    loaded = true;

    // gtag.js dynamisch nachladen
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(s);

    // gtag global sollte durch cookie-consent.js schon existieren
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function() { dataLayer.push(arguments); };

    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
      anonymize_ip: true,      // IP-Anonymisierung (DSGVO)
      allow_google_signals: false,      // kein Cross-Device-Tracking
      allow_ad_personalization_signals: false
    });
  }

  /* Prüfe aktuellen Consent-Status */
  function checkConsent(consent) {
    if (consent && consent.analytics_storage === 'granted') {
      loadGA4();
    }
  }

  /* Initial: gespeicherten Consent lesen (falls User schon zugestimmt hat) */
  try {
    const stored = JSON.parse(localStorage.getItem('quint-consent') || 'null');
    if (stored && stored.consent) checkConsent(stored.consent);
  } catch (e) { /* silent */ }

  /* Live: auf neuen Consent (nach Banner-Klick) reagieren */
  window.addEventListener('quint:consent', (e) => checkConsent(e.detail));
})();

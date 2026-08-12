/* ═══════════════════════════════════════════════════════════════════
   Quint Cookie Consent (Vanilla JS, DSGVO-konform)
   ═══════════════════════════════════════════════════════════════════
   Standard: alle nicht-notwendigen Kategorien DENIED bis Zustimmung
   Speicherung: localStorage 'quint-consent' als JSON
   Google Consent Mode v2 integriert (analytics_storage, ad_storage, etc.)
   Widerruf: über data-cookie-settings Attribute oder /datenschutz.html Link
   ═══════════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  const STORAGE_KEY = 'quint-consent';
  const CONSENT_VERSION = 1;
  const DEFAULT_DENIED = {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    functionality_storage: 'granted',   // technisch notwendig
    security_storage: 'granted',        // technisch notwendig
    personalization_storage: 'denied'
  };

  /* Consent Mode v2 initialisieren — MUSS vor jedem Google-Skript stehen */
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function() { dataLayer.push(arguments); };
  gtag('consent', 'default', DEFAULT_DENIED);

  /* Aktuellen Consent-Status aus localStorage lesen */
  function getStored() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (data.v !== CONSENT_VERSION) return null;
      return data;
    } catch (e) { return null; }
  }

  /* Consent-Update: an gtag weitergeben + speichern */
  function applyConsent(consent, source) {
    gtag('consent', 'update', consent);
    const record = {
      v: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
      source: source,
      consent: consent
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    // Custom-Event für andere Scripts (z.B. GA4-Loader)
    window.dispatchEvent(new CustomEvent('quint:consent', { detail: consent }));
  }

  /* Banner erstellen und einfügen */
  function buildBanner() {
    const banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-labelledby', 'cookie-banner-title');
    banner.setAttribute('aria-describedby', 'cookie-banner-body');
    banner.innerHTML = `
      <div class="cookie-banner-inner">
        <div class="cookie-banner-content">
          <h2 id="cookie-banner-title" class="cookie-banner-title">Cookies &amp; Reichweiten-Messung</h2>
          <p id="cookie-banner-body" class="cookie-banner-body">
            Wir nutzen technisch notwendige Cookies für den Betrieb. Für die anonymisierte Reichweiten-Messung
            (Google Analytics 4) und optionale Funktionen brauchen wir deine Einwilligung. Du kannst jederzeit
            im Footer widerrufen. Details in unserer
            <a href="datenschutz.html">Datenschutzerklärung</a>.
          </p>
        </div>
        <div class="cookie-banner-actions">
          <button type="button" class="cookie-btn cookie-btn-primary" data-consent="accept-all">
            Alle akzeptieren
          </button>
          <button type="button" class="cookie-btn cookie-btn-ghost" data-consent="reject-all">
            Nur notwendige
          </button>
          <button type="button" class="cookie-btn cookie-btn-link" data-consent="open-settings">
            Einstellungen
          </button>
        </div>
      </div>
    `;
    return banner;
  }

  /* Settings-Modal (Feineinstellung pro Kategorie) */
  function buildSettings() {
    const modal = document.createElement('div');
    modal.className = 'cookie-settings-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-labelledby', 'cookie-settings-title');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = `
      <div class="cookie-settings-backdrop" data-consent="close-settings"></div>
      <div class="cookie-settings-panel">
        <h2 id="cookie-settings-title" class="cookie-settings-title">Cookie-Einstellungen</h2>
        <p class="cookie-settings-intro">
          Wähle selbst, welche Kategorien du zulässt. Technisch notwendige Cookies sind für den Betrieb der Website nötig.
        </p>

        <div class="cookie-cat">
          <div class="cookie-cat-head">
            <span class="cookie-cat-name">Technisch notwendig</span>
            <span class="cookie-cat-toggle cookie-cat-fixed">Immer aktiv</span>
          </div>
          <p class="cookie-cat-desc">
            Session-Handling, Speicherung deiner Cookie-Auswahl, Sicherheits-Cookies.
            Ohne diese funktioniert die Seite nicht.
          </p>
        </div>

        <div class="cookie-cat">
          <div class="cookie-cat-head">
            <span class="cookie-cat-name">Statistik / Reichweiten-Messung</span>
            <label class="cookie-cat-toggle">
              <input type="checkbox" name="analytics" />
              <span class="cookie-toggle-slider"></span>
            </label>
          </div>
          <p class="cookie-cat-desc">
            Google Analytics 4 mit IP-Anonymisierung. Hilft uns zu verstehen, welche Inhalte gelesen werden.
            Datentransfer USA (Angemessenheitsbeschluss EU-USA Data Privacy Framework).
          </p>
        </div>

        <div class="cookie-cat">
          <div class="cookie-cat-head">
            <span class="cookie-cat-name">Marketing / Personalisierung</span>
            <label class="cookie-cat-toggle">
              <input type="checkbox" name="marketing" />
              <span class="cookie-toggle-slider"></span>
            </label>
          </div>
          <p class="cookie-cat-desc">
            Aktuell nicht aktiv. Platzhalter für zukünftige Ads/Retargeting (Meta Pixel, Google Ads).
          </p>
        </div>

        <div class="cookie-settings-actions">
          <button type="button" class="cookie-btn cookie-btn-primary" data-consent="save-settings">
            Auswahl speichern
          </button>
          <button type="button" class="cookie-btn cookie-btn-ghost" data-consent="accept-all">
            Alle akzeptieren
          </button>
        </div>
      </div>
    `;
    return modal;
  }

  /* Zeigt Banner ODER Settings, je nach Aktion */
  function showBanner() {
    if (document.querySelector('.cookie-banner')) return;
    const banner = buildBanner();
    document.body.appendChild(banner);
    requestAnimationFrame(() => banner.classList.add('is-visible'));
    banner.addEventListener('click', handleAction);
  }

  function hideBanner() {
    const banner = document.querySelector('.cookie-banner');
    if (banner) {
      banner.classList.remove('is-visible');
      setTimeout(() => banner.remove(), 300);
    }
  }

  function showSettings(initial) {
    let modal = document.querySelector('.cookie-settings-modal');
    if (modal) return;
    modal = buildSettings();
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    // Aktuellen Stand in Checkboxen laden
    const stored = getStored();
    if (stored) {
      modal.querySelector('input[name="analytics"]').checked = stored.consent.analytics_storage === 'granted';
      modal.querySelector('input[name="marketing"]').checked = stored.consent.ad_storage === 'granted';
    } else if (initial) {
      // Erstes Öffnen: alles unchecked (Opt-In)
    }
    requestAnimationFrame(() => modal.classList.add('is-visible'));
    modal.addEventListener('click', handleAction);
  }

  function hideSettings() {
    const modal = document.querySelector('.cookie-settings-modal');
    if (modal) {
      modal.classList.remove('is-visible');
      document.body.style.overflow = '';
      setTimeout(() => modal.remove(), 300);
    }
  }

  /* Aktions-Router */
  function handleAction(e) {
    const target = e.target.closest('[data-consent]');
    if (!target) return;
    const action = target.dataset.consent;

    if (action === 'accept-all') {
      applyConsent({
        analytics_storage: 'granted',
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
        functionality_storage: 'granted',
        security_storage: 'granted',
        personalization_storage: 'granted'
      }, 'accept-all');
      hideBanner();
      hideSettings();
    }
    else if (action === 'reject-all') {
      applyConsent(DEFAULT_DENIED, 'reject-all');
      hideBanner();
      hideSettings();
    }
    else if (action === 'open-settings') {
      showSettings(true);
    }
    else if (action === 'close-settings') {
      hideSettings();
    }
    else if (action === 'save-settings') {
      const modal = document.querySelector('.cookie-settings-modal');
      const analytics = modal.querySelector('input[name="analytics"]').checked;
      const marketing = modal.querySelector('input[name="marketing"]').checked;
      applyConsent({
        analytics_storage: analytics ? 'granted' : 'denied',
        ad_storage: marketing ? 'granted' : 'denied',
        ad_user_data: marketing ? 'granted' : 'denied',
        ad_personalization: marketing ? 'granted' : 'denied',
        functionality_storage: 'granted',
        security_storage: 'granted',
        personalization_storage: marketing ? 'granted' : 'denied'
      }, 'settings');
      hideBanner();
      hideSettings();
    }
    else if (action === 'reopen') {
      showSettings(false);
    }
  }

  /* Öffentliche API: Widerrufs-Link im Footer nutzt data-consent="reopen" */
  window.QuintCookieConsent = {
    reopen: () => showSettings(false),
    reset: () => { localStorage.removeItem(STORAGE_KEY); location.reload(); },
    getConsent: () => getStored()
  };

  /* Beim Laden: wenn noch keine Wahl getroffen → Banner zeigen */
  function init() {
    const stored = getStored();
    if (stored) {
      // Vorherige Wahl wieder anwenden (Consent Mode Update)
      gtag('consent', 'update', stored.consent);
    } else {
      // Erste Sitzung: Banner zeigen (leicht verzögert für UX)
      setTimeout(showBanner, 400);
    }

    // Reopen-Links im Footer o.ä. verdrahten
    document.addEventListener('click', (e) => {
      const t = e.target.closest('[data-cookie-settings]');
      if (t) { e.preventDefault(); showSettings(false); }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

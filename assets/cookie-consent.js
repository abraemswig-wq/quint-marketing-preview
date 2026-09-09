/* ═══════════════════════════════════════════════════════════════════
   Quint Cookie Consent (Vanilla JS, DSGVO-konform)
   ═══════════════════════════════════════════════════════════════════
   Standard: alle nicht-notwendigen Kategorien DENIED bis Zustimmung
   Speicherung: localStorage 'quint-consent' als JSON
   Google Consent Mode v2 integriert
   Widerruf: über data-cookie-settings Attribute oder /datenschutz.html Link

   Design-Vorgaben (Feedback Weise Datenschutz 2026-09-08):
   - Erster Layer zeigt direkt die konkreten Kategorien mit Toggles
   - Nur Kategorien, die tatsaechlich aktiv sind (kein "Platzhalter fuer
     zukuenftige Ads" mehr — Marketing ist raus)
   - Alle Buttons visuell gleichrangig (kein Dark Pattern, kein Pink-
     Hervorheben von "Alle akzeptieren"; vgl. OLG Koeln 6 U 149/22)
   - Erst-Consent-Modal ist NICHT per Backdrop-Klick schliessbar
   ═══════════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  const STORAGE_KEY = 'quint-consent';
  const CONSENT_VERSION = 2; // v2: Marketing-Kategorie entfernt, Layer-Redesign
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
    window.dispatchEvent(new CustomEvent('quint:consent', { detail: consent }));
  }

  /* Consent-Modal (Erst-Consent + Widerruf beide gleich). initial=true
     verhindert das Schliessen ueber Backdrop-Klick. */
  function buildConsent(initial) {
    const modal = document.createElement('div');
    modal.className = 'cookie-settings-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-labelledby', 'cookie-settings-title');
    modal.setAttribute('aria-modal', 'true');
    if (initial) modal.classList.add('is-initial');

    const backdropAction = initial ? '' : 'data-consent="close-settings"';

    modal.innerHTML = `
      <div class="cookie-settings-backdrop" ${backdropAction}></div>
      <div class="cookie-settings-panel">
        <h2 id="cookie-settings-title" class="cookie-settings-title">Cookies &amp; Reichweiten-Messung</h2>
        <p class="cookie-settings-intro">
          Diese Seite setzt technisch notwendige Cookies für den Betrieb. Für die
          anonymisierte Reichweiten-Messung mit Google Analytics 4 brauchen wir
          deine Einwilligung. Wähle unten, was du zulassen möchtest. Details in
          unserer <a href="datenschutz.html">Datenschutzerklärung</a>.
        </p>

        <div class="cookie-cat">
          <div class="cookie-cat-head">
            <span class="cookie-cat-name">Technisch notwendig</span>
            <span class="cookie-cat-toggle cookie-cat-fixed">Immer aktiv</span>
          </div>
          <p class="cookie-cat-desc">
            Speicherung deiner Cookie-Auswahl (localStorage-Eintrag „quint-consent") und
            Session-Handling. Ohne diese Cookies funktioniert die Seite nicht.
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
            Google Analytics 4 (Anbieter: Google Ireland Ltd.) mit IP-Anonymisierung.
            Wir sehen, welche Inhalte gelesen werden — nie einzelne Personen.
            Datenübermittlung USA auf Grundlage des EU-US Data Privacy Framework.
            Cookies: <code>_ga</code>, <code>_ga_&lt;ID&gt;</code>. Speicherdauer bis 2 Jahre.
          </p>
        </div>

        <div class="cookie-settings-actions">
          <button type="button" class="cookie-btn" data-consent="reject-all">
            Nur notwendige
          </button>
          <button type="button" class="cookie-btn" data-consent="save-settings">
            Auswahl speichern
          </button>
          <button type="button" class="cookie-btn" data-consent="accept-all">
            Alle akzeptieren
          </button>
        </div>
      </div>
    `;
    return modal;
  }

  function showConsent(initial) {
    if (document.querySelector('.cookie-settings-modal')) return;
    const modal = buildConsent(initial);
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    // Aktuellen Stand in Checkbox laden (bei Widerruf)
    const stored = getStored();
    if (stored) {
      const cb = modal.querySelector('input[name="analytics"]');
      if (cb) cb.checked = stored.consent.analytics_storage === 'granted';
    }
    requestAnimationFrame(() => modal.classList.add('is-visible'));
    modal.addEventListener('click', handleAction);
  }

  function hideConsent() {
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
        ad_storage: 'denied',        // aktuell keine Ads
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        functionality_storage: 'granted',
        security_storage: 'granted',
        personalization_storage: 'denied'
      }, 'accept-all');
      hideConsent();
    }
    else if (action === 'reject-all') {
      applyConsent(DEFAULT_DENIED, 'reject-all');
      hideConsent();
    }
    else if (action === 'save-settings') {
      const modal = document.querySelector('.cookie-settings-modal');
      const cb = modal.querySelector('input[name="analytics"]');
      const analytics = cb && cb.checked;
      applyConsent({
        analytics_storage: analytics ? 'granted' : 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        functionality_storage: 'granted',
        security_storage: 'granted',
        personalization_storage: 'denied'
      }, 'settings');
      hideConsent();
    }
    else if (action === 'close-settings') {
      // Nur beim Widerruf-Layer erlaubt (siehe buildConsent)
      hideConsent();
    }
    else if (action === 'reopen') {
      showConsent(false);
    }
  }

  /* Öffentliche API */
  window.QuintCookieConsent = {
    reopen: () => showConsent(false),
    reset: () => { localStorage.removeItem(STORAGE_KEY); location.reload(); },
    getConsent: () => getStored()
  };

  /* Beim Laden: wenn noch keine Wahl getroffen → Modal zeigen */
  function init() {
    const stored = getStored();
    if (stored) {
      gtag('consent', 'update', stored.consent);
    } else {
      // Erste Sitzung: Modal zeigen (leicht verzögert für UX)
      setTimeout(() => showConsent(true), 400);
    }

    // Reopen-Links im Footer o.ä. verdrahten
    document.addEventListener('click', (e) => {
      const t = e.target.closest('[data-cookie-settings]');
      if (t) { e.preventDefault(); showConsent(false); }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

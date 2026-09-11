/* KI-Transparenz-Chip fuer den Footer
   Injiziert unterhalb des bestehenden footer-Inhalts einen dezenten Chip
   'Mit KI erstellt', der beim Klick ein kleines Modal mit Erklaerung oeffnet.
   Hintergrund: EU AI Act Art. 50 - freiwillige Transparenz gegenueber Nutzern.
   Wird auf jeder Seite mit einem <footer>-Element automatisch aktiv. */
(function () {
  'use strict';

  const footer = document.querySelector('footer');
  if (!footer) return;

  // Chip + Modal-Markup
  const html = `
    <div class="ai-notice-row wrap">
      <button type="button" class="ai-notice-chip" aria-haspopup="dialog" data-ai-open>
        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="currentColor">
          <path d="M12 2l1.7 4.6L18 8l-4.3 1.7L12 14l-1.7-4.3L6 8l4.3-1.4L12 2zm7 10l1 2.4 2.4 1-2.4 1-1 2.4-1-2.4-2.4-1 2.4-1 1-2.4zM5 14l1 2.4 2.4 1-2.4 1-1 2.4-1-2.4L1.6 17.4 4 16.4 5 14z"/>
        </svg>
        <span>Mit KI erstellt</span>
      </button>
    </div>
    <div class="ai-notice-modal" data-ai-modal role="dialog" aria-modal="true" aria-labelledby="ai-notice-title" hidden>
      <div class="ai-notice-backdrop" data-ai-close></div>
      <div class="ai-notice-panel">
        <button type="button" class="ai-notice-close" aria-label="Schließen" data-ai-close>×</button>
        <h2 id="ai-notice-title">Transparenz zu KI-Nutzung</h2>
        <p>
          Diese Website ist mithilfe von KI erstellt. Wir nutzen KI-Werkzeuge
          bei Text, Bild, Video und Code &mdash; immer redaktionell geprüft und
          kuratiert. Marken-, Positionierungs- und Strategie-Entscheidungen
          treffen wir als Menschen. Für unsere Kundinnen und Kunden arbeiten
          wir nach demselben Prinzip: KI unterstützt, Menschen entscheiden.
        </p>
        <p class="ai-notice-meta">
          Diese Kennzeichnung erfolgt freiwillig im Sinne der
          Transparenz&shy;pflichten aus Artikel&nbsp;50 EU&nbsp;AI&nbsp;Act
          (in Kraft seit 2.&nbsp;August&nbsp;2026).
        </p>
        <div class="ai-notice-actions">
          <button type="button" class="ai-notice-btn" data-ai-close>Verstanden</button>
        </div>
      </div>
    </div>
  `;
  footer.insertAdjacentHTML('beforeend', html);

  const modal = footer.querySelector('[data-ai-modal]');
  const openBtn = footer.querySelector('[data-ai-open]');
  const closers = footer.querySelectorAll('[data-ai-close]');

  const setOpen = (open) => {
    if (open) {
      modal.hidden = false;
      requestAnimationFrame(() => modal.classList.add('is-open'));
      document.body.style.overflow = 'hidden';
    } else {
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
      setTimeout(() => { modal.hidden = true; }, 220);
    }
  };

  openBtn.addEventListener('click', () => setOpen(true));
  closers.forEach(el => el.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) setOpen(false);
  });
})();

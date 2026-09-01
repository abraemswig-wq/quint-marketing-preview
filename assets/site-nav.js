/* Site-Nav Injection: rendert die volle Haupt-Nav in <div data-site-nav></div>
   Pfad-aware: aus Unterordnern (arbeit/, journal/) wird automatisch ../ prefixed.
*/
(function () {
  const mount = document.querySelector('[data-site-nav]');
  if (!mount) return;

  // Pfadtiefe bestimmen: jedes zusaetzliche Segment im pathname (ausser leerer
  // string oder Dateiname) heisst wir sind in einem Unterordner.
  const parts = location.pathname.split('/').filter(p => p && !p.includes('.'));
  // Auf GitHub Pages ist /quint-marketing-preview/ das Root — dessen ersten
  // Segment gehoert zum Repo-Prefix, nicht zur Site-Struktur.
  const rootSegments = ['quint-marketing-preview'];
  const depth = parts.filter(p => !rootSegments.includes(p)).length;
  const base = depth > 0 ? '../'.repeat(depth) : '';

  const html = `
<nav class="site-nav" aria-label="Haupt-Navigation">
  <div class="site-nav__inner">
    <a href="${base}index.html" class="site-nav__logo" aria-label="Quint — Startseite">
      <img src="${base}assets/quint-logo-white.svg" alt="Quint" decoding="async" />
    </a>
    <div class="site-nav__links">
      <a href="${base}index.html#leistungen">Leistungen</a>
      <a href="${base}index.html#fuer-wen">Für wen</a>
      <a href="${base}index.html#methode">Methode</a>
      <a href="${base}arbeit/">Arbeit</a>
      <a href="${base}index.html#team">Team</a>
      <a href="${base}ueber-uns.html">Über uns</a>
      <a href="${base}journal/">Journal</a>
      <a href="${base}index.html#faq">FAQ</a>
    </div>
    <a class="site-nav__cta" href="${base}index.html#kontakt">Erstgespräch →</a>
    <button class="site-nav__hamburger" aria-label="Menü öffnen" aria-expanded="false" data-menu-open>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <line x1="4" y1="7"  x2="20" y2="7"/>
        <line x1="4" y1="12" x2="20" y2="12"/>
        <line x1="4" y1="17" x2="20" y2="17"/>
      </svg>
    </button>
  </div>
</nav>
<div class="site-nav-menu" data-menu>
  <button class="site-nav-menu__close" aria-label="Menü schließen" data-menu-close>×</button>
  <div class="site-nav-menu__links">
    <a href="${base}index.html#leistungen" data-menu-close>Leistungen</a>
    <a href="${base}index.html#fuer-wen"   data-menu-close>Für wen</a>
    <a href="${base}index.html#methode"    data-menu-close>Methode</a>
    <a href="${base}arbeit/"               data-menu-close>Arbeit</a>
    <a href="${base}index.html#team"       data-menu-close>Team</a>
    <a href="${base}ueber-uns.html"        data-menu-close>Über uns</a>
    <a href="${base}journal/"              data-menu-close>Journal</a>
    <a href="${base}index.html#faq"        data-menu-close>FAQ</a>
  </div>
  <a class="site-nav-menu__cta" href="${base}index.html#kontakt" data-menu-close>Erstgespräch →</a>
</div>
`;
  mount.outerHTML = html;

  // Nach outerHTML sind die Referenzen weg — neu holen
  const menu = document.querySelector('[data-menu]');
  const open = document.querySelector('[data-menu-open]');
  const closers = document.querySelectorAll('[data-menu-close]');
  if (!menu || !open) return;

  const setOpen = (val) => {
    menu.classList.toggle('is-open', val);
    open.setAttribute('aria-expanded', val ? 'true' : 'false');
    document.body.style.overflow = val ? 'hidden' : '';
  };
  open.addEventListener('click', () => setOpen(true));
  closers.forEach(el => el.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) setOpen(false);
  });
})();

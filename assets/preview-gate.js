/* Preview-Gate: SHA-256-Hash-basiertes Passwort-Gate.
   Passwort: 'wappentier'. Session bleibt 30 Tage via localStorage. */
(function () {
  var STORAGE_KEY = 'quint-preview-gate';
  var HASH_TARGET = 'a73ccb831cce60bfd59f36f0aa7220d0969cb851136a6b4a9e87561379333c53';
  var TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 Tage

  function isAuthed() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      var parsed = JSON.parse(raw);
      if (parsed.hash !== HASH_TARGET) return false;
      if (Date.now() - parsed.ts > TTL_MS) {
        localStorage.removeItem(STORAGE_KEY);
        return false;
      }
      return true;
    } catch (e) { return false; }
  }

  async function sha256(str) {
    var buf = new TextEncoder().encode(str);
    var hashBuf = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(hashBuf))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  function showContent() {
    document.documentElement.style.visibility = '';
    document.documentElement.style.overflow = '';
  }

  function mountGate() {
    var overlay = document.createElement('div');
    overlay.className = 'pgate';
    overlay.innerHTML = [
      '<div class="pgate__box">',
      '  <div class="pgate__logo">Quint<span class="dot">.</span></div>',
      '  <div class="pgate__title">Preview geschützt</div>',
      '  <div class="pgate__hint">Diese Seite ist noch nicht öffentlich. Bitte Passwort eingeben, um weiterzugehen.</div>',
      '  <form class="pgate__form" novalidate>',
      '    <input class="pgate__input" type="password" autocomplete="off" placeholder="Passwort" autofocus />',
      '    <button class="pgate__btn" type="submit">Öffnen</button>',
      '  </form>',
      '  <div class="pgate__error">Falsches Passwort.</div>',
      '</div>'
    ].join('\n');

    // Body verstecken, damit kein Content durchblitzt
    document.documentElement.style.visibility = '';
    document.body.appendChild(overlay);

    var form = overlay.querySelector('.pgate__form');
    var input = overlay.querySelector('.pgate__input');
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      overlay.classList.remove('pgate--err');
      var hash = await sha256(input.value);
      if (hash === HASH_TARGET) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ hash: hash, ts: Date.now() }));
        overlay.classList.add('pgate--hidden');
        showContent();
      } else {
        overlay.classList.add('pgate--err');
        input.select();
      }
    });
    input.focus();
  }

  if (isAuthed()) {
    showContent();
    return;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountGate);
  } else {
    mountGate();
  }
})();

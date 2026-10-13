/* Menu mobile e inputmode em campos numéricos (sem dependências). */
(function () {
  function guessInputMode(input) {
    var step = input.getAttribute('step');
    if (step && /^\d+$/.test(step)) return 'numeric';
    var min = input.getAttribute('min');
    if (min !== null && min !== '' && String(min).indexOf('.') < 0) {
      var max = input.getAttribute('max');
      if (!step || step === '1') {
        if (!max || String(max).indexOf('.') < 0) return 'numeric';
      }
    }
    return 'decimal';
  }

  function enhanceNumberInputs() {
    document.querySelectorAll('input[type="number"]').forEach(function (input) {
      if (!input.getAttribute('inputmode')) {
        input.setAttribute('inputmode', guessInputMode(input));
      }
    });
  }

  function initNav() {
    var header = document.querySelector('header.top');
    if (!header) return;
    var toggle = header.querySelector('.nav-toggle');
    var nav = header.querySelector('#site-nav');
    var backdrop = header.querySelector('.nav-backdrop');
    if (!toggle || !nav) return;

    function setOpen(open) {
      document.body.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      if (backdrop) backdrop.hidden = !open;
      nav.classList.toggle('is-open', open);
    }

    toggle.addEventListener('click', function () {
      setOpen(!document.body.classList.contains('nav-open'));
    });

    if (backdrop) {
      backdrop.addEventListener('click', function () {
        setOpen(false);
      });
    }

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        setOpen(false);
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });

    window.addEventListener('resize', function () {
      if (window.matchMedia('(min-width: 900px)').matches) setOpen(false);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      enhanceNumberInputs();
      initNav();
    });
  } else {
    enhanceNumberInputs();
    initNav();
  }
})();

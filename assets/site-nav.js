/* Menu mobile (drawer), foco e inputmode em campos numéricos. */
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

  function normPath(path) {
    if (!path) return '/';
    var p = path.replace(/\/index\.html$/, '/');
    if (p !== '/' && !p.endsWith('/')) p += '/';
    return p;
  }

  function markCurrentNavLink(nav) {
    var here = normPath(window.location.pathname);
    nav.querySelectorAll('a[href]').forEach(function (link) {
      var target = normPath(link.getAttribute('href'));
      if (target === here) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  function focusableIn(container) {
    return Array.prototype.slice.call(
      container.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter(function (el) {
      return el.offsetParent !== null || el === document.activeElement;
    });
  }

  function initNav() {
    var header = document.querySelector('header.top');
    var toggle = header && header.querySelector('.nav-toggle');
    var nav = document.querySelector('#site-nav');
    var backdrop = header && header.querySelector('.nav-backdrop');
    var closeBtn = nav && nav.querySelector('.nav-close');
    if (!toggle || !nav) return;

    markCurrentNavLink(nav);

    function setOpen(open) {
      document.body.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      nav.setAttribute('aria-hidden', open ? 'false' : 'true');
      nav.classList.toggle('is-open', open);
      if (backdrop) {
        backdrop.hidden = !open;
        backdrop.classList.toggle('is-visible', open);
      }
      if (open) {
        var focusEl = closeBtn || nav.querySelector('a');
        if (focusEl) focusEl.focus();
      } else {
        toggle.focus();
      }
    }

    function onKeydown(e) {
      if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key !== 'Tab' || !document.body.classList.contains('nav-open')) return;
      var items = focusableIn(nav);
      if (!items.length) return;
      var first = items[0];
      var last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    toggle.addEventListener('click', function () {
      setOpen(!document.body.classList.contains('nav-open'));
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        setOpen(false);
      });
    }

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

    document.addEventListener('keydown', onKeydown);

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
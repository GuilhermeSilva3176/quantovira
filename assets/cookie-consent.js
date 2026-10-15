/* Banner de consentimento de cookies (LGPD). Sem dependências externas. */
(function () {
  var STORAGE_KEY = 'qv-cookie-consent';
  var banner = null;

  function readChoice() {
    try {
      var v = localStorage.getItem(STORAGE_KEY);
      if (v === 'accepted' || v === 'rejected') return v;
    } catch (e) { /* storage indisponível */ }
    return null;
  }

  function writeChoice(choice) {
    try {
      localStorage.setItem(STORAGE_KEY, choice);
    } catch (e) { /* ignore */ }
  }

  /**
   * Ponto de integração para Google Consent Mode / CMP certificado.
   * Chamado após Aceitar ou Recusar (e ao carregar se já houver escolha salva).
   * choice: 'accepted' | 'rejected'
   */
  function gtagConsent(cmd, payload) {
    window.dataLayer = window.dataLayer || [];
    if (!window.gtag) {
      window.gtag = function () { window.dataLayer.push(arguments); };
    }
    window.gtag('consent', cmd, payload);
  }

  function defaultConsentDenied() {
    gtagConsent('default', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
      wait_for_update: 500
    });
  }

  function applyConsentToAds(choice) {
    var granted = choice === 'accepted';
    var payload = {
      ad_storage: granted ? 'granted' : 'denied',
      ad_user_data: granted ? 'granted' : 'denied',
      ad_personalization: granted ? 'granted' : 'denied',
      analytics_storage: 'denied'
    };
    gtagConsent('update', payload);
    if (typeof window.qvOnCookieConsent === 'function') {
      window.qvOnCookieConsent(choice, payload);
    }
  }

  function hideBanner() {
    if (banner) {
      banner.hidden = true;
      banner.setAttribute('aria-hidden', 'true');
    }
  }

  function showBanner() {
    if (!banner) return;
    banner.hidden = false;
    banner.setAttribute('aria-hidden', 'false');
  }

  function setChoice(choice, fromUser) {
    writeChoice(choice);
    applyConsentToAds(choice);
    if (fromUser) hideBanner();
  }

  function buildBanner() {
    banner = document.createElement('div');
    banner.id = 'cookie-consent';
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-labelledby', 'cookie-consent-title');
    banner.setAttribute('aria-describedby', 'cookie-consent-desc');
    banner.hidden = true;

    banner.innerHTML =
      '<div class="cookie-banner-inner">' +
      '<p id="cookie-consent-title" class="cookie-banner-title">Cookies e privacidade</p>' +
      '<p id="cookie-consent-desc" class="cookie-banner-text">Usamos cookies essenciais para lembrar sua escolha aqui. ' +
      'Anúncios (Google AdSense), quando ativos, podem usar cookies para exibir e medir publicidade. ' +
      'Os dados que você digita nas calculadoras continuam apenas no seu navegador. ' +
      '<a href="/privacidade/">Saiba mais na política de privacidade</a>.</p>' +
      '<div class="cookie-banner-actions">' +
      '<button type="button" class="cookie-banner-accept" data-choice="accepted">Aceitar</button>' +
      '<button type="button" class="cookie-banner-reject sec" data-choice="rejected">Recusar</button>' +
      '</div></div>';

    banner.addEventListener('click', function (ev) {
      var btn = ev.target.closest('[data-choice]');
      if (!btn) return;
      setChoice(btn.getAttribute('data-choice'), true);
    });

    document.body.appendChild(banner);
  }

  function init() {
    defaultConsentDenied();
    buildBanner();
    var saved = readChoice();
    if (saved) {
      applyConsentToAds(saved);
      hideBanner();
    } else {
      showBanner();
    }
  }

  window.QuantoViraConsent = {
    getChoice: readChoice,
    setChoice: function (choice) { setChoice(choice, true); },
    applyConsentToAds: applyConsentToAds,
    showBanner: showBanner
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

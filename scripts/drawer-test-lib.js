/* Espera o drawer estabilizar e valida posição no viewport. */

function delay(ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
}

async function waitForDrawerSettled(page) {
  await page.waitForSelector('#site-nav.is-open', { timeout: 8000 });
  const settled = await page.evaluate(function () {
    return new Promise(function (resolve) {
      var nav = document.querySelector('#site-nav');
      if (!nav) {
        resolve(false);
        return;
      }
      var done = false;
      function finish() {
        if (done) return;
        done = true;
        resolve(true);
      }
      var t = window.setTimeout(finish, 450);
      nav.addEventListener(
        'transitionend',
        function (e) {
          if (e.propertyName === 'transform') {
            window.clearTimeout(t);
            finish();
          }
        },
        { once: true }
      );
    });
  });
  if (!settled) {
    await delay(450);
  }
}

async function assertDrawerInViewport(page, label) {
  const m = await page.evaluate(function () {
    var nav = document.querySelector('#site-nav');
    var close = document.querySelector('.nav-close');
    if (!nav || !close) {
      return { error: 'drawer ou botão fechar ausente' };
    }
    var nr = nav.getBoundingClientRect();
    var cr = close.getBoundingClientRect();
    var iw = window.innerWidth;
    var cs = window.getComputedStyle(close);
    var closeVisible =
      cr.width >= 40
      && cr.height >= 40
      && cr.left >= 0
      && cr.right <= iw + 0.5
      && cs.visibility !== 'hidden'
      && cs.display !== 'none';
    return {
      innerWidth: iw,
      nav: { left: nr.left, right: nr.right, width: nr.width },
      close: { left: cr.left, right: cr.right, width: cr.width, visible: closeVisible },
      ok:
        nr.left >= -0.5
        && nr.right <= iw + 0.5
        && nr.width > 200
        && closeVisible
    };
  });
  if (m.error) throw new Error((label || 'drawer') + ': ' + m.error);
  if (!m.ok) {
    throw new Error(
      (label || 'drawer') + ' fora do viewport @' + m.innerWidth + 'px: '
        + JSON.stringify(m)
    );
  }
  return m;
}

async function openDrawerForScreenshot(page) {
  await page.click('.nav-toggle');
  await waitForDrawerSettled(page);
  await assertDrawerInViewport(page, 'menu aberto');
}

module.exports = {
  delay: delay,
  waitForDrawerSettled: waitForDrawerSettled,
  assertDrawerInViewport: assertDrawerInViewport,
  openDrawerForScreenshot: openDrawerForScreenshot
};
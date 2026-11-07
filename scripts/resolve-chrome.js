/* Localiza o executável do Chrome/Chromium (CI, macOS, Linux). */
const { execFileSync } = require('child_process');
const fs = require('fs');

function which(name) {
  try {
    const p = execFileSync('which', [name], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    return p || '';
  } catch (e) {
    return '';
  }
}

function usable(path) {
  return typeof path === 'string' && path.length > 0 && fs.existsSync(path) && fs.statSync(path).isFile();
}

function resolveChrome() {
  const ordered = [
    process.env.CHROME,
    process.env.CHROME_PATH,
    process.env.PUPPETEER_EXECUTABLE_PATH
  ];
  const fixed = [
    '/usr/local/bin/google-chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/snap/bin/chromium'
  ];
  const pathDirs = (process.env.PATH || '').split(':').filter(Boolean);
  pathDirs.forEach(function (dir) {
    ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser', 'chrome'].forEach(function (name) {
      fixed.push(dir + '/' + name);
    });
  });
  const all = ordered.concat(fixed);
  for (let i = 0; i < all.length; i++) {
    if (usable(all[i])) return all[i];
  }
  const bins = ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser', 'chrome'];
  for (let j = 0; j < bins.length; j++) {
    const p = which(bins[j]);
    if (usable(p)) return p;
  }
  return null;
}

module.exports = { resolveChrome: resolveChrome, which: which };

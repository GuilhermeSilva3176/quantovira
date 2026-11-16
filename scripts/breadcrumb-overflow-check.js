#!/usr/bin/env node
/* Delega ao checador mobile (360px e 412px, sitemap completo). */
const { spawnSync } = require('child_process');
const path = require('path');
const r = spawnSync('node', [path.join(__dirname, 'mobile-overflow-check.js')], {
  stdio: 'inherit'
});
process.exit(r.status === null ? 1 : r.status);
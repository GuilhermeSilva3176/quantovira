/* Codifica/decodifica os parâmetros do simulador (URL e localStorage). Navegador e Node. */
(function (root) {
  var FIELDS = {
    idade: { min: 16, max: 80, def: 30 },
    patrimonio: { min: 0, max: 1e10, def: 50000 },
    aporteMensal: { min: 0, max: 1e8, def: 3000 },
    gastoMensal: { min: 100, max: 1e8, def: 6000 },
    taxaRetirada: { min: 1, max: 10, def: 3.5 },
    pctAcoes: { min: 0, max: 100, def: 50 },
    idadeFinal: { min: 40, max: 110, def: 95 },
    nSims: { allowed: [1000, 5000, 10000], def: 5000 }
  };
  function clean(key, raw) {
    var f = FIELDS[key]; if (!f || raw === null || raw === undefined || raw === '') return undefined;
    var v = Number(raw); if (!isFinite(v)) return undefined;
    if (f.allowed) return f.allowed.indexOf(v) >= 0 ? v : undefined;
    return Math.min(f.max, Math.max(f.min, v));
  }
  function encode(p) {
    var parts = [];
    Object.keys(FIELDS).forEach(function (k) { var v = clean(k, p[k]); if (v !== undefined) parts.push(k + '=' + encodeURIComponent(String(v))); });
    return parts.join('&');
  }
  function decode(qs) {
    var out = {}; qs = (qs || '').replace(/^\?/, '');
    qs.split('&').forEach(function (kv) {
      if (!kv) return; var i = kv.indexOf('='); if (i < 0) return;
      var k = decodeURIComponent(kv.slice(0, i)), v = clean(k, decodeURIComponent(kv.slice(i + 1)));
      if (v !== undefined) out[k] = v;
    });
    return out;
  }
  // precedência: padrões < localStorage < URL
  function merge(stored, fromUrl) {
    var out = {};
    Object.keys(FIELDS).forEach(function (k) {
      var v = fromUrl[k] !== undefined ? fromUrl[k] : (stored && clean(k, stored[k]) !== undefined ? clean(k, stored[k]) : FIELDS[k].def);
      out[k] = v;
    });
    return out;
  }
  var api = { FIELDS: FIELDS, encode: encode, decode: decode, merge: merge, clean: clean };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.FireParams = api;
})(this);

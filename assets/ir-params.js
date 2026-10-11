/* Codifica os campos do IR de investimentos (URL e localStorage). Navegador e Node. */
(function (root) {
  var ABAS = ['acoes', 'day', 'etf', 'fii', 'cripto', 'exterior'];
  var NUM = {
    mes: { min: 1, max: 12, def: 2 },
    ano: { min: 2024, max: 2035, def: 2026 },
    acoesVendas: { min: 0, max: 1e12, def: 60000 },
    acoesResultado: { min: -1e12, max: 1e12, def: 9967 },
    acoesPrejuizo: { min: 0, max: 1e12, def: 0 },
    acoesIrrf: { min: 0, max: 1e12, def: 3 },
    etfVendas: { min: 0, max: 1e12, def: 0 },
    etfResultado: { min: -1e12, max: 1e12, def: 0 },
    etfPrejuizo: { min: 0, max: 1e12, def: 0 },
    etfIrrf: { min: 0, max: 1e12, def: 0 },
    dayVendas: { min: 0, max: 1e12, def: 0 },
    dayResultado: { min: -1e12, max: 1e12, def: 0 },
    dayPrejuizo: { min: 0, max: 1e12, def: 0 },
    dayIrrf: { min: 0, max: 1e12, def: 0 },
    fiiVendas: { min: 0, max: 1e12, def: 0 },
    fiiResultado: { min: -1e12, max: 1e12, def: 0 },
    fiiPrejuizo: { min: 0, max: 1e12, def: 0 },
    fiiIrrf: { min: 0, max: 1e12, def: 0 },
    fiiRendValor: { min: 0, max: 1e12, def: 0 },
    etfRfResultado: { min: -1e12, max: 1e12, def: 0 },
    criptoVendas: { min: 0, max: 1e12, def: 0 },
    criptoResultado: { min: -1e12, max: 1e12, def: 0 },
    criptoPrejuizo: { min: 0, max: 1e12, def: 0 },
    extRend1: { min: 0, max: 1e12, def: 0 },
    extPago1: { min: 0, max: 1e12, def: 0 },
    extRend2: { min: 0, max: 1e12, def: 0 },
    extPago2: { min: 0, max: 1e12, def: 0 },
    extRend3: { min: 0, max: 1e12, def: 0 },
    extPago3: { min: 0, max: 1e12, def: 0 },
    extPrejuizo: { min: 0, max: 1e12, def: 0 },
    atrasoDias: { min: 0, max: 100000, def: 0 },
    atrasoSelic: { min: -100, max: 1000, def: null, vazio: true }
  };
  var ENUM = {
    fiiRendEnq: { valores: ['isento', 'tributado', 'nao-sei'], def: 'isento' },
    etfRfPrazo: { valores: ['', 'ate180', 'ate720', 'acima720'], def: '' },
    criptoLocal: { valores: ['brasil', 'exterior'], def: 'brasil' },
    aba: { valores: ABAS, def: 'acoes' }
  };
  var BOOL = {
    extAcordo: false,
    atrasoMesPosterior: true
  };
  var ALIAS = { extRendimento: 'extRend1', extImposto: 'extPago1' };

  function cleanNum(key, raw) {
    var f = NUM[key];
    if (!f) return undefined;
    if (raw === null || raw === undefined || raw === '') return f.vazio ? null : undefined;
    var v = Number(raw);
    if (!isFinite(v)) return undefined;
    return Math.min(f.max, Math.max(f.min, v));
  }
  function cleanEnum(key, raw) {
    var f = ENUM[key];
    if (!f || raw === null || raw === undefined) return undefined;
    var s = String(raw);
    return f.valores.indexOf(s) >= 0 ? s : undefined;
  }
  function cleanBool(key, raw) {
    if (!(key in BOOL)) return undefined;
    if (raw === true || raw === 1 || raw === '1' || raw === 'true') return true;
    if (raw === false || raw === 0 || raw === '0' || raw === 'false') return false;
    return undefined;
  }
  function encode(p) {
    p = p || {};
    var parts = [];
    Object.keys(NUM).forEach(function (k) {
      var v = cleanNum(k, p[k]);
      if (v === undefined) v = NUM[k].def;
      parts.push(k + '=' + (v == null ? '' : encodeURIComponent(String(v))));
    });
    Object.keys(ENUM).forEach(function (k) {
      var v = cleanEnum(k, p[k]);
      if (v === undefined) v = ENUM[k].def;
      parts.push(k + '=' + encodeURIComponent(v));
    });
    Object.keys(BOOL).forEach(function (k) {
      var v = cleanBool(k, p[k]);
      if (v === undefined) v = BOOL[k];
      parts.push(k + '=' + (v ? '1' : '0'));
    });
    return parts.join('&');
  }
  function decode(qs) {
    var out = {};
    qs = (qs || '').replace(/^\?/, '');
    qs.split('&').forEach(function (kv) {
      if (!kv) return;
      var i = kv.indexOf('=');
      if (i < 0) return;
      var k = decodeURIComponent(kv.slice(0, i));
      var raw = decodeURIComponent(kv.slice(i + 1));
      if (ALIAS[k]) {
        var dest = ALIAS[k];
        if (out[dest] === undefined) {
          var legado = cleanNum(dest, raw);
          if (legado !== undefined) out[dest] = legado;
        }
      } else if (NUM[k]) {
        var n = cleanNum(k, raw);
        if (n !== undefined) out[k] = n;
      } else if (ENUM[k]) {
        var e = cleanEnum(k, raw);
        if (e !== undefined) out[k] = e;
      } else if (k in BOOL) {
        var b = cleanBool(k, raw);
        if (b !== undefined) out[k] = b;
      }
    });
    return out;
  }
  function merge(stored, fromUrl) {
    var out = {};
    fromUrl = fromUrl || {};
    stored = stored || {};
    function guardado(k) {
      if (stored[k] !== undefined) return stored[k];
      if (k === 'extRend1' && stored.extRendimento !== undefined) return stored.extRendimento;
      if (k === 'extPago1' && stored.extImposto !== undefined) return stored.extImposto;
      return undefined;
    }
    Object.keys(NUM).forEach(function (k) {
      var antigo = guardado(k);
      if (fromUrl[k] !== undefined) out[k] = fromUrl[k];
      else if (antigo !== undefined && cleanNum(k, antigo) !== undefined) out[k] = cleanNum(k, antigo);
      else out[k] = NUM[k].def;
    });
    Object.keys(ENUM).forEach(function (k) {
      if (fromUrl[k] !== undefined) out[k] = fromUrl[k];
      else if (stored[k] !== undefined && cleanEnum(k, stored[k]) !== undefined) out[k] = cleanEnum(k, stored[k]);
      else out[k] = ENUM[k].def;
    });
    Object.keys(BOOL).forEach(function (k) {
      if (fromUrl[k] !== undefined) out[k] = fromUrl[k];
      else if (stored[k] !== undefined && cleanBool(k, stored[k]) !== undefined) out[k] = cleanBool(k, stored[k]);
      else out[k] = BOOL[k];
    });
    return out;
  }
  var api = { NUM: NUM, ENUM: ENUM, BOOL: BOOL, ABAS: ABAS, encode: encode, decode: decode, merge: merge };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.IrParams = api;
})(typeof window === 'object' ? window : global);

/* Codifica/decodifica parâmetros de calculadoras (URL e localStorage). Navegador e Node. */
(function (root) {
  function makeApi(FIELDS) {
    function clean(key, raw) {
      var f = FIELDS[key];
      if (!f || raw === null || raw === undefined || raw === '') return undefined;
      if (f.type === 'bool') return raw === true || raw === '1' || raw === 'true';
      if (f.type === 'enum') return f.valores.indexOf(String(raw)) >= 0 ? String(raw) : undefined;
      var v = Number(raw);
      if (!isFinite(v)) return undefined;
      if (f.allowed) return f.allowed.indexOf(v) >= 0 ? v : undefined;
      return Math.min(f.max, Math.max(f.min, v));
    }
    function encode(p) {
      var parts = [];
      Object.keys(FIELDS).forEach(function (k) {
        var f = FIELDS[k];
        var v = p[k];
        if (v === undefined || v === null || v === '') return;
        if (f.type === 'bool') {
          if (v) parts.push(k + '=1');
          return;
        }
        var c = clean(k, v);
        if (c !== undefined) parts.push(k + '=' + encodeURIComponent(String(c)));
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
        var v = clean(k, raw);
        if (v !== undefined) out[k] = v;
      });
      return out;
    }
    function merge(stored, fromUrl) {
      var out = {};
      Object.keys(FIELDS).forEach(function (k) {
        var f = FIELDS[k];
        var def = f.def;
        if (f.type === 'bool' && def === undefined) def = false;
        var v =
          fromUrl[k] !== undefined
            ? fromUrl[k]
            : stored && clean(k, stored[k]) !== undefined
              ? clean(k, stored[k])
              : def;
        out[k] = v;
      });
      return out;
    }
    return { FIELDS: FIELDS, encode: encode, decode: decode, merge: merge, clean: clean };
  }
  var api = { make: makeApi };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.QvToolParams = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);

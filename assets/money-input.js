/* Máscara e parse de valores monetários e percentuais (BR). Navegador e Node. */
(function (root) {
  function onlyDigits(s) {
    return String(s || '').replace(/\D/g, '');
  }

  /** Normaliza strings de URL, colagem ou campo para número. */
  function parseDecimal(raw, opts) {
    opts = opts || {};
    if (raw === null || raw === undefined) return NaN;
    if (typeof raw === 'number') return isFinite(raw) ? raw : NaN;
    var s = String(raw).trim();
    if (s === '' || s === '-' || s === ',' || s === '.') return NaN;
    if (!opts.allowNegative && s.indexOf('-') >= 0) return NaN;

    var neg = false;
    if (s.charAt(0) === '-') {
      neg = true;
      s = s.slice(1).trim();
    }

    var hasComma = s.indexOf(',') >= 0;
    var hasDot = s.indexOf('.') >= 0;
    var normalized;

    if (hasComma && hasDot) {
      var lastComma = s.lastIndexOf(',');
      var lastDot = s.lastIndexOf('.');
      if (lastComma > lastDot) {
        normalized = s.replace(/\./g, '').replace(',', '.');
      } else {
        normalized = s.replace(/,/g, '');
      }
    } else if (hasComma) {
      var parts = s.split(',');
      if (parts.length > 2) return NaN;
      if (parts.length === 2 && parts[1].length === 3 && parts[0].length > 0 && onlyDigits(parts[0]) === parts[0]) {
        normalized = parts[0] + parts[1];
      } else {
        normalized = s.replace(/\./g, '').replace(',', '.');
      }
    } else if (hasDot) {
      var dotParts = s.split('.');
      if (dotParts.length > 2) return NaN;
      if (dotParts.length === 2 && dotParts[1].length === 3 && onlyDigits(dotParts[0]) === dotParts[0] && dotParts[0].length > 0) {
        normalized = dotParts[0] + dotParts[1];
      } else {
        normalized = s;
      }
    } else {
      normalized = s.replace(/\s/g, '');
    }

  normalized = normalized.replace(/[^\d.]/g, '');
    var v = parseFloat(normalized);
    if (!isFinite(v)) return NaN;
    if (neg) v = -v;
    if (!opts.allowNegative && v < 0) return NaN;
    return v;
  }

  function parseParamNumber(raw) {
    return parseDecimal(raw, { allowNegative: true });
  }

  function parseInteger(raw) {
    if (raw === null || raw === undefined || raw === '') return NaN;
    var s = String(raw).trim().replace(/\./g, '').replace(/,/g, '');
    if (!/^\d+$/.test(s)) {
      var v = parseDecimal(raw);
      if (!isFinite(v)) return NaN;
      return Math.trunc(v);
    }
    var n = parseInt(s, 10);
    return isFinite(n) ? n : NaN;
  }

  function fracDigits(n, def) {
    if (!isFinite(n)) return def;
    var s = String(n);
    var i = s.indexOf('.');
    return i < 0 ? 0 : Math.min(s.length - i - 1, 6);
  }

  function formatMoney(v, decimals) {
    if (!isFinite(v)) return '';
    decimals = decimals == null ? 2 : decimals;
    return v.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }

  function formatPercent(v, decimals) {
    if (!isFinite(v)) return '';
    decimals = decimals == null ? 1 : decimals;
    return v.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }

  function formatInteger(v) {
    if (!isFinite(v)) return '';
    return String(Math.trunc(v));
  }

  function optsFromEl(el) {
    return {
      kind: el.getAttribute('data-qv-kind') || 'decimal',
      min: el.hasAttribute('data-qv-min') ? parseFloat(el.getAttribute('data-qv-min')) : (el.min !== '' ? parseFloat(el.min) : undefined),
      max: el.hasAttribute('data-qv-max') ? parseFloat(el.getAttribute('data-qv-max')) : (el.max !== '' ? parseFloat(el.max) : undefined),
      decimals: el.hasAttribute('data-qv-decimals') ? parseInt(el.getAttribute('data-qv-decimals'), 10) : null,
      allowNegative: el.getAttribute('data-qv-allow-negative') === '1' || el.getAttribute('data-qv-allow-negative') === 'true'
    };
  }

  function defaultDecimals(kind, step) {
    if (kind === 'money') return 2;
    if (kind === 'integer') return 0;
    if (step) {
      var d = fracDigits(parseFloat(step), 1);
      return Math.max(1, Math.min(d, 4));
    }
    return 1;
  }

  function displayFor(el, v) {
    var o = optsFromEl(el);
    var dec = o.decimals != null ? o.decimals : defaultDecimals(o.kind, el.getAttribute('data-qv-step') || el.step);
    if (o.kind === 'money') return formatMoney(v, dec);
    if (o.kind === 'percent') return formatPercent(v, dec);
    if (o.kind === 'integer') return formatInteger(v);
    return formatMoney(v, dec);
  }

  function readInput(el) {
    if (!el) return NaN;
    var o = optsFromEl(el);
    var v;
    if (o.kind === 'integer') v = parseInteger(el.value);
    else v = parseDecimal(el.value, { allowNegative: o.allowNegative });
    if (!isFinite(v)) return NaN;
    if (o.min !== undefined && isFinite(o.min) && v < o.min) v = o.min;
    if (o.max !== undefined && isFinite(o.max) && v > o.max) v = o.max;
    return v;
  }

  function setInputValue(el, v) {
    if (!el) return;
    if (!isFinite(v)) {
      el.value = '';
      return;
    }
    el.value = displayFor(el, v);
  }

  function stripToEditable(s) {
    return String(s || '').replace(/[^\d,.\-]/g, '');
  }

  function bind(el) {
    if (!el || el.getAttribute('data-qv-bound') === '1') return;
    el.setAttribute('data-qv-bound', '1');
    var o = optsFromEl(el);
    if (el.type === 'number') el.type = 'text';
    if (o.kind === 'integer') {
      if (!el.getAttribute('inputmode')) el.setAttribute('inputmode', 'numeric');
    } else if (!el.getAttribute('inputmode')) {
      el.setAttribute('inputmode', 'decimal');
    }
    el.setAttribute('autocomplete', 'off');

    el.addEventListener('focus', function () {
      var v = readInput(el);
      if (isFinite(v)) {
        var dec = o.decimals != null ? o.decimals : (o.kind === 'money' ? 2 : defaultDecimals(o.kind, el.getAttribute('data-qv-step')));
        if (o.kind === 'integer') el.value = formatInteger(v);
        else if (dec <= 0) el.value = String(Math.trunc(v));
        else el.value = String(v).replace('.', ',');
      }
    });

    el.addEventListener('blur', function () {
      var v = readInput(el);
      if (isFinite(v)) setInputValue(el, v);
      else if (el.value.trim() === '') el.value = '';
      else {
        var parsed = o.kind === 'integer' ? parseInteger(el.value) : parseDecimal(el.value, { allowNegative: o.allowNegative });
        if (isFinite(parsed)) setInputValue(el, parsed);
      }
    });

    el.addEventListener('input', function () {
      if (o.kind === 'integer') {
        el.value = el.value.replace(/[^\d]/g, '');
        return;
      }
      var cleaned = stripToEditable(el.value);
      if (cleaned !== el.value) el.value = cleaned;
    });
  }

  function init(root) {
    root = root || (typeof document !== 'undefined' ? document : null);
    if (!root) return;
    var nodes = root.querySelectorAll('[data-qv-kind]');
    for (var i = 0; i < nodes.length; i++) bind(nodes[i]);
  }

  function readById(id) {
    var el = typeof document !== 'undefined' ? document.getElementById(id) : null;
    return readInput(el);
  }

  var api = {
    parseDecimal: parseDecimal,
    parseParamNumber: parseParamNumber,
    parseInteger: parseInteger,
    formatMoney: formatMoney,
    formatPercent: formatPercent,
    formatInteger: formatInteger,
    readInput: readInput,
    setInputValue: setInputValue,
    bind: bind,
    init: init,
    readById: readById
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else {
    root.QvMoneyInput = api;
    if (typeof document !== 'undefined') {
      document.addEventListener('DOMContentLoaded', function () {
        init(document);
        var nodes = document.querySelectorAll('[data-qv-kind]');
        for (var i = 0; i < nodes.length; i++) {
          var el = nodes[i];
          if (el.value && /^\d+(\.\d+)?$/.test(String(el.value).trim())) {
            var v = parseFloat(el.value);
            if (isFinite(v)) setInputValue(el, v);
          }
        }
      });
    }
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
/* StringLog UI. All persistence goes through SL.DataService (never localStorage directly). */
(function () {
  'use strict';
  var U = SL.util, DS = SL.DataService, C = U.COLORS;
  var h = React.createElement;
  var useState = React.useState, useEffect = React.useEffect, useRef = React.useRef,
      useMemo = React.useMemo, useCallback = React.useCallback, useContext = React.useContext;

  // ============================ Navigation ============================
  var Nav = React.createContext(null);
  function useNav() { return useContext(Nav); }

  // ============================ Icons ============================
  function Icon(props) {
    var size = props.size || 24, color = props.color || 'currentColor', sw = props.stroke || 1.9;
    var content;
    switch (props.name) {
      case 'racquet':
        content = h('g', null,
          h('ellipse', { cx: 11, cy: 8.5, rx: 6.4, ry: 7.2 }),
          h('line', { x1: 11, y1: 1.5, x2: 11, y2: 15.5 }),
          h('line', { x1: 4.7, y1: 8.5, x2: 17.3, y2: 8.5 }),
          h('line', { x1: 6.6, y1: 3.6, x2: 15.4, y2: 13.4 }),
          h('line', { x1: 15.4, y1: 3.6, x2: 6.6, y2: 13.4 }),
          h('path', { d: 'M8.6 15 L11 22 L13.4 15' })); break;
      case 'plus':
        content = h('g', null, h('line', { x1: 12, y1: 5, x2: 12, y2: 19 }), h('line', { x1: 5, y1: 12, x2: 19, y2: 12 })); break;
      case 'history':
        content = h('g', null,
          h('line', { x1: 4, y1: 6, x2: 20, y2: 6 }), h('line', { x1: 4, y1: 12, x2: 20, y2: 12 }), h('line', { x1: 4, y1: 18, x2: 13, y2: 18 })); break;
      case 'settings':
        content = h('g', null, h('circle', { cx: 12, cy: 12, r: 3 }),
          h('path', { d: 'M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.1 5.1l2.1 2.1M16.8 16.8l2.1 2.1M18.9 5.1l-2.1 2.1M7.2 16.8l-2.1 2.1' })); break;
      case 'chevron':
        content = h('path', { d: 'M9 6l6 6-6 6' }); break;
      case 'back':
        content = h('path', { d: 'M15 6l-6 6 6 6' }); break;
      case 'share':
        content = h('g', null, h('circle', { cx: 18, cy: 5, r: 2.5 }), h('circle', { cx: 6, cy: 12, r: 2.5 }), h('circle', { cx: 18, cy: 19, r: 2.5 }),
          h('line', { x1: 8.1, y1: 10.7, x2: 15.9, y2: 6.3 }), h('line', { x1: 8.1, y1: 13.3, x2: 15.9, y2: 17.7 })); break;
      case 'star':
        return h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: props.fill || 'none', stroke: color, strokeWidth: sw, strokeLinejoin: 'round' },
          h('polygon', { points: '12,2.5 14.9,8.6 21.5,9.5 16.7,14.2 17.9,20.8 12,17.6 6.1,20.8 7.3,14.2 2.5,9.5 9.1,8.6' }));
      case 'check':
        content = h('path', { d: 'M5 12l4.5 4.5L19 7' }); break;
      case 'trophy':
        content = h('g', null,
          h('path', { d: 'M7.5 3.5h9V8a4.5 4.5 0 01-9 0V3.5z' }),
          h('path', { d: 'M7.5 5H4.6c.1 2 1.4 3.3 3.2 3.5' }),
          h('path', { d: 'M16.5 5h2.9c-.1 2-1.4 3.3-3.2 3.5' }),
          h('line', { x1: 12, y1: 12.9, x2: 12, y2: 15.6 }),
          h('path', { d: 'M9.4 18.5h5.2M10.4 15.6h3.2' })); break;
      default: content = null;
    }
    return h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round' }, content);
  }

  // ============================ Primitives ============================
  function Header(props) {
    return h('div', {
      style: {
        flexShrink: 0, paddingTop: 'calc(env(safe-area-inset-top) + 12px)',
        paddingBottom: 12, paddingLeft: 10, paddingRight: 10,
        display: 'flex', alignItems: 'center', gap: 6,
        borderBottom: '1px solid ' + C.border, background: C.bg
      }
    },
      props.onBack ? h('button', { onClick: props.onBack, style: { display: 'flex', alignItems: 'center', color: C.gold, padding: '4px 4px' } },
        h(Icon, { name: 'back', size: 26, color: C.gold }), h('span', { style: { fontSize: 17 } }, 'Back')) : h('div', { style: { width: 6 } }),
      h('div', { style: { flex: 1, fontSize: 19, fontWeight: 700, textAlign: props.onBack ? 'center' : 'left', paddingLeft: props.onBack ? 0 : 6 } }, props.title),
      h('div', { style: { minWidth: props.onBack ? 64 : 0, display: 'flex', justifyContent: 'flex-end' } }, props.right || null));
  }

  function Screen(props) {
    return h('div', { style: { display: 'flex', flexDirection: 'column', height: '100%' } },
      h(Header, { title: props.title, onBack: props.onBack, right: props.right }),
      h('div', { className: props.noScroll ? '' : 'scroll', style: { flex: 1, padding: props.pad === false ? 0 : '14px 14px 28px' } }, props.children));
  }

  function Card(props) {
    return h('div', {
      onClick: props.onClick,
      className: props.className,
      style: Object.assign({
        background: C.card, border: '1px solid ' + C.border, borderRadius: 14,
        padding: 14, marginBottom: 12
      }, props.onClick ? { cursor: 'pointer' } : {}, props.style || {})
    }, props.children);
  }

  function Button(props) {
    var variant = props.variant || 'primary';
    var base = {
      width: props.full === false ? 'auto' : '100%', padding: '13px 16px', borderRadius: 12,
      fontSize: 16, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      transition: 'opacity .15s', opacity: props.disabled ? 0.45 : 1
    };
    var skins = {
      primary: { background: C.gold, color: '#1a1408' },
      secondary: { background: C.card2, color: C.text, border: '1px solid ' + C.border },
      ghost: { background: 'transparent', color: C.gold, border: '1px solid ' + C.gold },
      danger: { background: 'transparent', color: C.red, border: '1px solid ' + C.red }
    };
    return h('button', {
      onClick: props.disabled ? null : props.onClick, disabled: props.disabled,
      style: Object.assign(base, skins[variant], props.style || {})
    }, props.icon ? h(Icon, { name: props.icon, size: 19, color: variant === 'primary' ? '#1a1408' : (skins[variant].color) }) : null, props.children);
  }

  function Badge(props) {
    var map = { green: C.green, yellow: C.yellow, red: C.red, gold: C.gold, dim: C.textDim };
    var col = map[props.tone] || C.textDim;
    return h('span', {
      style: {
        fontSize: 11, fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase',
        color: col, border: '1px solid ' + col, borderRadius: 20, padding: '2px 9px', whiteSpace: 'nowrap'
      }
    }, props.children);
  }

  function StatusDot(props) {
    var map = { green: C.green, yellow: C.yellow, red: C.red };
    return h('span', { style: { display: 'inline-block', width: 9, height: 9, borderRadius: 9, background: map[props.tone] || C.textDim, flexShrink: 0 } });
  }

  function EmptyState(props) {
    return h('div', { style: { textAlign: 'center', padding: '54px 22px', animation: 'fadeIn .25s' } },
      h('div', { style: { fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 8 } }, props.title),
      props.subtitle ? h('div', { style: { fontSize: 14.5, color: C.textDim, lineHeight: 1.5, marginBottom: 22, maxWidth: 300, marginLeft: 'auto', marginRight: 'auto' } }, props.subtitle) : null,
      props.action || null);
  }

  // ============================ Form primitives ============================
  var inputStyle = {
    width: '100%', background: C.card2, border: '1px solid ' + C.border, borderRadius: 10,
    padding: '12px 12px', color: C.text, fontSize: 16, outline: 'none'
  };
  function Field(props) {
    return h('div', { style: Object.assign({ marginBottom: 14 }, props.style || {}) },
      props.label ? h('div', { style: { fontSize: 13, color: C.textDim, marginBottom: 6, fontWeight: 600 } },
        props.label, props.required ? h('span', { style: { color: C.gold } }, ' *') : null) : null,
      props.children,
      props.hint ? h('div', { style: { fontSize: 12, color: C.textDim, marginTop: 5 } }, props.hint) : null);
  }
  function TextField(props) {
    return h(Field, { label: props.label, hint: props.hint, required: props.required },
      h('input', {
        type: 'text', value: props.value || '', placeholder: props.placeholder || '',
        autoCapitalize: props.autoCapitalize || 'words', autoCorrect: 'off',
        onChange: function (e) { props.onChange(e.target.value); }, style: inputStyle
      }));
  }
  function NumberField(props) {
    var min = props.min != null ? props.min : 0; // negative values are never meaningful in this app
    return h(Field, { label: props.label, hint: props.hint, required: props.required },
      h('div', { style: { position: 'relative' } },
        h('input', {
          type: 'number', inputMode: 'decimal', value: props.value == null ? '' : props.value,
          placeholder: props.placeholder || '', step: props.step || 'any', min: min,
          onChange: function (e) {
            if (e.target.value === '') return props.onChange(null);
            var n = Number(e.target.value);
            props.onChange(isNaN(n) ? null : (n < min ? min : n));
          },
          style: Object.assign({}, inputStyle, props.suffix ? { paddingRight: 48 } : {})
        }),
        props.suffix ? h('span', { style: { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: C.textDim, fontSize: 14, pointerEvents: 'none' } }, props.suffix) : null));
  }
  function TextArea(props) {
    return h(Field, { label: props.label, hint: props.hint },
      h('textarea', {
        value: props.value || '', placeholder: props.placeholder || '', rows: props.rows || 3,
        onChange: function (e) { props.onChange(e.target.value); }, style: Object.assign({}, inputStyle, { lineHeight: 1.4 })
      }));
  }
  function SelectField(props) {
    return h(Field, { label: props.label, hint: props.hint, required: props.required },
      h('div', { style: { position: 'relative' } },
        h('select', {
          value: props.value || '', onChange: function (e) { props.onChange(e.target.value); },
          style: Object.assign({}, inputStyle, { appearance: 'none', WebkitAppearance: 'none', paddingRight: 34 })
        },
          props.placeholder ? h('option', { value: '' }, props.placeholder) : null,
          props.options.map(function (o) {
            var val = typeof o === 'string' ? o : o.value;
            var lab = typeof o === 'string' ? o : o.label;
            return h('option', { key: val, value: val }, lab);
          })),
        h('span', { style: { position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: C.textDim, fontSize: 12 } }, '▼')));
  }
  function Segmented(props) {
    return h(Field, { label: props.label, hint: props.hint, required: props.required },
      h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 8 } },
        props.options.map(function (o) {
          var sel = props.value === o.value;
          return h('button', {
            key: o.value, onClick: function () { SL.platform.haptic('select'); props.onChange(o.value); },
            style: {
              padding: '9px 13px', borderRadius: 10, fontSize: 14, fontWeight: 600,
              background: sel ? C.gold : C.card2, color: sel ? '#1a1408' : C.text,
              border: '1px solid ' + (sel ? C.gold : C.border)
            }
          }, o.label);
        })));
  }
  function DateField(props) {
    return h(Field, { label: props.label, hint: props.hint, required: props.required },
      h('input', {
        type: 'date', value: props.value || '',
        max: props.max !== undefined ? props.max : U.todayISODate(), // logs record the past, not the future
        onChange: function (e) { props.onChange(e.target.value || null); },
        style: Object.assign({}, inputStyle, { minHeight: 46 })
      }));
  }
  function Toggle(props) {
    function flip() { SL.platform.haptic('select'); props.onChange(!props.value); }
    return h('div', {
      role: 'switch', 'aria-checked': !!props.value, 'aria-label': props.label, tabIndex: 0,
      onClick: flip,
      onKeyDown: function (e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); flip(); } },
      style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', cursor: 'pointer' }
    },
      h('div', { style: { paddingRight: 12 } },
        h('div', { style: { fontSize: 15.5, color: C.text } }, props.label),
        props.hint ? h('div', { style: { fontSize: 12.5, color: C.textDim, marginTop: 2 } }, props.hint) : null),
      h('div', { style: { width: 50, height: 30, borderRadius: 30, background: props.value ? C.gold : '#3a3a3a', position: 'relative', transition: 'background .18s', flexShrink: 0 } },
        h('div', { style: { position: 'absolute', top: 3, left: props.value ? 23 : 3, width: 24, height: 24, borderRadius: 24, background: '#fff', transition: 'left .18s' } })));
  }
  function StarRating(props) {
    var size = props.size || 32, val = props.value || 0;
    return h('div', { style: { display: 'flex', gap: 5, alignItems: 'center' } },
      [1, 2, 3, 4, 5].map(function (n) {
        return h('button', {
          key: n, 'aria-label': n + (n === 1 ? ' star' : ' stars'), 'aria-pressed': n <= val,
          onClick: props.onChange ? function () { SL.platform.haptic('select'); props.onChange(n === val ? null : n); } : null,
          style: { padding: 2, lineHeight: 0, cursor: props.onChange ? 'pointer' : 'default' }
        }, h(Icon, { name: 'star', size: size, color: C.gold, fill: n <= val ? C.gold : 'none', stroke: 1.5 }));
      }),
      props.showLabel && val ? h('span', { style: { marginLeft: 8, color: C.gold, fontSize: 15, fontWeight: 700 } }, U.FEEL_LABELS[val]) : null);
  }

  // Read-only spec row (label left, value right)
  function SpecRow(props) {
    if (props.value == null || props.value === '') return null;
    return h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '7px 0', borderBottom: '1px solid ' + C.border, gap: 12 } },
      h('span', { style: { fontSize: 13.5, color: C.textDim } }, props.label),
      h('span', { style: { fontSize: 14.5, color: C.text, fontWeight: 600, textAlign: 'right' } }, props.value));
  }
  function SectionLabel(props) {
    return h('div', { style: Object.assign({ fontSize: 12, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: C.textDim, margin: '18px 2px 8px' }, props.style || {}) }, props.children);
  }

  // Tension entered/displayed in the user's unit; always stored as lbs.
  function TensionField(props) {
    var kg = props.units === 'kg';
    var shown = props.value == null ? null : (kg ? U.round1(U.lbsToKg(props.value)) : props.value);
    return h(NumberField, {
      label: props.label, required: props.required, hint: props.hint,
      suffix: kg ? 'kg' : 'lbs', placeholder: kg ? '25' : '55', value: shown,
      onChange: function (x) { props.onChange(x == null ? null : (kg ? U.round1(U.kgToLbs(x)) : x)); }
    });
  }

  // Searchable string picker (catalog + remembered customs) with manual fallback.
  function StringPicker(props) {
    var v = props.value || {};
    var qs = useState(''); var query = qs[0], setQuery = qs[1];
    var fs = useState(false); var focused = fs[0], setFocused = fs[1];
    var ms = useState(false); var manual = ms[0], setManual = ms[1];
    var selected = v.brand && v.model;
    function choose(s) {
      props.onChange({ brand: s.brand, model: s.model, gauge: s.gauge_label || (s.gauge_mm != null ? String(s.gauge_mm) : ''), type: s.type || '' });
      setQuery(''); setFocused(false); setManual(false);
    }
    function clear() { props.onChange({ brand: '', model: '', gauge: '', type: '' }); setManual(false); setQuery(''); }
    var results = focused ? DS.searchStrings(query).slice(0, 8) : [];
    return h(Field, { label: props.label, required: props.required },
      selected && !manual
        ? h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, background: C.card2, border: '1px solid ' + C.border, borderRadius: 10, padding: '11px 12px' } },
            h('div', { style: { minWidth: 0 } },
              h('div', { style: { fontSize: 15, color: C.text, fontWeight: 600 } }, v.brand + ' ' + v.model),
              h('div', { style: { fontSize: 12.5, color: C.textDim, marginTop: 2 } }, [v.gauge, v.type].filter(Boolean).join(' · ') || 'string selected')),
            h('button', { onClick: clear, style: { color: C.gold, fontSize: 14, flexShrink: 0 } }, 'Change'))
        : h('div', null,
            h('input', {
              type: 'text', value: query, placeholder: props.placeholder || 'Search strings…',
              autoCapitalize: 'words', autoCorrect: 'off',
              onChange: function (e) { setQuery(e.target.value); }, onFocus: function () { setFocused(true); },
              onBlur: function () { setTimeout(function () { setFocused(false); }, 200); }, style: inputStyle
            }),
            focused ? h('div', { style: { marginTop: 6, background: C.card2, border: '1px solid ' + C.border, borderRadius: 10, overflow: 'hidden', maxHeight: 264, overflowY: 'auto' } },
              results.map(function (s) {
                return h('button', { key: s.id, onMouseDown: function (e) { e.preventDefault(); }, onClick: function () { choose(s); },
                  style: { display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid ' + C.border, background: 'transparent' } },
                  h('div', { style: { fontSize: 14.5, color: C.text } }, (s.custom ? '★ ' : '') + s.brand + ' ' + s.model),
                  h('div', { style: { fontSize: 12, color: C.textDim, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } },
                    [s.gauge_label, s.type, s.recommended_for].filter(Boolean).join(' · ')));
              }),
              h('button', { onMouseDown: function (e) { e.preventDefault(); }, onClick: function () { setManual(true); setFocused(false); },
                style: { display: 'block', width: '100%', textAlign: 'left', padding: '11px 12px', background: 'transparent', color: C.gold, fontWeight: 600, fontSize: 14 } },
                '+ Enter a string not listed')) : null),
      manual ? h('div', { style: { marginTop: 10, padding: 12, background: C.card2, border: '1px solid ' + C.border, borderRadius: 10 } },
        h('div', { style: { fontSize: 12.5, color: C.textDim, marginBottom: 8 } }, 'Enter string details (saved for next time):'),
        h(TextField, { label: 'Brand', value: v.brand, onChange: function (x) { props.onChange(Object.assign({}, v, { brand: x })); } }),
        h(TextField, { label: 'Model', value: v.model, onChange: function (x) { props.onChange(Object.assign({}, v, { model: x })); } }),
        h('div', { style: { display: 'flex', gap: 12 } },
          h('div', { style: { flex: 1 } }, h(TextField, { label: 'Gauge', value: v.gauge, onChange: function (x) { props.onChange(Object.assign({}, v, { gauge: x })); }, placeholder: '17g', autoCapitalize: 'none' })),
          h('div', { style: { flex: 1.4 } }, h(SelectField, { label: 'Type', value: v.type, onChange: function (x) { props.onChange(Object.assign({}, v, { type: x })); }, placeholder: 'Type', options: U.STRING_TYPES }))),
        h('button', { onClick: function () { setManual(false); }, style: { color: C.gold, fontSize: 14 } }, 'Done')) : null);
  }

  // ============================ Tab roots (placeholders filled in next) ============================
  function RacquetsTab() {
    var nav = useNav();
    var racquets = DS.listRacquets({ activeOnly: true });
    function add() { nav.push(AddRacquetScreen, {}); }
    return h(Screen, {
      title: 'Racquets',
      right: racquets.length ? h('button', { 'aria-label': 'Add racquet', onClick: add, style: { color: C.gold, display: 'flex', alignItems: 'center', padding: 4 } }, h(Icon, { name: 'plus', size: 26, color: C.gold })) : null
    },
      racquets.length === 0
        ? h(EmptyState, {
            title: 'Add your first racquet',
            subtitle: 'Track your racquets, string setups, and how each one plays over time.',
            action: h('div', { style: { maxWidth: 280, margin: '0 auto' } }, h(Button, { icon: 'plus', onClick: add }, 'Add Racquet'))
          })
        : h('div', { className: 'fade-enter' }, racquets.map(function (r) {
            return h(RacquetCard, { key: r.id, racquet: r, onClick: function () { nav.push(RacquetDetail, { id: r.id }); } });
          })));
  }

  function RacquetCard(props) {
    var r = props.racquet, settings = DS.getSettings();
    var job = DS.currentStringJob(r.id);
    var hours = job ? DS.hoursPlayedForJob(job.id) : 0;
    var days = job ? U.daysSince(job.date_strung) : null;
    var status = job ? (job.date_broke ? 'red' : U.stringStatus(days, hours, settings)) : null;
    return h(Card, { onClick: props.onClick },
      h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 } },
        h('div', { style: { flex: 1, minWidth: 0 } },
          h('div', { style: { fontSize: 17, fontWeight: 700, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, r.nickname || (r.brand + ' ' + r.model)),
          r.nickname ? h('div', { style: { fontSize: 13, color: C.textDim, marginTop: 1 } }, r.brand + ' ' + r.model) : null),
        r.is_active === false ? h(Badge, { tone: 'dim' }, 'Retired') : (status ? h(StatusDot, { tone: status }) : null)),
      job
        ? h('div', { style: { marginTop: 10 } },
            h('div', { style: { display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' } },
              h('span', { style: { fontSize: 14.5, color: C.text } }, job.mains_string_brand + ' ' + job.mains_string_model),
              h('span', { style: { fontSize: 17, fontWeight: 800, color: C.gold } }, U.displayTension(job.mains_tension_lbs, settings.units))),
            h('div', { style: { fontSize: 12.5, color: C.textDim, marginTop: 4 } },
              'Strung ' + U.formatDate(job.date_strung) + (job.date_broke ? ' · Broke ' + U.formatDate(job.date_broke) : ' · ' + U.formatHours(hours) + ' played')))
        : h('div', { style: { marginTop: 8, fontSize: 13.5, color: C.textDim } }, 'No string job yet — tap to add one'));
  }

  var RACQUET_BLANK = {
    brand: '', model: '', nickname: '', head_size_sq_in: null, weight_oz: null,
    string_pattern: '', grip_size: '', recommended_tension_min: null,
    recommended_tension_max: null, purchase_date: null, notes: ''
  };

  function RacquetFields(props) {
    var form = props.form, set = props.set;
    return h('div', null,
      h(TextField, { label: 'Brand', required: true, value: form.brand, onChange: set('brand'), placeholder: 'e.g. Wilson' }),
      h(TextField, { label: 'Model', required: true, value: form.model, onChange: set('model'), placeholder: 'e.g. Blade 98 v9' }),
      h(TextField, { label: 'Nickname', value: form.nickname, onChange: set('nickname'), placeholder: 'optional' }),
      h(NumberField, { label: 'Head size', value: form.head_size_sq_in, onChange: set('head_size_sq_in'), placeholder: '98', suffix: 'sq in' }),
      h(NumberField, { label: 'Weight', value: form.weight_oz, onChange: set('weight_oz'), placeholder: '11.4', suffix: 'oz' }),
      h(TextField, { label: 'String pattern', value: form.string_pattern, onChange: set('string_pattern'), placeholder: '16x19', autoCapitalize: 'none' }),
      h(SelectField, { label: 'Grip size', value: form.grip_size, onChange: set('grip_size'), placeholder: 'Select grip size', options: U.GRIP_SIZES }),
      h('div', { style: { display: 'flex', gap: 12 } },
        h('div', { style: { flex: 1 } }, h(NumberField, { label: 'Rec. tension min', value: form.recommended_tension_min, onChange: set('recommended_tension_min'), placeholder: '50', suffix: 'lbs' })),
        h('div', { style: { flex: 1 } }, h(NumberField, { label: 'Rec. tension max', value: form.recommended_tension_max, onChange: set('recommended_tension_max'), placeholder: '60', suffix: 'lbs' }))),
      h(DateField, { label: 'Purchase date', value: form.purchase_date, onChange: set('purchase_date') }),
      h(TextArea, { label: 'Notes', value: form.notes, onChange: set('notes'), placeholder: 'optional' }));
  }

  function useForm(initial) {
    var st = useState(initial); var form = st[0], setForm = st[1];
    function set(k) { return function (v) { setForm(function (f) { var n = Object.assign({}, f); n[k] = v; return n; }); }; }
    return { form: form, set: set, setForm: setForm };
  }

  // Wraps a save handler so a fast double-tap can't commit twice.
  function useOnce(fn) {
    var done = useRef(false);
    return function () {
      if (done.current) return;
      done.current = true;
      fn.apply(null, arguments);
    };
  }

  function AddRacquetScreen() {
    var nav = useNav();
    var f = useForm(Object.assign({}, RACQUET_BLANK));
    var sv = useState(null); var saved = sv[0], setSaved = sv[1];
    var canSave = f.form.brand.trim() && f.form.model.trim();
    var save = useOnce(function () { SL.platform.haptic('success'); var r = DS.addRacquet(f.form); nav.refresh(); setSaved(r); });
    if (saved) {
      return h(Screen, { title: 'Racquet Added', onBack: function () { nav.popToRoot(); } },
        h('div', { style: { textAlign: 'center', padding: '26px 10px 18px' } },
          h('div', { style: { display: 'flex', justifyContent: 'center', marginBottom: 12 } }, h(Icon, { name: 'check', size: 46, color: C.green })),
          h('div', { style: { fontSize: 18, fontWeight: 700 } }, (saved.nickname || saved.model) + ' added'),
          h('div', { style: { fontSize: 14, color: C.textDim, marginTop: 8, marginBottom: 26 } }, 'Add its current string setup now?')),
        h(Button, { icon: 'plus', onClick: function () { nav.replace(AddStringJobScreen, { racquetId: saved.id, firstTime: true }); } }, 'Add String Job'),
        h('div', { style: { height: 10 } }),
        h(Button, { variant: 'secondary', onClick: function () { nav.popToRoot(); } }, 'Maybe later'));
    }
    return h(Screen, { title: 'Add Racquet', onBack: function () { nav.pop(); } },
      h('div', { style: { fontSize: 13.5, color: C.textDim, marginBottom: 14, lineHeight: 1.45 } }, 'Enter your racquet’s details. Only brand and model are required.'),
      h(RacquetFields, { form: f.form, set: f.set }),
      h('div', { style: { height: 6 } }),
      h(Button, { disabled: !canSave, onClick: save }, 'Save Racquet'));
  }

  function EditRacquetScreen(props) {
    var nav = useNav();
    var r = DS.getRacquet(props.id);
    var f = useForm(Object.assign({}, RACQUET_BLANK, r));
    var canSave = f.form.brand.trim() && f.form.model.trim();
    var save = useOnce(function () { SL.platform.haptic('success'); DS.updateRacquet(r.id, f.form); nav.refresh(); nav.pop(); });
    return h(Screen, { title: 'Edit Racquet', onBack: function () { nav.pop(); } },
      h(RacquetFields, { form: f.form, set: f.set }),
      h('div', { style: { height: 6 } }),
      h(Button, { disabled: !canSave, onClick: save }, 'Save Changes'));
  }

  function RacquetDetail(props) {
    var nav = useNav();
    var sa = useState(false); var showAllSessions = sa[0], setShowAllSessions = sa[1];
    var r = DS.getRacquet(props.id);
    if (!r) return h(Screen, { title: 'Racquet', onBack: function () { nav.pop(); } }, h(EmptyState, { title: 'Racquet not found' }));
    var settings = DS.getSettings();
    var job = DS.currentStringJob(r.id);
    var jobs = DS.listStringJobs({ racquetId: r.id });
    var sessions = DS.listSessions({ racquetId: r.id });
    var hours = job ? DS.hoursPlayedForJob(job.id) : 0;
    var days = job ? U.daysSince(job.date_strung) : null;
    var status = job ? (job.date_broke ? 'red' : U.stringStatus(days, hours, settings)) : null;
    var recRange = (r.recommended_tension_min && r.recommended_tension_max)
      ? (U.displayTension(r.recommended_tension_min, settings.units) + ' – ' + U.displayTension(r.recommended_tension_max, settings.units)) : null;
    function confirmRetire() {
      if (window.confirm('Retire this racquet? It will be hidden from the main list but kept in Settings.')) { DS.retireRacquet(r.id); nav.refresh(); nav.pop(); }
    }
    return h(Screen, {
      title: r.nickname || r.model,
      onBack: function () { nav.pop(); },
      right: h('button', { onClick: function () { nav.push(EditRacquetScreen, { id: r.id }); }, style: { color: C.gold, fontSize: 15.5 } }, 'Edit')
    },
      r.is_active === false ? h('div', { style: { marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 } },
        h(Badge, { tone: 'dim' }, 'Retired'),
        h('button', { onClick: function () { DS.reactivateRacquet(r.id); nav.refresh(); }, style: { color: C.gold, fontSize: 14 } }, 'Reactivate')) : null,
      job ? h(Card, null,
        h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 } },
          h(SectionLabel, { style: { margin: 0 } }, 'Current Setup'), status ? h(StatusDot, { tone: status }) : null),
        h('div', { style: { display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' } },
          h('span', { style: { fontSize: 15.5, color: C.text } }, job.mains_string_brand + ' ' + job.mains_string_model + (job.mains_gauge ? ' ' + job.mains_gauge : '')),
          h('span', { style: { fontSize: 20, fontWeight: 800, color: C.gold } }, U.displayTension(job.mains_tension_lbs, settings.units))),
        (!job.crosses_same_as_mains && job.crosses_string_brand) ? h('div', { style: { fontSize: 13.5, color: C.textDim, marginTop: 3 } },
          'Crosses: ' + job.crosses_string_brand + ' ' + job.crosses_string_model + ' · ' + U.displayTension(job.crosses_tension_lbs, settings.units)) : null,
        h('div', { style: { fontSize: 12.5, color: C.textDim, marginTop: 6 } },
          'Strung ' + U.formatDate(job.date_strung) + (job.date_broke ? ' · Broke ' + U.formatDate(job.date_broke) : ' · ' + U.formatHours(hours) + ' played'))) : null,
      h(Button, { icon: 'plus', onClick: function () { nav.push(AddStringJobScreen, { racquetId: r.id }); } }, 'Add String Job'),
      h('div', { style: { height: 10 } }),
      h(Button, { variant: 'secondary', icon: 'share', onClick: function () { nav.push(ShareScreen, { id: r.id }); } }, 'Share with Stringer'),
      h(SectionLabel, null, 'Specs'),
      h(Card, null,
        h(SpecRow, { label: 'Brand', value: r.brand }),
        h(SpecRow, { label: 'Model', value: r.model }),
        h(SpecRow, { label: 'Head size', value: r.head_size_sq_in ? r.head_size_sq_in + ' sq in' : null }),
        h(SpecRow, { label: 'Weight', value: r.weight_oz ? r.weight_oz + ' oz' : null }),
        h(SpecRow, { label: 'String pattern', value: r.string_pattern }),
        h(SpecRow, { label: 'Grip size', value: r.grip_size }),
        h(SpecRow, { label: 'Rec. tension', value: recRange }),
        h(SpecRow, { label: 'Purchased', value: r.purchase_date ? U.formatDate(r.purchase_date) : null }),
        r.notes ? h('div', { style: { fontSize: 13.5, color: C.text, marginTop: 10, lineHeight: 1.45 } }, r.notes) : null),
      h(SectionLabel, null, 'String History (' + jobs.length + ')'),
      jobs.length ? h('div', null, jobs.map(function (j) { return h(StringJobRow, { key: j.id, job: j, settings: settings, onClick: function () { nav.push(StringJobDetail, { id: j.id }); } }); }))
        : h('div', { style: { fontSize: 13.5, color: C.textDim, padding: '2px 2px 12px' } }, 'No string jobs yet.'),
      h(SectionLabel, null, 'Sessions (' + sessions.length + ')'),
      sessions.length ? h('div', null,
        (showAllSessions ? sessions : sessions.slice(0, 25)).map(function (s) { return h(SessionRow, { key: s.id, session: s, onClick: function () { nav.push(SessionDetail, { id: s.id }); } }); }),
        sessions.length > 25 && !showAllSessions
          ? h(Button, { variant: 'ghost', onClick: function () { setShowAllSessions(true); } }, 'Show all ' + sessions.length + ' sessions') : null)
        : h('div', { style: { fontSize: 13.5, color: C.textDim, padding: '2px 2px 12px' } }, 'No sessions logged yet.'),
      r.is_active !== false ? h('div', { style: { marginTop: 20 } }, h(Button, { variant: 'danger', onClick: confirmRetire }, 'Retire Racquet')) : null);
  }

  function StringJobRow(props) {
    var j = props.job, settings = props.settings || DS.getSettings();
    var hours = DS.hoursPlayedForJob(j.id), feel = DS.avgFeelForJob(j.id);
    return h('div', { onClick: props.onClick, style: { padding: '11px 12px', background: C.card, border: '1px solid ' + C.border, borderRadius: 12, marginBottom: 9, cursor: 'pointer' } },
      props.racquetName ? h('div', { style: { fontSize: 12, color: C.gold, fontWeight: 600, marginBottom: 3 } }, props.racquetName) : null,
      h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 } },
        h('span', { style: { fontSize: 14.5, color: C.text, fontWeight: 600 } }, j.mains_string_brand + ' ' + j.mains_string_model),
        h('span', { style: { fontSize: 15, fontWeight: 800, color: C.gold, whiteSpace: 'nowrap' } }, U.displayTension(j.mains_tension_lbs, settings.units))),
      h('div', { style: { display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 12.5, color: C.textDim } },
        h('span', null, U.formatDate(j.date_strung) + (j.date_broke ? ' → ' + U.formatDate(j.date_broke) : ' · Active')),
        h('span', null, U.formatHours(hours) + (feel ? ' · ' + (Math.round(feel * 10) / 10) + '★' : ''))));
  }

  function SessionRow(props) {
    var s = props.session;
    return h('div', { onClick: props.onClick, style: { padding: '11px 12px', background: C.card, border: '1px solid ' + C.border, borderRadius: 12, marginBottom: 9, cursor: 'pointer' } },
      props.racquetName ? h('div', { style: { fontSize: 12, color: C.gold, fontWeight: 600, marginBottom: 3 } }, props.racquetName) : null,
      h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 } },
        h('span', { style: { fontSize: 14.5, color: C.text, fontWeight: 600 } }, U.labelFor(U.SESSION_TYPES, s.session_type) + ' · ' + U.labelFor(U.SURFACES, s.surface)),
        h('span', { style: { fontSize: 12.5, color: C.textDim } }, U.formatDate(s.date))),
      h('div', { style: { marginTop: 4, fontSize: 12.5, color: C.textDim } },
        (s.duration_minutes ? s.duration_minutes + ' min' : '') +
        (s.string_feel_rating ? ((s.duration_minutes ? ' · ' : '') + s.string_feel_rating + '★ ' + U.FEEL_LABELS[s.string_feel_rating]) : '') +
        (s.notes ? ((s.duration_minutes || s.string_feel_rating ? ' · ' : '') + s.notes) : '')));
  }

  // ---- screens built in later steps (stubs keep navigation working) ----
  function AddStringJobScreen(props) {
    var nav = useNav();
    var settings = DS.getSettings();
    var racquets = DS.listRacquets({ activeOnly: true });
    var stringers = DS.listStringers();
    var editing = props.editId ? DS.getStringJob(props.editId) : null;
    var pre = props.racquetId || (racquets[0] && racquets[0].id) || '';
    var f = useForm(editing ? {
      racquet_id: editing.racquet_id, date_strung: editing.date_strung, stringer_name: editing.stringer_name || '',
      mains: { brand: editing.mains_string_brand || '', model: editing.mains_string_model || '', gauge: editing.mains_gauge || '', type: editing.mains_type || '' },
      mains_tension_lbs: editing.mains_tension_lbs,
      crosses_same_as_mains: editing.crosses_same_as_mains !== false,
      crosses: { brand: editing.crosses_string_brand || '', model: editing.crosses_string_model || '', gauge: editing.crosses_gauge || '', type: editing.crosses_type || '' },
      crosses_tension_lbs: editing.crosses_tension_lbs,
      pre_stretch_applied: !!editing.pre_stretch_applied, stringing_machine: editing.stringing_machine || '',
      cost: editing.cost, why_restrung: editing.why_restrung || 'new_setup', notes: editing.notes || '',
      date_broke: editing.date_broke || null
    } : {
      racquet_id: pre, date_strung: U.todayISODate(), stringer_name: '',
      mains: Object.assign({ brand: '', model: '', gauge: '', type: '' }, props.prefillMains || {}), mains_tension_lbs: null,
      crosses_same_as_mains: true, crosses: { brand: '', model: '', gauge: '', type: '' }, crosses_tension_lbs: null,
      pre_stretch_applied: false, stringing_machine: '', cost: null,
      why_restrung: props.why || (props.firstTime ? 'first_time' : 'new_setup'), notes: '', date_broke: null
    });
    var form = f.form, set = f.set;
    var racquet = DS.getRacquet(form.racquet_id);
    var recHint = (racquet && racquet.recommended_tension_min && racquet.recommended_tension_max)
      ? ('Racquet rec: ' + U.displayTension(racquet.recommended_tension_min, settings.units) + ' – ' + U.displayTension(racquet.recommended_tension_max, settings.units)) : null;
    var canSave = form.racquet_id && form.mains.brand.trim() && form.mains.model.trim() && form.mains_tension_lbs != null;
    var save = useOnce(function () {
      SL.platform.haptic('success');
      var payload = {
        racquet_id: form.racquet_id, date_strung: form.date_strung, stringer_name: form.stringer_name,
        mains_string_brand: form.mains.brand, mains_string_model: form.mains.model, mains_gauge: form.mains.gauge, mains_type: form.mains.type,
        mains_tension_lbs: form.mains_tension_lbs, crosses_same_as_mains: form.crosses_same_as_mains,
        crosses_string_brand: form.crosses_same_as_mains ? '' : form.crosses.brand,
        crosses_string_model: form.crosses_same_as_mains ? '' : form.crosses.model,
        crosses_gauge: form.crosses_same_as_mains ? '' : form.crosses.gauge,
        crosses_type: form.crosses_same_as_mains ? '' : form.crosses.type,
        crosses_tension_lbs: form.crosses_same_as_mains ? null : form.crosses_tension_lbs,
        pre_stretch_applied: form.pre_stretch_applied, stringing_machine: form.stringing_machine,
        cost: form.cost, why_restrung: form.why_restrung, notes: form.notes
      };
      if (editing) {
        payload.date_broke = form.date_broke || null;
        DS.updateStringJob(editing.id, payload);
        DS.rememberString({ brand: payload.mains_string_brand, model: payload.mains_string_model, gauge_label: payload.mains_gauge, type: payload.mains_type });
        if (!payload.crosses_same_as_mains && payload.crosses_string_brand) {
          DS.rememberString({ brand: payload.crosses_string_brand, model: payload.crosses_string_model, gauge_label: payload.crosses_gauge, type: payload.crosses_type });
        }
        nav.refresh(); nav.pop();
      } else {
        DS.addStringJob(payload);
        nav.refresh(); nav.popToRoot();
      }
    });
    return h(Screen, { title: editing ? 'Edit String Job' : 'Add String Job', onBack: function () { nav.pop(); } },
      (!editing && (racquets.length > 1 || !props.racquetId))
        ? h(SelectField, { label: 'Racquet', required: true, value: form.racquet_id, onChange: set('racquet_id'), placeholder: 'Select racquet',
            options: racquets.map(function (r) { return { value: r.id, label: r.nickname || (r.brand + ' ' + r.model) }; }) })
        : h('div', { style: { fontSize: 14, color: C.textDim, marginBottom: 12 } }, racquet ? (racquet.nickname || (racquet.brand + ' ' + racquet.model)) : ''),
      h(DateField, { label: 'Date strung', required: true, value: form.date_strung, onChange: set('date_strung') }),
      stringers.length
        ? h(SelectField, { label: 'Stringer', value: form.stringer_name, onChange: set('stringer_name'), placeholder: 'Optional', options: stringers.map(function (s) { return { value: s.name, label: s.name }; }) })
        : h(TextField, { label: 'Stringer', value: form.stringer_name, onChange: set('stringer_name'), placeholder: 'Optional' }),
      h(SectionLabel, null, 'Mains'),
      h(StringPicker, { label: 'Mains string', required: true, value: form.mains, onChange: set('mains') }),
      h(TensionField, { label: 'Mains tension', required: true, units: settings.units, value: form.mains_tension_lbs, onChange: set('mains_tension_lbs'), hint: recHint }),
      h('div', { style: { margin: '2px 0' } }, h(Toggle, { label: 'Crosses same as mains', value: form.crosses_same_as_mains, onChange: set('crosses_same_as_mains') })),
      !form.crosses_same_as_mains ? h('div', null,
        h(SectionLabel, null, 'Crosses'),
        h(StringPicker, { label: 'Crosses string', value: form.crosses, onChange: set('crosses') }),
        h(TensionField, { label: 'Crosses tension', units: settings.units, value: form.crosses_tension_lbs, onChange: set('crosses_tension_lbs') })) : null,
      h(SectionLabel, null, 'Details'),
      h('div', { style: { marginBottom: 4 } }, h(Toggle, { label: 'Pre-stretch applied', value: form.pre_stretch_applied, onChange: set('pre_stretch_applied') })),
      h(SelectField, { label: 'Why restrung', value: form.why_restrung, onChange: set('why_restrung'), options: U.WHY_RESTRUNG }),
      h(TextField, { label: 'Stringing machine', value: form.stringing_machine, onChange: set('stringing_machine'), placeholder: 'Optional' }),
      h(NumberField, { label: 'Cost', value: form.cost, onChange: set('cost'), placeholder: 'Optional', suffix: '$' }),
      h(TextArea, { label: 'Notes', value: form.notes, onChange: set('notes'), placeholder: 'Optional' }),
      editing ? h('div', null,
        h(DateField, { label: 'Date broke', value: form.date_broke, onChange: set('date_broke'), hint: 'Leave empty if these strings have not broken' }),
        form.date_broke ? h('button', { onClick: function () { set('date_broke')(null); }, style: { color: C.gold, fontSize: 14, marginTop: -8, marginBottom: 12, display: 'block' } }, 'Clear (strings not broken)') : null) : null,
      h('div', { style: { height: 6 } }),
      h(Button, { disabled: !canSave, onClick: save }, editing ? 'Save Changes' : 'Save String Job'));
  }

  function StringJobDetail(props) {
    var nav = useNav();
    var j = DS.getStringJob(props.id);
    if (!j) return h(Screen, { title: 'String Job', onBack: function () { nav.pop(); } }, h(EmptyState, { title: 'String job not found' }));
    var settings = DS.getSettings();
    var racquet = DS.getRacquet(j.racquet_id);
    var hours = DS.hoursPlayedForJob(j.id), feel = DS.avgFeelForJob(j.id);
    var sessions = DS.listSessions({ stringJobId: j.id });
    function del() { if (window.confirm('Delete this string job? Linked sessions are kept but unlinked.')) { DS.deleteStringJob(j.id); nav.refresh(); nav.pop(); } }
    function broke() { SL.platform.haptic('warning'); DS.markBroke(j.id); nav.refresh(); }
    return h(Screen, { title: 'String Job', onBack: function () { nav.pop(); },
      right: h('button', { onClick: function () { nav.push(AddStringJobScreen, { editId: j.id }); }, style: { color: C.gold, fontSize: 15.5 } }, 'Edit') },
      racquet ? h('div', { style: { fontSize: 13.5, color: C.textDim, marginBottom: 10 } }, racquet.nickname || (racquet.brand + ' ' + racquet.model)) : null,
      h(Card, null,
        h('div', { style: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 } },
          h('span', { style: { fontSize: 16, color: C.text, fontWeight: 700 } }, j.mains_string_brand + ' ' + j.mains_string_model),
          h('span', { style: { fontSize: 20, fontWeight: 800, color: C.gold } }, U.displayTension(j.mains_tension_lbs, settings.units))),
        (j.mains_gauge || j.mains_type) ? h('div', { style: { fontSize: 13, color: C.textDim, marginTop: 3 } }, [j.mains_gauge, j.mains_type].filter(Boolean).join(' · ')) : null,
        (!j.crosses_same_as_mains && j.crosses_string_brand)
          ? h('div', { style: { marginTop: 9, paddingTop: 9, borderTop: '1px solid ' + C.border, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 } },
              h('span', { style: { fontSize: 14, color: C.text } }, 'Crosses: ' + j.crosses_string_brand + ' ' + j.crosses_string_model),
              h('span', { style: { fontSize: 16, fontWeight: 700, color: C.gold } }, U.displayTension(j.crosses_tension_lbs, settings.units)))
          : h('div', { style: { fontSize: 13, color: C.textDim, marginTop: 6 } }, 'Crosses same as mains')),
      h(Card, null,
        h(SpecRow, { label: 'Date strung', value: U.formatDate(j.date_strung) }),
        h(SpecRow, { label: 'Date broke', value: j.date_broke ? U.formatDate(j.date_broke) : null }),
        h(SpecRow, { label: 'Hours played', value: U.formatHours(hours) }),
        h(SpecRow, { label: 'Avg feel', value: feel ? (Math.round(feel * 10) / 10 + ' / 5 ★') : null }),
        h(SpecRow, { label: 'Why restrung', value: U.labelFor(U.WHY_RESTRUNG, j.why_restrung) }),
        h(SpecRow, { label: 'Stringer', value: j.stringer_name }),
        h(SpecRow, { label: 'Machine', value: j.stringing_machine }),
        h(SpecRow, { label: 'Pre-stretch', value: j.pre_stretch_applied ? 'Yes' : null }),
        h(SpecRow, { label: 'Cost', value: (j.cost != null && j.cost !== '') ? U.formatMoney(j.cost) : null }),
        j.notes ? h('div', { style: { fontSize: 13.5, color: C.text, marginTop: 10, lineHeight: 1.45 } }, j.notes) : null),
      !j.date_broke ? h('div', null, h(Button, { variant: 'secondary', onClick: broke }, 'Mark as Broke Today'), h('div', { style: { height: 10 } })) : null,
      h(SectionLabel, null, 'Sessions on this job (' + sessions.length + ')'),
      sessions.length ? h('div', null, sessions.map(function (s) { return h(SessionRow, { key: s.id, session: s, onClick: function () { nav.push(SessionDetail, { id: s.id }); } }); }))
        : h('div', { style: { fontSize: 13.5, color: C.textDim, padding: '2px 2px 10px' } }, 'No sessions logged on this job yet.'),
      h('div', { style: { marginTop: 16 } }, h(Button, { variant: 'danger', onClick: del }, 'Delete String Job')));
  }
  function SessionDetail(props) {
    var nav = useNav();
    var s = DS.getSession(props.id);
    if (!s) return h(Screen, { title: 'Session', onBack: function () { nav.pop(); } }, h(EmptyState, { title: 'Session not found' }));
    var settings = DS.getSettings();
    var racquet = DS.getRacquet(s.racquet_id);
    var job = s.string_job_id ? DS.getStringJob(s.string_job_id) : null;
    function del() { if (window.confirm('Delete this session?')) { DS.deleteSession(s.id); nav.refresh(); nav.pop(); } }
    return h(Screen, { title: 'Session', onBack: function () { nav.pop(); },
      right: h('button', { onClick: function () { nav.push(EditSessionScreen, { id: s.id }); }, style: { color: C.gold, fontSize: 15.5 } }, 'Edit') },
      racquet ? h('div', { style: { fontSize: 13.5, color: C.textDim, marginBottom: 10 } }, racquet.nickname || (racquet.brand + ' ' + racquet.model)) : null,
      h(Card, null,
        h(SpecRow, { label: 'Date', value: U.formatDate(s.date) }),
        h(SpecRow, { label: 'Type', value: U.labelFor(U.SESSION_TYPES, s.session_type) }),
        h(SpecRow, { label: 'Surface', value: U.labelFor(U.SURFACES, s.surface) }),
        h(SpecRow, { label: 'Duration', value: s.duration_minutes ? s.duration_minutes + ' min' : null }),
        h(SpecRow, { label: 'String feel', value: s.string_feel_rating ? (s.string_feel_rating + '★ ' + U.FEEL_LABELS[s.string_feel_rating]) : null }),
        h(SpecRow, { label: 'Conditions', value: s.conditions }),
        s.notes ? h('div', { style: { fontSize: 13.5, color: C.text, marginTop: 10, lineHeight: 1.45 } }, s.notes) : null),
      job ? h(Card, null,
        h(SectionLabel, { style: { margin: '0 0 6px' } }, 'Strings'),
        h('div', { style: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 } },
          h('span', { style: { fontSize: 14.5, color: C.text } }, job.mains_string_brand + ' ' + job.mains_string_model),
          h('span', { style: { fontSize: 16, fontWeight: 800, color: C.gold } }, U.displayTension(job.mains_tension_lbs, settings.units)))) : null,
      h('div', { style: { marginTop: 16 } }, h(Button, { variant: 'danger', onClick: del }, 'Delete Session')));
  }
  function ShareScreen(props) {
    var nav = useNav();
    var r = DS.getRacquet(props.id);
    var P = SL.platform;
    var ts = useState(''); var toast = ts[0], setToast = ts[1];
    var imgUrl = useMemo(function () { try { return P.drawCard(props.id).toDataURL('image/png'); } catch (e) { return ''; } }, [props.id]);
    if (!r) return h(Screen, { title: 'Share', onBack: function () { nav.pop(); } }, h(EmptyState, { title: 'Racquet not found' }));
    function flash(msg) { setToast(msg); setTimeout(function () { setToast(''); }, 2200); }
    function go(mode, okMsg) { Promise.resolve(P.share(props.id, mode)).then(function (res) { flash(res && res.ok ? okMsg : 'Could not complete'); }); }
    return h(Screen, { title: 'Share with Stringer', onBack: function () { nav.pop(); } },
      h('div', { style: { fontSize: 13.5, color: C.textDim, marginBottom: 14, lineHeight: 1.45 } }, 'Send your racquet profile to a stringer. No account or server, just a shareable summary.'),
      imgUrl ? h('div', { style: { borderRadius: 14, overflow: 'hidden', border: '1px solid ' + C.border, marginBottom: 18 } }, h('img', { src: imgUrl, style: { width: '100%', display: 'block' } })) : null,
      h(Button, { onClick: function () { go('text', 'Copied to clipboard'); } }, 'Copy as Text'),
      h('div', { style: { height: 10 } }),
      h(Button, { variant: 'secondary', icon: 'share', onClick: function () { go('image', 'Image ready to share'); } }, 'Share as Image'),
      h('div', { style: { height: 10 } }),
      h(Button, { variant: 'secondary', onClick: function () { go('pdf', 'PDF ready to share'); } }, 'Export as PDF'),
      toast ? h('div', { style: { position: 'fixed', left: 0, right: 0, bottom: 36, display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 50 } },
        h('div', { style: { background: C.card2, border: '1px solid ' + C.border, color: C.text, padding: '10px 18px', borderRadius: 24, fontSize: 14, boxShadow: '0 6px 20px rgba(0,0,0,.5)' } }, toast)) : null);
  }

  function SessionForm(props) {
    var racquets = props.racquets, settings = DS.getSettings();
    var editing = props.session || null;
    var f = useForm(editing ? {
      racquet_id: editing.racquet_id, date: editing.date, duration_minutes: editing.duration_minutes,
      surface: editing.surface || 'hard', session_type: editing.session_type || 'practice',
      string_feel_rating: editing.string_feel_rating, conditions: editing.conditions || '', notes: editing.notes || ''
    } : {
      racquet_id: props.defaultRacquetId || racquets[0].id, date: U.todayISODate(),
      duration_minutes: null, surface: 'hard', session_type: 'practice',
      string_feel_rating: null, conditions: '', notes: ''
    });
    var form = f.form, set = f.set;
    // when editing, keep the session tied to its original string job unless the racquet changes
    var job = (editing && form.racquet_id === editing.racquet_id)
      ? (editing.string_job_id ? DS.getStringJob(editing.string_job_id) : null)
      : DS.currentStringJob(form.racquet_id);
    var save = useOnce(function () {
      SL.platform.haptic('success');
      var payload = {
        racquet_id: form.racquet_id, string_job_id: job ? job.id : null, date: form.date,
        duration_minutes: form.duration_minutes, surface: form.surface, session_type: form.session_type,
        string_feel_rating: form.string_feel_rating, conditions: form.conditions, notes: form.notes
      };
      var s = editing ? DS.updateSession(editing.id, payload) : DS.addSession(payload);
      props.onSaved(s);
    });
    return h('div', null,
      h(SelectField, { label: 'Racquet', required: true, value: form.racquet_id, onChange: set('racquet_id'),
        options: racquets.map(function (r) { return { value: r.id, label: r.nickname || (r.brand + ' ' + r.model) }; }) }),
      h(Field, { label: editing ? 'Strings for this session' : 'Current strings' },
        h('div', { style: { background: C.card2, border: '1px solid ' + C.border, borderRadius: 10, padding: '11px 12px', fontSize: 14.5, color: job ? C.text : C.textDim } },
          job ? h('span', null, job.mains_string_brand + ' ' + job.mains_string_model + ' · ',
                h('span', { style: { color: C.gold, fontWeight: 700 } }, U.displayTension(job.mains_tension_lbs, settings.units)),
                job.date_broke ? h('span', { style: { color: C.red } }, ' · broke ' + U.formatDateShort(job.date_broke)) : null)
              : 'No active string job — log one from the racquet first')),
      h(DateField, { label: 'Date', required: true, value: form.date, onChange: set('date') }),
      h(NumberField, { label: 'Duration', value: form.duration_minutes, onChange: set('duration_minutes'), placeholder: '60', suffix: 'min' }),
      h(Segmented, { label: 'Surface', value: form.surface, onChange: set('surface'), options: U.SURFACES }),
      h(Segmented, { label: 'Session type', value: form.session_type, onChange: set('session_type'), options: U.SESSION_TYPES }),
      h(Field, { label: 'String feel' }, h(StarRating, { value: form.string_feel_rating, onChange: set('string_feel_rating'), showLabel: true })),
      h(TextField, { label: 'Conditions', value: form.conditions, onChange: set('conditions'), placeholder: 'e.g. windy, humid', autoCapitalize: 'sentences' }),
      h(TextArea, { label: 'Notes', value: form.notes, onChange: set('notes'), placeholder: 'Optional' }),
      h('div', { style: { height: 6 } }),
      h(Button, { onClick: save }, editing ? 'Save Changes' : 'Save Session'));
  }

  function EditSessionScreen(props) {
    var nav = useNav();
    var s = DS.getSession(props.id);
    if (!s) return h(Screen, { title: 'Edit Session', onBack: function () { nav.pop(); } }, h(EmptyState, { title: 'Session not found' }));
    return h(Screen, { title: 'Edit Session', onBack: function () { nav.pop(); } },
      h(SessionForm, { racquets: DS.listRacquets({}), session: s, onSaved: function () { nav.refresh(); nav.pop(); } }));
  }

  function LogTab() {
    var nav = useNav();
    var racquets = DS.listRacquets({ activeOnly: true });
    var stp = useState('form'); var step = stp[0], setStep = stp[1];
    var sv = useState(null); var last = sv[0], setLast = sv[1];
    var fk = useState(0); var formKey = fk[0], setFormKey = fk[1];
    if (!racquets.length) {
      return h(Screen, { title: 'Log Session' },
        h(EmptyState, { title: 'No racquets yet', subtitle: 'Add a racquet first, then log sessions against its current strings.',
          action: h('div', { style: { maxWidth: 260, margin: '0 auto' } }, h(Button, { icon: 'plus', onClick: function () { nav.goTab('racquets'); } }, 'Go to Racquets')) }));
    }
    if (step === 'saved') {
      return h(Screen, { title: 'Session Logged' },
        h('div', { style: { textAlign: 'center', padding: '26px 10px 22px' } },
          h('div', { style: { display: 'flex', justifyContent: 'center', marginBottom: 12 } }, h(Icon, { name: 'check', size: 46, color: C.green })),
          h('div', { style: { fontSize: 18, fontWeight: 700 } }, 'Session logged'),
          h('div', { style: { fontSize: 14, color: C.textDim, marginTop: 8 } }, 'Nice. What next?')),
        h(Button, { onClick: function () { setStep('form'); setFormKey(formKey + 1); } }, 'Log Another Session'),
        h('div', { style: { height: 10 } }),
        h(Button, { variant: 'secondary', onClick: function () {
          var rid = last ? last.racquet_id : null;
          if (last && last.string_job_id) { SL.platform.haptic('warning'); DS.markBroke(last.string_job_id); nav.refresh(); }
          setStep('form'); setFormKey(formKey + 1);
          nav.push(AddStringJobScreen, { racquetId: rid, why: 'broke' });
        } }, 'Log String Break'),
        h('div', { style: { height: 10 } }),
        h(Button, { variant: 'ghost', onClick: function () { nav.goTab('history'); } }, 'View History'));
    }
    return h(Screen, { title: 'Log Session' },
      h(SessionForm, { key: formKey, racquets: racquets, onSaved: function (s) { setLast(s); setStep('saved'); nav.refresh(); } }));
  }
  function SubToggle(props) {
    return h('div', { style: { display: 'flex', background: C.card, border: '1px solid ' + C.border, borderRadius: 10, padding: 3, gap: 3, marginBottom: 14 } },
      props.options.map(function (o) {
        var sel = props.value === o.value;
        return h('button', { key: o.value, onClick: function () { SL.platform.haptic('select'); props.onChange(o.value); },
          style: { flex: 1, padding: '9px 0', borderRadius: 8, fontSize: 13.5, fontWeight: 700, background: sel ? C.gold : 'transparent', color: sel ? '#1a1408' : C.textDim } }, o.label);
      }));
  }

  function Stat(props) {
    return h('div', { style: { minWidth: 80 } },
      h('div', { style: { fontSize: 22, fontWeight: 800, color: C.gold } }, props.value),
      h('div', { style: { fontSize: 12, color: C.textDim, marginTop: 2 } }, props.label));
  }

  function AnalyticsSection(props) {
    var settings = DS.getSettings();
    var life = DS.stringLifeByType(), top = DS.topRatedSetups(5), t = DS.totals(), most = DS.mostUsedString();
    var nameOf = function (id) { var r = DS.getRacquet(id); return r ? (r.nickname || (r.brand + ' ' + r.model)) : 'Racquet'; };
    if (!t.totalSessions && !t.jobCount) {
      return (props && props.showEmpty)
        ? h(EmptyState, { title: 'No stats yet', subtitle: 'Log string jobs and sessions to see totals, string life by type, and your top rated setups.' })
        : null;
    }
    return h('div', null,
      h(SectionLabel, null, 'Analytics'),
      h(Card, null,
        h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 16 } },
          h(Stat, { label: 'Sessions', value: t.totalSessions }),
          h(Stat, { label: 'Hours played', value: U.formatHours(t.totalHours) }),
          t.totalCost != null ? h(Stat, { label: 'Spent stringing', value: U.formatMoney(t.totalCost) }) : null,
          h(Stat, { label: 'String jobs', value: t.jobCount })),
        most ? h('div', { style: { marginTop: 12, paddingTop: 12, borderTop: '1px solid ' + C.border, fontSize: 13.5, color: C.textDim } },
          'Most used string: ', h('span', { style: { color: C.text, fontWeight: 600 } }, most.name + ' (' + most.count + ')')) : null),
      life.length ? h('div', null, h(SectionLabel, null, 'String Life by Type'),
        h(Card, null, life.map(function (x, i) {
          return h('div', { key: x.type, style: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '7px 0', borderBottom: i < life.length - 1 ? '1px solid ' + C.border : 'none' } },
            h('span', { style: { fontSize: 14, color: C.text } }, x.type),
            h('span', { style: { fontSize: 12.5, color: C.textDim } }, (x.avgDays != null ? x.avgDays + 'd' : '—') + ' · ' + (x.avgHours != null ? U.formatHours(x.avgHours) : '—') + ' avg life'));
        }))) : null,
      top.length ? h('div', null, h(SectionLabel, null, 'Top Rated Setups'),
        h(Card, null, top.map(function (x, i) {
          var j = x.job;
          return h('div', { key: j.id, style: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '7px 0', borderBottom: i < top.length - 1 ? '1px solid ' + C.border : 'none', gap: 10 } },
            h('span', { style: { fontSize: 13, color: C.text, minWidth: 0 } }, nameOf(j.racquet_id) + ': ' + j.mains_string_brand + ' ' + j.mains_string_model + ' ' + U.displayTension(j.mains_tension_lbs, settings.units)),
            h('span', { style: { fontSize: 13, color: C.gold, fontWeight: 700, whiteSpace: 'nowrap' } }, (Math.round(x.avg * 10) / 10) + '★'));
        }))) : null);
  }

  function HistoryTab() {
    var nav = useNav();
    var settings = DS.getSettings();
    var racquets = DS.listRacquets({});
    var nameOf = function (id) { var r = racquets.find(function (x) { return x.id === id; }); return r ? (r.nickname || (r.brand + ' ' + r.model)) : 'Unknown'; };
    var vw = useState('strings'); var view = vw[0], setView = vw[1];
    var rf = useState(''); var racquetFilter = rf[0], setRacquetFilter = rf[1];
    var sf = useState(''); var surfaceFilter = sf[0], setSurfaceFilter = sf[1];
    var racquetOpts = [{ value: '', label: 'All racquets' }].concat(racquets.map(function (r) { return { value: r.id, label: r.nickname || (r.brand + ' ' + r.model) }; }));
    var surfaceOpts = [{ value: '', label: 'All surfaces' }].concat(U.SURFACES);
    var jobs = DS.listStringJobs({}); if (racquetFilter) jobs = jobs.filter(function (j) { return j.racquet_id === racquetFilter; });
    var sessions = DS.listSessions({}); if (racquetFilter) sessions = sessions.filter(function (s) { return s.racquet_id === racquetFilter; }); if (surfaceFilter) sessions = sessions.filter(function (s) { return s.surface === surfaceFilter; });
    return h('div', { style: { display: 'flex', flexDirection: 'column', height: '100%' } },
      h(Header, { title: 'History' }),
      h('div', { className: 'scroll', style: { flex: 1, padding: '14px 14px 28px' } },
        h(SubToggle, { value: view, onChange: setView, options: [{ value: 'strings', label: 'Strings' }, { value: 'sessions', label: 'Sessions' }, { value: 'stats', label: 'Stats' }] }),
        view === 'strings'
          ? h('div', null,
              h(SelectField, { value: racquetFilter, onChange: setRacquetFilter, options: racquetOpts }),
              jobs.length ? h('div', null, jobs.map(function (j) { return h(StringJobRow, { key: j.id, job: j, settings: settings, racquetName: nameOf(j.racquet_id), onClick: function () { nav.push(StringJobDetail, { id: j.id }); } }); }))
                : h('div', { style: { fontSize: 13.5, color: C.textDim, padding: '8px 2px 14px' } }, 'No string jobs yet.'))
          : view === 'sessions'
          ? h('div', null,
              h('div', { style: { display: 'flex', gap: 10 } },
                h('div', { style: { flex: 1 } }, h(SelectField, { value: racquetFilter, onChange: setRacquetFilter, options: racquetOpts })),
                h('div', { style: { flex: 1 } }, h(SelectField, { value: surfaceFilter, onChange: setSurfaceFilter, options: surfaceOpts }))),
              sessions.length ? h('div', null, sessions.map(function (s) { return h(SessionRow, { key: s.id, session: s, racquetName: nameOf(s.racquet_id), onClick: function () { nav.push(SessionDetail, { id: s.id }); } }); }))
                : h('div', { style: { fontSize: 13.5, color: C.textDim, padding: '8px 2px 14px' } }, 'No sessions yet.'))
          : h(AnalyticsSection, { showEmpty: true })));
  }
  function SettingRow(props) {
    return h('div', { onClick: props.onClick, style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: props.last ? 'none' : '1px solid ' + C.border, cursor: props.onClick ? 'pointer' : 'default' } },
      h('span', { style: { fontSize: 15.5, color: C.text } }, props.label),
      h('span', { style: { display: 'flex', alignItems: 'center', gap: 8, color: C.textDim, fontSize: 14 } },
        props.value != null ? h('span', null, props.value) : null,
        props.onClick ? h(Icon, { name: props.icon || 'chevron', size: 18, color: C.textDim }) : null));
  }

  var REMINDER_KEYS = ['reminders_enabled', 'remind_by_days', 'remind_after_days', 'remind_by_hours', 'remind_after_hours'];

  function SettingsTab() {
    var nav = useNav();
    var stt = useState(DS.getSettings()); var s = stt[0], setS = stt[1];
    var vs = useState('1.0.0'); var version = vs[0], setVersion = vs[1];
    useEffect(function () {
      Promise.resolve(SL.platform.getAppVersion()).then(function (v) { if (v) setVersion(v); });
    }, []);
    function upd(patch) {
      setS(DS.updateSettings(patch));
      // only touch the notification pipeline when a reminder setting changed
      var touchesReminders = Object.keys(patch).some(function (k) { return REMINDER_KEYS.indexOf(k) >= 0; });
      if (touchesReminders && window.SL.notifications) window.SL.notifications.sync();
    }
    var tst = useState(''); var toast = tst[0], setToast = tst[1];
    function flash(m) { setToast(m); setTimeout(function () { setToast(''); }, 2200); }
    var retiredCount = DS.listRacquets({ retiredOnly: true }).length;
    var stringerCount = DS.listStringers().length;
    function exportCSV() {
      Promise.resolve(SL.platform.shareTextFiles([
        { name: 'stringlog_racquets.csv', data: DS.racquetsCSV() },
        { name: 'stringlog_string_jobs.csv', data: DS.stringJobsCSV() },
        { name: 'stringlog_sessions.csv', data: DS.sessionsCSV() }
      ])).then(function (r) { flash(r && r.ok ? 'Exported 3 CSV files' : 'Export failed'); });
    }
    function backupJSON() {
      Promise.resolve(SL.platform.shareTextFiles([
        { name: 'stringlog_backup_' + U.todayISODate() + '.json', data: DS.exportJSON(), mime: 'application/json' }
      ])).then(function (r) { flash(r && r.ok ? 'Backup ready' : 'Backup failed'); });
    }
    function restoreJSON() {
      if (!window.confirm('Restore from a backup file? This replaces ALL current StringLog data.')) return;
      SL.platform.pickTextFile('.json,application/json').then(function (text) {
        if (text == null) return;
        var res = DS.importJSON(text);
        if (res.ok) {
          setS(DS.getSettings());
          nav.refresh();
          if (window.SL.notifications) window.SL.notifications.sync();
          flash('Restored ' + res.racquets + ' racquets, ' + res.sessions + ' sessions');
        } else {
          flash(res.error || 'Restore failed');
        }
      });
    }
    return h(Screen, { title: 'Settings' },
      h(SectionLabel, { style: { marginTop: 2 } }, 'Player'),
      h(TextField, { label: 'Display name', value: s.player_name, onChange: function (v) { upd({ player_name: v }); }, placeholder: 'Shown on share cards' }),
      h(SectionLabel, null, 'Tension Units'),
      h(Segmented, { value: s.units, onChange: function (v) { upd({ units: v }); }, options: [{ value: 'lbs', label: 'Pounds (lbs)' }, { value: 'kg', label: 'Kilograms (kg)' }] }),
      h(SectionLabel, null, 'String Age Reminders'),
      h(Card, null,
        h(Toggle, { label: 'Remind me to restring', hint: 'Local notifications only — nothing leaves your device', value: s.reminders_enabled, onChange: function (v) { upd({ reminders_enabled: v }); } }),
        s.reminders_enabled ? h('div', { style: { marginTop: 6, paddingTop: 10, borderTop: '1px solid ' + C.border } },
          h(Toggle, { label: 'After days since strung', value: s.remind_by_days, onChange: function (v) { upd({ remind_by_days: v }); } }),
          s.remind_by_days ? h(NumberField, { label: 'Days', value: s.remind_after_days, onChange: function (v) { upd({ remind_after_days: v }); }, suffix: 'days' }) : null,
          h(Toggle, { label: 'After hours played', value: s.remind_by_hours, onChange: function (v) { upd({ remind_by_hours: v }); } }),
          s.remind_by_hours ? h(NumberField, { label: 'Hours', value: s.remind_after_hours, onChange: function (v) { upd({ remind_after_hours: v }); }, suffix: 'hours' }) : null) : null),
      h(SectionLabel, null, 'Manage'),
      h('div', { style: { background: C.card, border: '1px solid ' + C.border, borderRadius: 14, padding: '0 14px' } },
        h(SettingRow, { label: 'Stringers', value: stringerCount || null, onClick: function () { nav.push(StringersScreen, {}); } }),
        h(SettingRow, { label: 'Retired racquets', value: retiredCount || null, onClick: function () { nav.push(RetiredRacquetsScreen, {}); } }),
        h(SettingRow, { label: 'Back up all data (JSON)', icon: 'share', onClick: backupJSON }),
        h(SettingRow, { label: 'Restore from backup', onClick: restoreJSON }),
        h(SettingRow, { label: 'Export all data as CSV', icon: 'share', last: true, onClick: exportCSV })),
      h(SectionLabel, null, 'About'),
      h('div', { style: { background: C.card, border: '1px solid ' + C.border, borderRadius: 14, padding: '0 14px' } },
        h(SettingRow, { label: 'Version', value: version }),
        h(SettingRow, { label: 'Privacy Policy', onClick: function () { SL.platform.openUrl('https://esbrolabs.com/privacy'); } }),
        h(SettingRow, { label: 'Support', last: true, onClick: function () { SL.platform.openUrl('https://esbrolabs.com/support'); } })),
      h('div', { style: { textAlign: 'center', color: C.textDim, fontSize: 12.5, marginTop: 22, lineHeight: 1.5 } }, 'Your data stays on your device.', h('br'), 'No account, no analytics, no server.'),
      toast ? h('div', { style: { position: 'fixed', left: 0, right: 0, bottom: 'calc(env(safe-area-inset-bottom) + 72px)', display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 50 } },
        h('div', { style: { background: C.card2, border: '1px solid ' + C.border, color: C.text, padding: '10px 18px', borderRadius: 24, fontSize: 14 } }, toast)) : null);
  }

  function StringersScreen() {
    var nav = useNav();
    var stringers = DS.listStringers();
    return h(Screen, { title: 'Stringers', onBack: function () { nav.pop(); },
      right: h('button', { 'aria-label': 'Add stringer', onClick: function () { nav.push(StringerEditScreen, {}); }, style: { color: C.gold, padding: 4, display: 'flex' } }, h(Icon, { name: 'plus', size: 24, color: C.gold })) },
      stringers.length ? h('div', null, stringers.map(function (st) {
        return h(Card, { key: st.id, onClick: function () { nav.push(StringerEditScreen, { id: st.id }); } },
          h('div', { style: { fontSize: 16, fontWeight: 600, color: C.text } }, st.name),
          (st.location || st.contact) ? h('div', { style: { fontSize: 13, color: C.textDim, marginTop: 2 } }, [st.location, st.contact].filter(Boolean).join(' · ')) : null);
      })) : h(EmptyState, { title: 'No stringers yet', subtitle: 'Save your stringers to pick them quickly when logging a string job.',
        action: h('div', { style: { maxWidth: 240, margin: '0 auto' } }, h(Button, { icon: 'plus', onClick: function () { nav.push(StringerEditScreen, {}); } }, 'Add Stringer')) }));
  }

  function StringerEditScreen(props) {
    var nav = useNav();
    var existing = props.id ? DS.listStringers().find(function (x) { return x.id === props.id; }) : null;
    var f = useForm(existing ? Object.assign({}, existing) : { name: '', location: '', contact: '', notes: '' });
    var save = useOnce(function () { SL.platform.haptic('success'); if (props.id) DS.updateStringer(props.id, f.form); else DS.addStringer(f.form); nav.refresh(); nav.pop(); });
    function del() { if (window.confirm('Delete this stringer?')) { DS.deleteStringer(props.id); nav.refresh(); nav.pop(); } }
    return h(Screen, { title: props.id ? 'Edit Stringer' : 'Add Stringer', onBack: function () { nav.pop(); } },
      h(TextField, { label: 'Name', required: true, value: f.form.name, onChange: f.set('name') }),
      h(TextField, { label: 'Location', value: f.form.location, onChange: f.set('location'), placeholder: 'Optional' }),
      h(TextField, { label: 'Contact', value: f.form.contact, onChange: f.set('contact'), placeholder: 'Phone or email (optional)', autoCapitalize: 'none' }),
      h(TextArea, { label: 'Notes', value: f.form.notes, onChange: f.set('notes'), placeholder: 'Optional' }),
      h('div', { style: { height: 6 } }),
      h(Button, { disabled: !f.form.name.trim(), onClick: save }, 'Save Stringer'),
      props.id ? h('div', { style: { marginTop: 12 } }, h(Button, { variant: 'danger', onClick: del }, 'Delete Stringer')) : null);
  }

  function RetiredRacquetsScreen() {
    var nav = useNav();
    var retired = DS.listRacquets({ retiredOnly: true });
    return h(Screen, { title: 'Retired Racquets', onBack: function () { nav.pop(); } },
      retired.length ? h('div', null, retired.map(function (r) {
        return h(Card, { key: r.id },
          h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 } },
            h('div', { onClick: function () { nav.push(RacquetDetail, { id: r.id }); }, style: { minWidth: 0, cursor: 'pointer' } },
              h('div', { style: { fontSize: 16, fontWeight: 600 } }, r.nickname || (r.brand + ' ' + r.model)),
              r.nickname ? h('div', { style: { fontSize: 13, color: C.textDim } }, r.brand + ' ' + r.model) : null),
            h('button', { onClick: function () { DS.reactivateRacquet(r.id); nav.refresh(); }, style: { color: C.gold, fontSize: 14, fontWeight: 600, flexShrink: 0 } }, 'Reactivate')));
      })) : h(EmptyState, { title: 'No retired racquets' }));
  }

  function Placeholder(props) {
    var nav = useNav();
    return h(Screen, { title: props.title || 'Screen', onBack: function () { nav.pop(); } },
      h(EmptyState, { title: props.title || 'Screen', subtitle: 'This screen is being built.' }));
  }

  // ============================ Explore: pro setups + setup finder ============================
  function ExploreNavCard(props) {
    return h(Card, { onClick: props.onClick },
      h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 } },
        h('div', { style: { minWidth: 0 } },
          h('div', { style: { fontSize: 17, fontWeight: 700 } }, props.title),
          h('div', { style: { fontSize: 13.5, color: C.textDim, marginTop: 3, lineHeight: 1.4 } }, props.subtitle)),
        h(Icon, { name: 'chevron', size: 20, color: C.textDim })));
  }

  function ExploreTab() {
    var nav = useNav();
    return h(Screen, { title: 'Explore' },
      h(ExploreNavCard, { title: 'Pro Player Setups', subtitle: 'What Alcaraz, Swiatek, Federer and more actually play with.',
        onClick: function () { nav.push(ProSetupsScreen, {}); } }),
      h(ExploreNavCard, { title: 'Setup Finder', subtitle: 'Tell it your game — more spin, power, comfort — and get string recommendations.',
        onClick: function () { nav.push(SetupFinderScreen, {}); } }),
      h('div', { style: { fontSize: 12.5, color: C.textDim, lineHeight: 1.5, marginTop: 10, padding: '0 2px' } },
        'Pro setups are as widely reported by stringing teams and gear press. Pros play customized frames under retail paint and adjust tension constantly.'));
  }

  function ProSetupsScreen() {
    var nav = useNav();
    return h(Screen, { title: 'Pro Setups', onBack: function () { nav.pop(); } },
      SL.advisor.PRO_SETUPS.map(function (p) {
        return h(Card, { key: p.id, onClick: function () { nav.push(ProSetupDetail, { id: p.id }); } },
          h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 } },
            h('div', { style: { minWidth: 0 } },
              h('div', { style: { fontSize: 16.5, fontWeight: 700 } }, p.flag + ' ' + p.name),
              h('div', { style: { fontSize: 13, color: C.textDim, marginTop: 2 } }, p.racquet)),
            p.legend ? h(Badge, { tone: 'gold' }, 'Legend') : null),
          h('div', { style: { fontSize: 13.5, color: C.text, marginTop: 8 } },
            p.mains + (p.crosses && p.crosses !== 'Same as mains' ? ' + ' + p.crosses : '')),
          h('div', { style: { fontSize: 12.5, color: C.gold, fontWeight: 600, marginTop: 3 } }, p.tension));
      }),
      h('div', { style: { fontSize: 12.5, color: C.textDim, lineHeight: 1.5, marginTop: 6, padding: '0 2px' } },
        'Tour tensions run from Adrian Mannarino’s famously slack sub-40 lbs to Sinner’s 60-plus. There is no one right answer.'));
  }

  function ProSetupDetail(props) {
    var nav = useNav();
    var p = SL.advisor.PRO_SETUPS.find(function (x) { return x.id === props.id; });
    if (!p) return h(Screen, { title: 'Pro Setup', onBack: function () { nav.pop(); } }, h(EmptyState, { title: 'Player not found' }));
    return h(Screen, { title: p.name, onBack: function () { nav.pop(); } },
      h('div', { style: { fontSize: 14, color: C.textDim, marginBottom: 12 } }, p.flag + ' ' + p.style + (p.legend ? ' · Legend' : '')),
      h(Card, null,
        h(SpecRow, { label: 'Racquet', value: p.racquet }),
        h(SpecRow, { label: 'Mains', value: p.mains }),
        h(SpecRow, { label: 'Crosses', value: p.crosses }),
        h(SpecRow, { label: 'Tension', value: p.tension })),
      h(Card, null, h('div', { style: { fontSize: 13.5, color: C.text, lineHeight: 1.55 } }, p.notes)),
      p.prefill ? h(Button, { icon: 'plus', onClick: function () { nav.push(AddStringJobScreen, { prefillMains: p.prefill }); } }, 'Try This String') : null,
      h('div', { style: { fontSize: 12.5, color: C.textDim, lineHeight: 1.5, marginTop: 14 } },
        'As widely reported. Pro frames are customized under the paint and pro tensions suit pro swings — treat this as inspiration, not a prescription.'));
  }

  function SetupFinderScreen() {
    var nav = useNav();
    var settings = DS.getSettings();
    var racquet = DS.listRacquets({ activeOnly: true })[0] || null;
    var f = useForm({ goal: 'spin', secondary: '', elbow: false, breaker: false, value: false });
    var form = f.form, set = f.set;
    var rec = useMemo(function () {
      return SL.advisor.recommend(DS.getStringCatalog(), form, racquet);
    }, [form.goal, form.secondary, form.elbow, form.breaker, form.value]);
    var secOpts = [{ value: '', label: 'None' }].concat(SL.advisor.GOALS.filter(function (g) { return g.value !== form.goal; }));
    function useString(pre) {
      nav.push(AddStringJobScreen, { prefillMains: pre });
    }
    return h(Screen, { title: 'Setup Finder', onBack: function () { nav.pop(); } },
      h(Segmented, { label: 'What do you want more of?', value: form.goal,
        onChange: function (v) { set('goal')(v); if (form.secondary === v) set('secondary')(''); }, options: SL.advisor.GOALS }),
      h(Segmented, { label: 'Also nice to have', value: form.secondary, onChange: set('secondary'), options: secOpts }),
      h(Card, null,
        h(Toggle, { label: 'Elbow or arm soreness', hint: 'Filters out stiff polys entirely', value: form.elbow, onChange: set('elbow') }),
        h(Toggle, { label: 'I break strings often', value: form.breaker, onChange: set('breaker') }),
        h(Toggle, { label: 'Keep it budget-friendly', value: form.value, onChange: set('value') })),
      h(SectionLabel, null, 'Recommended Strings'),
      rec.picks.length ? h('div', null, rec.picks.map(function (p, i) {
        return h(Card, { key: p.id },
          h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 } },
            h('div', { style: { fontSize: 15.5, fontWeight: 700, color: C.text, minWidth: 0 } }, (i + 1) + '. ' + (p.custom ? '★ ' : '') + p.brand + ' ' + p.model),
            h('span', { style: { fontSize: 12.5, color: C.textDim, whiteSpace: 'nowrap' } }, [p.gauge_label, p.type].filter(Boolean).join(' · '))),
          p.why ? h('div', { style: { fontSize: 13, color: C.textDim, marginTop: 5, lineHeight: 1.45 } }, p.why) : null,
          h('div', { style: { marginTop: 10 } },
            h('button', { onClick: function () { useString({ brand: p.brand, model: p.model, gauge: p.gauge_label, type: p.type }); },
              style: { color: C.gold, fontSize: 14, fontWeight: 600 } }, '+ Use in a String Job')));
      })) : h('div', { style: { fontSize: 13.5, color: C.textDim, padding: '4px 2px 10px' } }, 'No matches — try relaxing a preference.'),
      rec.hybrid ? h('div', null,
        h(SectionLabel, null, 'Or Go Hybrid'),
        h(Card, null,
          h('div', { style: { fontSize: 15, fontWeight: 700, color: C.gold } }, rec.hybrid.title),
          h('div', { style: { fontSize: 13.5, color: C.text, marginTop: 6 } }, 'Mains: ' + rec.hybrid.mains),
          h('div', { style: { fontSize: 13.5, color: C.text, marginTop: 2 } }, 'Crosses: ' + rec.hybrid.crosses),
          h('div', { style: { fontSize: 13, color: C.textDim, marginTop: 6, lineHeight: 1.45 } }, rec.hybrid.why),
          h('div', { style: { marginTop: 10 } },
            h('button', { onClick: function () { useString(rec.hybrid.prefill); }, style: { color: C.gold, fontSize: 14, fontWeight: 600 } }, '+ Use in a String Job')))) : null,
      h(SectionLabel, null, 'Tension'),
      h(Card, null,
        rec.tension.targetLbs ? h('div', { style: { fontSize: 15, fontWeight: 700, color: C.gold, marginBottom: 6 } },
          'Start around ' + U.displayTension(rec.tension.targetLbs, settings.units) + (racquet ? ' on your ' + (racquet.nickname || racquet.model) : '')) : null,
        h('div', { style: { fontSize: 13.5, color: C.text, lineHeight: 1.5 } }, rec.tension.line),
        rec.tension.extra ? h('div', { style: { fontSize: 13, color: C.textDim, lineHeight: 1.5, marginTop: 8 } }, rec.tension.extra) : null),
      h('div', { style: { fontSize: 12.5, color: C.textDim, lineHeight: 1.5, marginTop: 12 } },
        'Recommendations come from the built-in string catalog and general stringing wisdom — your logged sessions are always the better judge.'));
  }

  // ============================ Tab bar ============================
  var TABS = [
    { key: 'racquets', label: 'Racquets', icon: 'racquet', Comp: RacquetsTab },
    { key: 'log', label: 'Log', icon: 'plus', Comp: LogTab },
    { key: 'history', label: 'History', icon: 'history', Comp: HistoryTab },
    { key: 'explore', label: 'Explore', icon: 'trophy', Comp: ExploreTab },
    { key: 'settings', label: 'Settings', icon: 'settings', Comp: SettingsTab }
  ];

  function TabBar(props) {
    return h('div', {
      style: {
        flexShrink: 0, display: 'flex', borderTop: '1px solid ' + C.border, background: '#0d0d0d',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }
    }, TABS.map(function (t) {
      var active = props.tab === t.key;
      return h('button', {
        key: t.key, onClick: function () { props.onTab(t.key); },
        style: { flex: 1, padding: '9px 0 7px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, color: active ? C.gold : C.textDim }
      },
        h(Icon, { name: t.icon, size: 25, color: active ? C.gold : C.textDim }),
        h('span', { style: { fontSize: 10.5, fontWeight: active ? 700 : 500 } }, t.label));
    }));
  }

  // ============================ App ============================
  function App() {
    var s = useState('racquets'); var tab = s[0], setTab = s[1];
    var st = useState([]); var stack = st[0], setStack = st[1];
    var rv = useState(0); var rev = rv[0], setRev = rv[1];
    var rc = useState(DS.isCatalogReady()); var catalogReady = rc[0], setCatalogReady = rc[1];

    useEffect(function () {
      if (!DS.isCatalogReady()) DS.init().then(function () { setCatalogReady(true); });
      var warned = false;
      DS.onStorageError(function () {
        if (warned) return; // one warning per session is enough
        warned = true;
        window.alert('StringLog could not save your latest change. Your device storage may be full.');
      });
    }, []);

    useEffect(function () {
      if (window.SL.notifications) window.SL.notifications.sync();
    }, [rev]);

    var nav = useMemo(function () {
      return {
        push: function (Comp, props) { setStack(function (s) { return s.concat([{ Comp: Comp, props: props || {} }]); }); },
        pop: function () { setStack(function (s) { return s.slice(0, -1); }); },
        popToRoot: function () { setStack([]); },
        replace: function (Comp, props) { setStack(function (s) { return s.slice(0, -1).concat([{ Comp: Comp, props: props || {} }]); }); },
        goTab: function (t) { setStack([]); setTab(t); },
        refresh: function () { setRev(function (r) { return r + 1; }); }
      };
    }, []);

    var TabComp = (TABS.find(function (t) { return t.key === tab; }) || TABS[0]).Comp;
    var top = stack.length ? stack[stack.length - 1] : null;

    return h(Nav.Provider, { value: nav },
      h('div', { style: { display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' } },
        h('div', { style: { flex: 1, minHeight: 0, display: top ? 'none' : 'flex', flexDirection: 'column' } }, h(TabComp, null)),
        top ? h('div', { key: stack.length, className: 'fade-enter', style: { position: 'absolute', inset: 0, background: C.bg, display: 'flex', flexDirection: 'column', zIndex: 10 } }, h(top.Comp, top.props)) : null,
        top ? null : h(TabBar, { tab: tab, onTab: function (t) { nav.goTab(t); } })));
  }

  // expose a few internals so later modules / debugging can reach them
  SL.ui = { Icon: Icon, Header: Header, Screen: Screen, Card: Card, Button: Button, Badge: Badge, StatusDot: StatusDot, EmptyState: EmptyState, useNav: useNav, Nav: Nav };

  ReactDOM.createRoot(document.getElementById('root')).render(h(App));
})();

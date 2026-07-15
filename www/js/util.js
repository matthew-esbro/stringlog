/* StringLog utilities, enums, and theme tokens. Pure logic, no UI, no storage. */
(function () {
  'use strict';
  var SL = (window.SL = window.SL || {});

  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0, v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function nowISO() { return new Date().toISOString(); }

  function isoDate(d) {
    var y = d.getFullYear(),
        m = String(d.getMonth() + 1).padStart(2, '0'),
        day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }
  function todayISODate() { return isoDate(new Date()); }

  function parseDate(s) {
    if (!s) return null;
    var d = new Date(String(s).length <= 10 ? s + 'T00:00:00' : s);
    return isNaN(d.getTime()) ? null : d;
  }
  function formatDate(s) {
    var d = parseDate(s);
    if (!d) return '';
    return MONTHS[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
  }
  function formatDateShort(s) {
    var d = parseDate(s);
    if (!d) return '';
    return (d.getMonth() + 1) + '/' + d.getDate() + '/' + String(d.getFullYear()).slice(2);
  }
  function daysSince(s) {
    var d = parseDate(s);
    if (!d) return null;
    return Math.floor((Date.now() - d.getTime()) / 86400000);
  }
  function daysBetween(a, b) {
    var da = parseDate(a), db = parseDate(b);
    if (!da || !db) return null;
    return Math.round((db.getTime() - da.getTime()) / 86400000);
  }

  function lbsToKg(lbs) { return Number(lbs) * 0.45359237; }
  function kgToLbs(kg) { return Number(kg) / 0.45359237; }
  function round1(n) { return Math.round(Number(n) * 10) / 10; }
  function displayTension(lbs, units) {
    if (lbs == null || lbs === '') return '';
    if (units === 'kg') return round1(lbsToKg(lbs)) + ' kg';
    return round1(lbs) + ' lbs';
  }
  function formatHours(h) {
    if (h == null) return '0h';
    if (h > 0 && h < 1) return Math.round(h * 60) + 'm';
    return round1(h) + 'h';
  }
  function formatMoney(n) {
    var x = Number(n);
    if (isNaN(x)) return '';
    return '$' + x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  var SURFACES = [
    { value: 'hard', label: 'Hard' },
    { value: 'clay', label: 'Clay' },
    { value: 'grass', label: 'Grass' },
    { value: 'indoor_hard', label: 'Indoor Hard' },
    { value: 'indoor_clay', label: 'Indoor Clay' }
  ];
  var SESSION_TYPES = [
    { value: 'match', label: 'Match' },
    { value: 'practice', label: 'Practice' },
    { value: 'hit', label: 'Hit' },
    { value: 'lesson', label: 'Lesson' },
    { value: 'tournament', label: 'Tournament' }
  ];
  var WHY_RESTRUNG = [
    { value: 'first_time', label: 'First time' },
    { value: 'broke', label: 'Broke' },
    { value: 'proactive', label: 'Proactive' },
    { value: 'tension_loss', label: 'Tension loss' },
    { value: 'new_setup', label: 'Trying new setup' },
    { value: 'other', label: 'Other' }
  ];
  var FEEL_LABELS = { 1: 'Dead', 2: 'Flat', 3: 'OK', 4: 'Good', 5: 'Crisp' };
  var STRING_TYPES = ['Polyester', 'Multifilament', 'Natural Gut', 'Synthetic Gut', 'Hybrid', 'Kevlar'];
  var GRIP_SIZES = ['4 1/8', '4 1/4', '4 3/8', '4 1/2', '4 5/8'];

  var COLORS = {
    bg: '#0a0a0a', gold: '#e2c07a', goldDim: '#9a8455', card: '#1a1a1a', card2: '#232323',
    border: '#2a2a2a', text: '#f2f2f2', textDim: '#9a9a9a',
    green: '#4caf50', yellow: '#ffc107', red: '#f44336'
  };

  function labelFor(list, value) {
    for (var i = 0; i < list.length; i++) if (list[i].value === value) return list[i].label;
    return value || '';
  }

  /* String-age status: returns 'green' | 'yellow' | 'red'.
     Past either enabled threshold -> red; within 80% -> yellow; else green. */
  function stringStatus(daysStrung, hoursPlayed, settings) {
    settings = settings || {};
    var worst = 0; // 0 green, 1 yellow, 2 red
    function bump(ratio) {
      var s = ratio >= 1 ? 2 : (ratio >= 0.8 ? 1 : 0);
      if (s > worst) worst = s;
    }
    var anyThreshold = false;
    if (settings.remind_by_days && settings.remind_after_days) {
      anyThreshold = true;
      if (daysStrung != null) bump(daysStrung / settings.remind_after_days);
    }
    if (settings.remind_by_hours && settings.remind_after_hours) {
      anyThreshold = true;
      if (hoursPlayed != null) bump(hoursPlayed / settings.remind_after_hours);
    }
    if (!anyThreshold) return 'green';
    return worst === 2 ? 'red' : worst === 1 ? 'yellow' : 'green';
  }

  SL.util = {
    uuid: uuid, nowISO: nowISO, isoDate: isoDate, todayISODate: todayISODate,
    parseDate: parseDate, formatDate: formatDate, formatDateShort: formatDateShort,
    daysSince: daysSince, daysBetween: daysBetween,
    lbsToKg: lbsToKg, kgToLbs: kgToLbs, round1: round1,
    displayTension: displayTension, formatHours: formatHours, formatMoney: formatMoney,
    SURFACES: SURFACES, SESSION_TYPES: SESSION_TYPES, WHY_RESTRUNG: WHY_RESTRUNG,
    FEEL_LABELS: FEEL_LABELS, STRING_TYPES: STRING_TYPES, GRIP_SIZES: GRIP_SIZES,
    COLORS: COLORS, labelFor: labelFor, stringStatus: stringStatus
  };
})();

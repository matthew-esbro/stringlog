/* StringLog DataService.
 *
 * The SINGLE gateway to persistence. All reads/writes go through here.
 * Only `Store` touches localStorage, so it can be swapped for Core Data +
 * CloudKit later without changing any UI or business logic.
 * Pure data: no Capacitor / DOM / UI dependencies.
 */
(function () {
  'use strict';
  var SL = (window.SL = window.SL || {});
  var U = SL.util;

  // ---- storage adapter: the ONLY place localStorage is accessed ----
  var PREFIX = 'stringlog.';
  var storageErrorHandler = null; // UI registers a handler so failed writes are not silent
  var Store = {
    get: function (key, fallback) {
      try {
        var raw = localStorage.getItem(PREFIX + key);
        return raw == null ? fallback : JSON.parse(raw);
      } catch (e) { return fallback; }
    },
    set: function (key, value) {
      try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); }
      catch (e) {
        console.error('Store.set failed:', key, e);
        if (storageErrorHandler) storageErrorHandler(e);
      }
    },
    remove: function (key) { localStorage.removeItem(PREFIX + key); }
  };
  function onStorageError(fn) { storageErrorHandler = fn; }

  var K = {
    racquets: 'racquets', stringJobs: 'stringJobs', sessions: 'sessions',
    stringers: 'stringers', customStrings: 'customStrings', settings: 'settings'
  };

  // ---- storage schema version: bump + migrate here when the shape of stored data changes ----
  var SCHEMA_VERSION = 1;
  if (Store.get('schemaVersion', null) == null) Store.set('schemaVersion', SCHEMA_VERSION);

  var DEFAULT_SETTINGS = {
    player_name: '', units: 'lbs',
    reminders_enabled: false,
    remind_by_days: true, remind_after_days: 30,
    remind_by_hours: true, remind_after_hours: 10
  };

  function coll(key) { return Store.get(key, []); }
  function save(key, arr) { Store.set(key, arr); }
  function lc(s) { return String(s || '').toLowerCase(); }
  function avg(a) { return a.reduce(function (x, y) { return x + y; }, 0) / a.length; }

  // ---------------- string catalog (bundled + user-remembered) ----------------
  var bundledStrings = [];
  var catalogReady = false;

  function init() {
    return fetch('data/strings.json', { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (json) { bundledStrings = json || []; catalogReady = true; return true; })
      .catch(function (e) { console.error('strings.json load failed', e); bundledStrings = []; catalogReady = true; return false; });
  }
  function isCatalogReady() { return catalogReady; }

  function getStringCatalog() {
    // user's custom strings first so their own gear surfaces at the top
    return coll(K.customStrings).concat(bundledStrings);
  }
  function searchStrings(q) {
    var all = getStringCatalog();
    if (!q || !q.trim()) return all;
    var t = q.trim().toLowerCase();
    return all.filter(function (s) {
      return (lc(s.brand) + ' ' + lc(s.model) + ' ' + lc(s.gauge_label) + ' ' + lc(s.type)).indexOf(t) >= 0;
    });
  }
  function findString(brand, model, gauge) {
    return getStringCatalog().find(function (s) {
      return lc(s.brand) === lc(brand) && lc(s.model) === lc(model) &&
        (gauge == null || String(s.gauge_label) === String(gauge) || String(s.gauge_mm) === String(gauge));
    }) || null;
  }
  function rememberString(s) {
    if (!s || !s.brand || !s.model) return;
    if (findString(s.brand, s.model, s.gauge_label || s.gauge_mm)) return;
    var custom = coll(K.customStrings);
    custom.unshift({
      id: 'custom_' + U.uuid(), brand: s.brand, model: s.model,
      gauge_mm: s.gauge_mm != null && s.gauge_mm !== '' ? Number(s.gauge_mm) : null,
      gauge_label: s.gauge_label || '', type: s.type || '', color: s.color || '', custom: true
    });
    save(K.customStrings, custom);
  }

  // ---------------- racquets ----------------
  function listRacquets(opts) {
    opts = opts || {};
    var arr = coll(K.racquets);
    if (opts.activeOnly) arr = arr.filter(function (r) { return r.is_active !== false; });
    if (opts.retiredOnly) arr = arr.filter(function (r) { return r.is_active === false; });
    return arr.slice().sort(function (a, b) { return String(b.created_at).localeCompare(String(a.created_at)); });
  }
  function getRacquet(id) { return coll(K.racquets).find(function (r) { return r.id === id; }) || null; }
  function addRacquet(data) {
    var arr = coll(K.racquets);
    var r = Object.assign({
      id: U.uuid(), brand: '', model: '', nickname: '', head_size_sq_in: null,
      weight_oz: null, string_pattern: '', grip_size: '',
      recommended_tension_min: null, recommended_tension_max: null,
      purchase_date: null, notes: '', is_active: true, created_at: U.nowISO()
    }, data);
    arr.push(r); save(K.racquets, arr); return r;
  }
  function updateRacquet(id, patch) {
    var arr = coll(K.racquets), i = arr.findIndex(function (r) { return r.id === id; });
    if (i < 0) return null;
    arr[i] = Object.assign({}, arr[i], patch); save(K.racquets, arr); return arr[i];
  }
  function retireRacquet(id) { return updateRacquet(id, { is_active: false }); }
  function reactivateRacquet(id) { return updateRacquet(id, { is_active: true }); }
  function deleteRacquet(id) {
    save(K.racquets, coll(K.racquets).filter(function (r) { return r.id !== id; }));
    save(K.stringJobs, coll(K.stringJobs).filter(function (j) { return j.racquet_id !== id; }));
    save(K.sessions, coll(K.sessions).filter(function (s) { return s.racquet_id !== id; }));
  }

  // ---------------- string jobs ----------------
  function listStringJobs(opts) {
    opts = opts || {};
    var arr = coll(K.stringJobs);
    if (opts.racquetId) arr = arr.filter(function (j) { return j.racquet_id === opts.racquetId; });
    return arr.slice().sort(function (a, b) {
      return String(b.date_strung).localeCompare(String(a.date_strung)) ||
             String(b.created_at).localeCompare(String(a.created_at));
    });
  }
  function getStringJob(id) { return coll(K.stringJobs).find(function (j) { return j.id === id; }) || null; }
  function addStringJob(data) {
    var arr = coll(K.stringJobs);
    var j = Object.assign({
      id: U.uuid(), racquet_id: null, date_strung: U.todayISODate(), stringer_name: '',
      mains_string_brand: '', mains_string_model: '', mains_gauge: '', mains_type: '', mains_tension_lbs: null,
      crosses_same_as_mains: true, crosses_string_brand: '', crosses_string_model: '',
      crosses_gauge: '', crosses_type: '', crosses_tension_lbs: null, pre_stretch_applied: false,
      stringing_machine: '', date_broke: null, why_restrung: 'new_setup', cost: null,
      notes: '', created_at: U.nowISO()
    }, data);
    arr.push(j); save(K.stringJobs, arr);
    if (j.mains_string_brand) rememberString({ brand: j.mains_string_brand, model: j.mains_string_model, gauge_label: j.mains_gauge, type: j.mains_type });
    if (!j.crosses_same_as_mains && j.crosses_string_brand) rememberString({ brand: j.crosses_string_brand, model: j.crosses_string_model, gauge_label: j.crosses_gauge, type: j.crosses_type });
    return j;
  }
  function updateStringJob(id, patch) {
    var arr = coll(K.stringJobs), i = arr.findIndex(function (j) { return j.id === id; });
    if (i < 0) return null;
    arr[i] = Object.assign({}, arr[i], patch); save(K.stringJobs, arr); return arr[i];
  }
  function deleteStringJob(id) {
    save(K.stringJobs, coll(K.stringJobs).filter(function (j) { return j.id !== id; }));
    save(K.sessions, coll(K.sessions).map(function (s) {
      return s.string_job_id === id ? Object.assign({}, s, { string_job_id: null }) : s;
    }));
  }
  function currentStringJob(racquetId) {
    var jobs = listStringJobs({ racquetId: racquetId });
    if (!jobs.length) return null;
    var active = jobs.filter(function (j) { return !j.date_broke; });
    return active[0] || jobs[0];
  }
  function markBroke(id, dateISO) { return updateStringJob(id, { date_broke: dateISO || U.todayISODate() }); }

  // ---------------- sessions ----------------
  function listSessions(opts) {
    opts = opts || {};
    var arr = coll(K.sessions);
    if (opts.racquetId) arr = arr.filter(function (s) { return s.racquet_id === opts.racquetId; });
    if (opts.surface) arr = arr.filter(function (s) { return s.surface === opts.surface; });
    if (opts.stringJobId) arr = arr.filter(function (s) { return s.string_job_id === opts.stringJobId; });
    return arr.slice().sort(function (a, b) {
      return String(b.date).localeCompare(String(a.date)) ||
             String(b.created_at).localeCompare(String(a.created_at));
    });
  }
  function getSession(id) { return coll(K.sessions).find(function (s) { return s.id === id; }) || null; }
  function addSession(data) {
    var arr = coll(K.sessions);
    var s = Object.assign({
      id: U.uuid(), racquet_id: null, string_job_id: null, date: U.todayISODate(),
      duration_minutes: null, surface: 'hard', session_type: 'practice',
      conditions: '', string_feel_rating: null, notes: '', created_at: U.nowISO()
    }, data);
    arr.push(s); save(K.sessions, arr); return s;
  }
  function updateSession(id, patch) {
    var arr = coll(K.sessions), i = arr.findIndex(function (s) { return s.id === id; });
    if (i < 0) return null;
    arr[i] = Object.assign({}, arr[i], patch); save(K.sessions, arr); return arr[i];
  }
  function deleteSession(id) { save(K.sessions, coll(K.sessions).filter(function (s) { return s.id !== id; })); }

  // ---------------- stringers ----------------
  function listStringers() {
    return coll(K.stringers).slice().sort(function (a, b) { return String(a.name).localeCompare(String(b.name)); });
  }
  function addStringer(data) {
    var arr = coll(K.stringers);
    var s = Object.assign({ id: U.uuid(), name: '', location: '', contact: '', notes: '' }, data);
    arr.push(s); save(K.stringers, arr); return s;
  }
  function updateStringer(id, patch) {
    var arr = coll(K.stringers), i = arr.findIndex(function (s) { return s.id === id; });
    if (i < 0) return null;
    arr[i] = Object.assign({}, arr[i], patch); save(K.stringers, arr); return arr[i];
  }
  function deleteStringer(id) { save(K.stringers, coll(K.stringers).filter(function (s) { return s.id !== id; })); }

  // ---------------- settings ----------------
  function getSettings() { return Object.assign({}, DEFAULT_SETTINGS, Store.get(K.settings, {})); }
  function updateSettings(patch) { var s = Object.assign({}, getSettings(), patch); Store.set(K.settings, s); return s; }

  // ---------------- analytics (all derived, never stored) ----------------
  function hoursPlayedForJob(jobId) {
    var mins = coll(K.sessions).filter(function (s) { return s.string_job_id === jobId; })
      .reduce(function (sum, s) { return sum + (Number(s.duration_minutes) || 0); }, 0);
    return mins / 60;
  }
  function avgFeelForJob(jobId) {
    var rated = coll(K.sessions).filter(function (s) { return s.string_job_id === jobId && s.string_feel_rating; });
    if (!rated.length) return null;
    return avg(rated.map(function (s) { return Number(s.string_feel_rating); }));
  }
  function sessionCountForJob(jobId) {
    return coll(K.sessions).filter(function (s) { return s.string_job_id === jobId; }).length;
  }
  function mainsTypeForJob(j) {
    if (j.mains_type) return j.mains_type;
    var m = findString(j.mains_string_brand, j.mains_string_model);
    return m ? m.type : null;
  }
  /* A job's life ends when it breaks, or when a newer job is strung on the
     same racquet (superseded). Returns a map of jobId -> end date (ISO) or null. */
  function jobEndDates() {
    var ends = {}, byRacquet = {};
    coll(K.stringJobs).forEach(function (j) {
      (byRacquet[j.racquet_id] = byRacquet[j.racquet_id] || []).push(j);
    });
    Object.keys(byRacquet).forEach(function (rid) {
      var list = byRacquet[rid].sort(function (a, b) {
        return String(a.date_strung).localeCompare(String(b.date_strung)) ||
               String(a.created_at).localeCompare(String(b.created_at));
      });
      list.forEach(function (j, i) {
        ends[j.id] = j.date_broke || (i + 1 < list.length ? list[i + 1].date_strung : null);
      });
    });
    return ends;
  }
  function stringLifeByType() {
    var jobs = coll(K.stringJobs), byType = {}, ends = jobEndDates();
    jobs.forEach(function (j) {
      var type = mainsTypeForJob(j);
      if (!type) return;
      if (!byType[type]) byType[type] = { type: type, count: 0, daysList: [], hoursList: [] };
      byType[type].count++;
      var end = ends[j.id];
      if (!end) return; // still in play: only completed lifetimes count toward averages
      var days = U.daysBetween(j.date_strung, end);
      if (days != null && days >= 0) byType[type].daysList.push(days);
      var hrs = hoursPlayedForJob(j.id);
      if (hrs > 0) byType[type].hoursList.push(hrs);
    });
    return Object.keys(byType).map(function (k) {
      var t = byType[k];
      return {
        type: t.type, count: t.count,
        avgDays: t.daysList.length ? Math.round(avg(t.daysList)) : null,
        avgHours: t.hoursList.length ? Math.round(avg(t.hoursList) * 10) / 10 : null
      };
    }).sort(function (a, b) { return b.count - a.count; });
  }
  function topRatedSetups(limit) {
    return coll(K.stringJobs).map(function (j) {
      return { job: j, avg: avgFeelForJob(j.id), sessions: sessionCountForJob(j.id) };
    }).filter(function (x) { return x.avg != null; })
      .sort(function (a, b) { return b.avg - a.avg; })
      .slice(0, limit || 5);
  }
  function totals() {
    var sessions = coll(K.sessions), jobs = coll(K.stringJobs);
    var totalMinutes = sessions.reduce(function (a, s) { return a + (Number(s.duration_minutes) || 0); }, 0);
    var costs = jobs.map(function (j) { return Number(j.cost); }).filter(function (c) { return !isNaN(c) && c > 0; });
    return {
      totalSessions: sessions.length,
      totalHours: Math.round(totalMinutes / 60 * 10) / 10,
      totalCost: costs.length ? Math.round(costs.reduce(function (a, c) { return a + c; }, 0) * 100) / 100 : null,
      jobCount: jobs.length
    };
  }
  function mostUsedString() {
    var counts = {};
    coll(K.stringJobs).forEach(function (j) {
      if (!j.mains_string_brand) return;
      var key = (j.mains_string_brand + ' ' + j.mains_string_model).trim();
      counts[key] = (counts[key] || 0) + 1;
    });
    var best = null, bestN = 0;
    Object.keys(counts).forEach(function (k) { if (counts[k] > bestN) { bestN = counts[k]; best = k; } });
    return best ? { name: best, count: bestN } : null;
  }

  // ---------------- CSV (pure strings; file writing handled by caller) ----------------
  function esc(v) {
    if (v == null) return '';
    var s = String(v);
    // guard against spreadsheet formula injection; plain negative numbers are left alone
    if (/^[=+@-]/.test(s) && !/^-?\d/.test(s)) s = "'" + s;
    return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }
  function toCSV(rows) { return rows.map(function (r) { return r.map(esc).join(','); }).join('\r\n'); }
  function racquetsCSV() {
    var h = ['id', 'brand', 'model', 'nickname', 'head_size_sq_in', 'weight_oz', 'string_pattern', 'grip_size', 'recommended_tension_min', 'recommended_tension_max', 'purchase_date', 'notes', 'is_active', 'created_at'];
    return toCSV([h].concat(coll(K.racquets).map(function (r) { return h.map(function (k) { return r[k]; }); })));
  }
  function stringJobsCSV() {
    var h = ['id', 'racquet_id', 'date_strung', 'stringer_name', 'mains_string_brand', 'mains_string_model', 'mains_gauge', 'mains_type', 'mains_tension_lbs', 'crosses_same_as_mains', 'crosses_string_brand', 'crosses_string_model', 'crosses_gauge', 'crosses_type', 'crosses_tension_lbs', 'pre_stretch_applied', 'stringing_machine', 'date_broke', 'why_restrung', 'cost', 'notes', 'created_at'];
    return toCSV([h].concat(coll(K.stringJobs).map(function (j) { return h.map(function (k) { return j[k]; }); })));
  }
  function sessionsCSV() {
    var h = ['id', 'racquet_id', 'string_job_id', 'date', 'duration_minutes', 'surface', 'session_type', 'conditions', 'string_feel_rating', 'notes', 'created_at'];
    return toCSV([h].concat(coll(K.sessions).map(function (s) { return h.map(function (k) { return s[k]; }); })));
  }

  // ---------------- full backup / restore (JSON) ----------------
  function exportJSON() {
    return JSON.stringify({
      app: 'stringlog', schema: SCHEMA_VERSION, exported_at: U.nowISO(),
      racquets: coll(K.racquets), stringJobs: coll(K.stringJobs), sessions: coll(K.sessions),
      stringers: coll(K.stringers), customStrings: coll(K.customStrings), settings: getSettings()
    }, null, 2);
  }
  function importJSON(text) {
    var data;
    try { data = JSON.parse(text); } catch (e) { return { ok: false, error: 'Not a valid JSON file' }; }
    if (!data || data.app !== 'stringlog' || !Array.isArray(data.racquets)) {
      return { ok: false, error: 'Not a StringLog backup file' };
    }
    save(K.racquets, data.racquets);
    save(K.stringJobs, Array.isArray(data.stringJobs) ? data.stringJobs : []);
    save(K.sessions, Array.isArray(data.sessions) ? data.sessions : []);
    save(K.stringers, Array.isArray(data.stringers) ? data.stringers : []);
    save(K.customStrings, Array.isArray(data.customStrings) ? data.customStrings : []);
    Store.set(K.settings, Object.assign({}, DEFAULT_SETTINGS, data.settings || {}));
    Store.set('schemaVersion', SCHEMA_VERSION);
    return { ok: true, racquets: data.racquets.length, sessions: (Array.isArray(data.sessions) ? data.sessions : []).length };
  }

  SL.DataService = {
    init: init, isCatalogReady: isCatalogReady,
    getStringCatalog: getStringCatalog, searchStrings: searchStrings, findString: findString, rememberString: rememberString,
    listRacquets: listRacquets, getRacquet: getRacquet, addRacquet: addRacquet, updateRacquet: updateRacquet,
    retireRacquet: retireRacquet, reactivateRacquet: reactivateRacquet, deleteRacquet: deleteRacquet,
    listStringJobs: listStringJobs, getStringJob: getStringJob, addStringJob: addStringJob, updateStringJob: updateStringJob,
    deleteStringJob: deleteStringJob, currentStringJob: currentStringJob, markBroke: markBroke,
    listSessions: listSessions, getSession: getSession, addSession: addSession, updateSession: updateSession, deleteSession: deleteSession,
    listStringers: listStringers, addStringer: addStringer, updateStringer: updateStringer, deleteStringer: deleteStringer,
    getSettings: getSettings, updateSettings: updateSettings, onStorageError: onStorageError,
    hoursPlayedForJob: hoursPlayedForJob, avgFeelForJob: avgFeelForJob, sessionCountForJob: sessionCountForJob,
    stringLifeByType: stringLifeByType, topRatedSetups: topRatedSetups, totals: totals, mostUsedString: mostUsedString,
    racquetsCSV: racquetsCSV, stringJobsCSV: stringJobsCSV, sessionsCSV: sessionsCSV,
    exportJSON: exportJSON, importJSON: importJSON
  };
})();

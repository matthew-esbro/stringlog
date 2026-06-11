/* StringLog local notifications (string-age reminders).
 *
 * Uses @capacitor/local-notifications when running natively; no-ops in a browser.
 * Day-based reminders are scheduled for a future fire date. Hours-played reminders
 * can't fire on their own (iOS doesn't run the app in the background to accrue play
 * time), so they are evaluated on app launch and after a session is logged, firing
 * an immediate notification when the threshold is first crossed.
 */
(function () {
  'use strict';
  var SL = (window.SL = window.SL || {});
  var U = SL.util, DS = SL.DataService;

  function plugin() { return (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications) || null; }
  function available() { return !!plugin(); }

  function hashId(str) { var h = 0; for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0; return Math.abs(h) % 2000000000 + 1; }

  function ensurePermission() {
    var p = plugin(); if (!p) return Promise.resolve(false);
    return p.checkPermissions()
      .then(function (res) { return res.display === 'granted' ? true : p.requestPermissions().then(function (r) { return r.display === 'granted'; }); })
      .catch(function () { return false; });
  }

  function cancelPending(keepIds) {
    var p = plugin(); if (!p) return Promise.resolve();
    return p.getPending().then(function (res) {
      var ids = (res.notifications || [])
        .filter(function (n) { return !keepIds || keepIds.indexOf(n.id) < 0; })
        .map(function (n) { return { id: n.id }; });
      return ids.length ? p.cancel({ notifications: ids }) : null;
    }).catch(function () {});
  }

  // Reschedule all day-based reminders for active, unbroken string jobs.
  function reschedule() {
    var p = plugin(); if (!p) return Promise.resolve();
    var s = DS.getSettings();
    // Keep pending hours-played notifications alive: they are one-shot (their
    // notified flag is already set), so cancelling them here would lose them forever.
    var keep = [];
    if (s.reminders_enabled && s.remind_by_hours) {
      DS.listRacquets({ activeOnly: true }).forEach(function (r) {
        var job = DS.currentStringJob(r.id);
        if (job && !job.date_broke) keep.push(hashId(job.id + '_hours'));
      });
    }
    return cancelPending(keep).then(function () {
      if (!s.reminders_enabled || !s.remind_by_days || !s.remind_after_days) return;
      return ensurePermission().then(function (granted) {
        if (!granted) return;
        var list = [];
        DS.listRacquets({ activeOnly: true }).forEach(function (r) {
          var job = DS.currentStringJob(r.id);
          if (!job || job.date_broke) return;
          var d = U.parseDate(job.date_strung); if (!d) return;
          var when = new Date(d.getTime() + s.remind_after_days * 86400000);
          if (when.getTime() > Date.now() + 60000) {
            list.push({
              id: hashId(job.id + '_days'), title: 'Time to check your strings',
              body: (r.nickname || (r.brand + ' ' + r.model)) + ' was strung ' + s.remind_after_days + ' days ago.',
              schedule: { at: when }
            });
          }
        });
        return list.length ? p.schedule({ notifications: list }) : null;
      });
    });
  }

  // Fire an immediate reminder for jobs that have just crossed the hours-played threshold.
  function evaluateHoursReminders() {
    var p = plugin(); if (!p) return Promise.resolve();
    var s = DS.getSettings();
    if (!s.reminders_enabled || !s.remind_by_hours || !s.remind_after_hours) return Promise.resolve();
    return ensurePermission().then(function (granted) {
      if (!granted) return;
      // prune entries for jobs that were deleted or broke, so the map can't grow forever
      var stored = s._hoursNotified || {};
      var notified = {};
      Object.keys(stored).forEach(function (id) {
        var j = DS.getStringJob(id);
        if (j && !j.date_broke) notified[id] = true;
      });
      var list = [], newIds = [];
      DS.listRacquets({ activeOnly: true }).forEach(function (r) {
        var job = DS.currentStringJob(r.id);
        if (!job || job.date_broke) return;
        var hrs = DS.hoursPlayedForJob(job.id);
        if (hrs >= s.remind_after_hours && !notified[job.id]) {
          list.push({
            id: hashId(job.id + '_hours'), title: 'Time to check your strings',
            body: (r.nickname || (r.brand + ' ' + r.model)) + ' has ' + Math.round(hrs) + 'h played on these strings.',
            schedule: { at: new Date(Date.now() + 3000) }
          });
          newIds.push(job.id);
        }
      });
      if (!list.length) {
        if (Object.keys(notified).length !== Object.keys(stored).length) DS.updateSettings({ _hoursNotified: notified });
        return;
      }
      return p.schedule({ notifications: list }).then(function () {
        newIds.forEach(function (id) { notified[id] = true; });
        DS.updateSettings({ _hoursNotified: notified });
      });
    });
  }

  function sync() { return reschedule().then(evaluateHoursReminders); }

  SL.notifications = { available: available, ensurePermission: ensurePermission, reschedule: reschedule, evaluateHoursReminders: evaluateHoursReminders, sync: sync };
})();

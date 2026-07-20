/* StringLog advisor: famous player setups + preference-based string recommendations.
 * Pure data + logic, no UI, no storage. The recommender scores the bundled string
 * catalog (passed in by the caller) so it automatically covers custom strings too.
 *
 * Pro setups are as widely reported by stringing teams and gear press. Pros play
 * customized frames under retail paint and adjust tension constantly; the numbers
 * here are reference points, not prescriptions.
 */
(function () {
  'use strict';
  var SL = (window.SL = window.SL || {});

  // ---------------- famous player setups ----------------
  // prefill: passed straight into a new string job's mains when the user taps "Try this string".
  var PRO_SETUPS = [
    {
      id: 'alcaraz', name: 'Carlos Alcaraz', flag: '🇪🇸', style: 'Explosive all-court',
      racquet: 'Babolat Pure Aero 98',
      mains: 'Babolat RPM Blast 16 (1.30)', crosses: 'Same as mains',
      tension: '55 lbs mains / 51 lbs crosses (25 / 23 kg)',
      notes: 'Full poly with the mains a few pounds tighter than the crosses; thick 16 gauge for durability under extreme spin. Some late-2025 reports say he moved to the softer RPM Team.',
      prefill: { brand: 'Babolat', model: 'RPM Blast', gauge: '16g', type: 'Polyester' }
    },
    {
      id: 'sinner', name: 'Jannik Sinner', flag: '🇮🇹', style: 'Flat, early power',
      racquet: 'Head Speed (pro stock)',
      mains: 'Head Hawk Touch', crosses: 'Same as mains',
      tension: 'Very high — around 64 lbs (29 kg) reported',
      notes: 'One of the tightest string beds on tour for maximum control on huge cuts. Club players should not copy this tension.',
      prefill: { brand: 'Head', model: 'Hawk Touch', gauge: '17g', type: 'Polyester' }
    },
    {
      id: 'djokovic', name: 'Novak Djokovic', flag: '🇷🇸', style: 'Precision baseline',
      racquet: 'Head Speed Pro (custom PT113B)',
      mains: 'Babolat VS natural gut 17 (1.25)', crosses: 'Luxilon ALU Power Rough 16L (1.25)',
      tension: '~59 lbs mains / 56 lbs crosses (27–28 / 26–27 kg)',
      notes: 'Same orientation as Federer: gut mains for feel and tension stability, textured poly crosses for spin and control. Strung on a customized PT113B under Speed paint.',
      prefill: { brand: 'Babolat', model: 'VS Touch', gauge: '17g', type: 'Natural Gut' },
      prefillCrosses: { brand: 'Luxilon', model: 'ALU Power Rough', gauge: '16L', type: 'Polyester' }
    },
    {
      id: 'swiatek', name: 'Iga Swiatek', flag: '🇵🇱', style: 'Heavy topspin, first-strike',
      racquet: 'Tecnifibre Tempo 298 IGA',
      mains: 'Tecnifibre Razor Code 17 (1.25)', crosses: 'Same as mains',
      tension: '~52–53 lbs (24 kg)',
      notes: 'A crisp, control-oriented poly at a moderate tension. One of the more copyable pro setups.',
      prefill: { brand: 'Tecnifibre', model: 'Razor Code', gauge: '17g', type: 'Polyester' }
    },
    {
      id: 'gauff', name: 'Coco Gauff', flag: '🇺🇸', style: 'Defense to offense, athletic',
      racquet: 'Head Boom MP (pro stock Speed mold)',
      mains: 'Luxilon ALU Power 16L (1.25)', crosses: 'Same as mains',
      tension: '~53 lbs (24 kg)',
      notes: 'The most played poly in pro tennis at a middle-of-the-road tension.',
      prefill: { brand: 'Luxilon', model: 'ALU Power', gauge: '16L', type: 'Polyester' }
    },
    {
      id: 'medvedev', name: 'Daniil Medvedev', flag: '🇷🇺', style: 'Deep, flat counterpunching',
      racquet: 'Tecnifibre TFight 305S',
      mains: 'Natural gut', crosses: 'Tecnifibre Razor Soft',
      tension: 'Reference ~48–49 lbs, adjusted match to match',
      notes: 'Recent seasons: gut mains over Razor Soft crosses, after years of full-bed Razor Code. Famous for tweaking tension constantly, with one of the lower reference tensions on tour.'
    },
    {
      id: 'tsitsipas', name: 'Stefanos Tsitsipas', flag: '🇬🇷', style: 'Aggressive one-hander',
      racquet: 'Babolat Pure Aero 98 (2026; Wilson Blade 98 18x20 before)',
      mains: 'Luxilon 4G 16L (Wilson era)', crosses: 'Same as mains',
      tension: '~53 lbs (24 kg), conditions-dependent',
      notes: 'Switched to the Pure Aero 98 for 2026 chasing more forgiveness; his string in the new frame isn’t reliably reported yet. In the Wilson years he ran full-bed 4G, with natural gut crosses for a stretch after his 2021 elbow surgery.',
      prefill: { brand: 'Luxilon', model: '4G', gauge: '16L', type: 'Polyester' }
    },
    {
      id: 'kyrgios', name: 'Nick Kyrgios', flag: '🇦🇺', style: 'Serve-first shotmaking',
      racquet: 'Yonex EZONE 98',
      mains: 'Yonex Poly Tour Pro (pro spec, reported 1.20)', crosses: 'Same as mains',
      tension: '~55 lbs',
      notes: 'A softer poly that pairs with the forgiving EZONE for easy power on serve. His is reportedly a pro-exclusive, slightly softer spec of the retail string.',
      prefill: { brand: 'Yonex', model: 'Poly Tour Pro', gauge: '16L', type: 'Polyester' }
    },
    {
      id: 'osaka', name: 'Naomi Osaka', flag: '🇯🇵', style: 'First-strike power',
      racquet: 'Yonex EZONE 98',
      mains: 'Yonex Poly Tour Strike 16L (1.25)', crosses: 'Babolat VS Touch natural gut 16',
      tension: '59 lbs mains / 56 lbs crosses',
      notes: 'Poly mains with natural gut crosses, the same inverted orientation Murray made famous: control off the mains, comfort and pop from the gut.',
      prefill: { brand: 'Yonex', model: 'Poly Tour Strike', gauge: '16L', type: 'Polyester' },
      prefillCrosses: { brand: 'Babolat', model: 'VS Touch', gauge: '16g', type: 'Natural Gut' }
    },
    {
      id: 'nadal', name: 'Rafael Nadal', flag: '🇪🇸', legend: true, style: 'Extreme topspin',
      racquet: 'Babolat Pure Aero (pro stock AeroPro Drive under the paint)',
      mains: 'Babolat RPM Blast 15L (1.35); 16 (1.30) from 2022', crosses: 'Same as mains',
      tension: '55 lbs (25 kg), famously consistent',
      notes: 'The heaviest topspin in history, strung full bed at 55 lbs both ways for virtually his whole career. He moved from the thick 1.35 gauge to 1.30 in his final seasons.',
      prefill: { brand: 'Babolat', model: 'RPM Blast', gauge: '15L', type: 'Polyester' }
    },
    {
      id: 'federer', name: 'Roger Federer', flag: '🇨🇭', legend: true, style: 'All-court artistry',
      racquet: 'Wilson Pro Staff RF97 Autograph',
      mains: 'Wilson Natural Gut 16 (1.30)', crosses: 'Luxilon ALU Power Rough 16L (1.25)',
      tension: '~57 lbs mains / 54 lbs crosses (26 / 24.5 kg), pre-stretched',
      notes: 'The hybrid that defined an era, sold retail as Wilson Champion’s Choice. Gut mains give feel and pop; rough poly crosses add spin. His team pre-stretched the gut and kept tension within about a kilogram all season.',
      prefill: { brand: 'Wilson', model: 'Natural Gut', gauge: '16g', type: 'Natural Gut' },
      prefillCrosses: { brand: 'Luxilon', model: 'ALU Power Rough', gauge: '16L', type: 'Polyester' }
    },
    {
      id: 'serena', name: 'Serena Williams', flag: '🇺🇸', legend: true, style: 'Overwhelming power',
      racquet: 'Wilson Blade SW102 Autograph',
      mains: 'Wilson Natural Gut 16', crosses: 'Luxilon 4G 16L (1.25)',
      tension: '~65 lbs mains / 64 lbs crosses, among the tightest on tour',
      notes: 'Gut mains with 4G crosses, strung very tight to keep her enormous power inside the lines. Her setup since 2012.',
      prefill: { brand: 'Wilson', model: 'Natural Gut', gauge: '16g', type: 'Natural Gut' },
      prefillCrosses: { brand: 'Luxilon', model: '4G', gauge: '16L', type: 'Polyester' }
    },
    {
      id: 'murray', name: 'Andy Murray', flag: '🇬🇧', legend: true, style: 'Elite counterpuncher',
      racquet: 'Head Radical Pro (custom PT57A2)',
      mains: 'Luxilon ALU Power', crosses: 'Babolat VS natural gut',
      tension: '~60–62 lbs, varied through the season',
      notes: 'The famous inverted hybrid: poly mains with gut crosses, the reverse of Federer and Djokovic. He only swapped the gut into his mains for his final season in 2024.',
      prefill: { brand: 'Luxilon', model: 'ALU Power', gauge: '16L', type: 'Polyester' },
      prefillCrosses: { brand: 'Babolat', model: 'VS Touch', gauge: '16g', type: 'Natural Gut' }
    }
  ];

  // ---------------- recommendation engine ----------------
  var GOALS = [
    { value: 'spin', label: 'Spin' },
    { value: 'power', label: 'Power' },
    { value: 'control', label: 'Control' },
    { value: 'comfort', label: 'Comfort' },
    { value: 'durability', label: 'Durability' },
    { value: 'feel', label: 'Touch & Feel' }
  ];

  // Baseline attribute scores by string type (0–3 scale).
  var BASE = {
    'Polyester':     { spin: 1.5, control: 2.0, durability: 2.0, power: 0.5, comfort: 0.2, feel: 0.5 },
    'Multifilament': { spin: 0.4, control: 0.6, durability: 0.6, power: 2.0, comfort: 2.5, feel: 1.6 },
    'Natural Gut':   { spin: 0.4, control: 1.0, durability: 1.0, power: 3.0, comfort: 3.0, feel: 3.0 },
    'Synthetic Gut': { spin: 0.4, control: 1.0, durability: 1.0, power: 1.2, comfort: 1.2, feel: 1.0 },
    'Hybrid':        { spin: 1.2, control: 1.4, durability: 1.2, power: 1.6, comfort: 1.6, feel: 1.8 },
    'Kevlar':        { spin: 0.5, control: 2.0, durability: 3.0, power: 0.2, comfort: 0.0, feel: 0.3 }
  };

  // Additive per-string adjustments on top of the type baseline (id -> partial attrs).
  var MOD = {
    babolat_rpm_blast_125: { spin: 1.5 }, babolat_rpm_blast_130: { spin: 1.5 },
    babolat_rpm_blast_rough_125: { spin: 2.0 },
    babolat_rpm_power_125: { spin: 1.0, power: 1.0 },
    babolat_rpm_soft_125: { spin: 0.8, comfort: 1.2 },
    babolat_pro_hurricane_tour_125: { spin: 1.2 },
    luxilon_alu_power_125: { control: 1.0, feel: 1.0 },
    luxilon_alu_power_rough_125: { spin: 1.5, feel: 0.5 },
    luxilon_alu_power_soft_125: { comfort: 1.2, feel: 0.5 },
    luxilon_4g_125: { control: 1.5, durability: 1.0 },
    luxilon_big_banger_original_130: { control: 1.0 },
    luxilon_element_125: { comfort: 1.3, feel: 1.0 },
    luxilon_adrenaline_125: { control: 0.8, feel: 0.5 },
    wilson_revolve_125: { spin: 1.0 },
    wilson_nxt_130: { power: 1.0 }, wilson_nxt_125: { power: 1.0, feel: 0.3 },
    wilson_sensation_130: { comfort: 0.5 },
    wilson_champions_choice: { feel: 1.2, power: 0.6, spin: 0.5 },
    head_lynx_tour_125: { control: 1.0, comfort: 0.8 },
    head_hawk_125: { control: 0.8 },
    head_hawk_touch_125: { control: 1.0, comfort: 1.0 },
    head_velocity_mlt_130: { power: 0.8, comfort: 0.5 },
    head_rip_control_130: { control: 1.0 },
    yonex_poly_tour_pro_125: { comfort: 1.0, control: 0.5 }, yonex_poly_tour_pro_130: { comfort: 1.0, control: 0.5 },
    yonex_poly_tour_strike_125: { control: 1.2 },
    yonex_poly_tour_rev_125: { spin: 1.5 }, yonex_poly_tour_spin_125: { spin: 1.5 },
    yonex_poly_tour_fire_125: { spin: 1.0, power: 0.8 },
    yonex_rexis_130: { feel: 1.0, comfort: 0.5 },
    tecnifibre_razor_code_125: { control: 1.2 },
    tecnifibre_black_code_128: { control: 1.0, spin: 0.8, durability: 0.5 },
    tecnifibre_x_one_biphase_130: { power: 1.5, feel: 1.0 },
    tecnifibre_nrg2_124: { feel: 1.5, comfort: 0.5 },
    tecnifibre_triax_128: { comfort: 1.2, control: 0.5 },
    tecnifibre_ice_code_130: { control: 1.0 },
    solinco_hyper_g_125: { spin: 1.5 }, solinco_hyper_g_120: { spin: 1.7 },
    solinco_hyper_g_soft_125: { spin: 1.3, comfort: 1.2 },
    solinco_tour_bite_125: { spin: 2.0 },
    solinco_tour_bite_soft_125: { spin: 1.5, comfort: 1.0 },
    solinco_confidential_125: { control: 1.2, comfort: 0.8 },
    kirschbaum_pro_line_evolution_125: { spin: 1.0 },
    kirschbaum_pro_line_ii_125: { control: 1.0, durability: 0.5 },
    kirschbaum_spiky_shark_125: { spin: 1.5 },
    kirschbaum_touch_turbo_125: { power: 0.8, comfort: 0.8 },
    prince_pro_blend_125: { durability: 1.0 },
    volkl_cyclone_125: { spin: 1.3 }, volkl_cyclone_130: { spin: 1.3, durability: 0.4 },
    volkl_cyclone_tour_125: { spin: 1.0, control: 0.5 },
    volkl_v_star_125: { comfort: 1.0, control: 0.5 },
    volkl_power_fiber_ii_125: { power: 1.0, comfort: 0.5 },
    gamma_moto_125: { spin: 1.2 },
    gamma_live_wire_132: { power: 1.3, comfort: 0.8 },
    gamma_tnt2_130: { comfort: 0.5 },
    signum_pro_poly_plasma_123: { spin: 0.8, control: 0.8 },
    signum_pro_hyperion_124: { spin: 1.2 },
    signum_pro_tornado_124: { spin: 1.5 },
    pacific_x_force_125: { spin: 1.0 }
  };

  // Polys gentle enough to recommend to arm-sensitive players (everything else
  // poly/kevlar is excluded when the elbow flag is on).
  var SOFT_POLY = {
    babolat_rpm_soft_125: true, luxilon_alu_power_soft_125: true, luxilon_element_125: true,
    solinco_hyper_g_soft_125: true, solinco_tour_bite_soft_125: true, solinco_confidential_125: true,
    head_lynx_tour_125: true, head_hawk_touch_125: true,
    yonex_poly_tour_pro_125: true, yonex_poly_tour_pro_130: true,
    kirschbaum_touch_turbo_125: true, volkl_v_star_125: true
  };

  // Budget-friendly picks.
  var VALUE = {
    babolat_synthetic_gut_130: true, wilson_synthetic_gut_power_130: true,
    head_synthetic_gut_pps_130: true, prince_synthetic_gut_duraflex_130: true,
    gamma_synthetic_gut_wearguard_130: true, gamma_tnt2_130: true,
    head_velocity_mlt_130: true, volkl_cyclone_125: true, volkl_cyclone_130: true
  };

  function attrsFor(s) {
    var base = BASE[s.type] || { spin: 0.5, control: 1, durability: 1, power: 1, comfort: 1, feel: 1 };
    var mod = MOD[s.id] || {};
    var a = {};
    ['spin', 'power', 'control', 'comfort', 'durability', 'feel'].forEach(function (k) {
      a[k] = (base[k] || 0) + (mod[k] || 0);
    });
    var g = Number(s.gauge_mm);
    if (g >= 1.30) a.durability += 0.4;
    if (g > 0 && g <= 1.25) a.spin += 0.2;
    if (g > 0 && g <= 1.20) { a.spin += 0.2; a.durability -= 0.5; }
    return a;
  }

  function armSafe(s) {
    if (s.type === 'Kevlar') return false;
    if (s.type === 'Polyester') return !!SOFT_POLY[s.id];
    return true; // gut, multis, syn gut, packaged hybrids
  }

  /* prefs: { goal, secondary ('' for none), elbow, breaker, value }; racquet optional,
     used to turn tension advice into concrete numbers from its recommended range. */
  function recommend(catalog, prefs, racquet) {
    var scored = [];
    (catalog || []).forEach(function (s) {
      if (!s || !s.brand || !s.model) return;
      if (prefs.elbow && !armSafe(s)) return;
      var a = attrsFor(s);
      var score = 3 * (a[prefs.goal] || 0);
      if (prefs.secondary) score += 1.5 * (a[prefs.secondary] || 0);
      if (prefs.breaker) score += 1.5 * a.durability;
      if (prefs.elbow) score += 1.2 * a.comfort;
      if (prefs.value) {
        if (VALUE[s.id]) score += 2;
        if (s.type === 'Natural Gut') score -= 4;
      }
      scored.push({ s: s, score: score, attrs: a });
    });

    // one entry per brand+model: prefer the gauge that suits the goal
    var byModel = {};
    scored.forEach(function (x) {
      var key = (x.s.brand + '|' + x.s.model).toLowerCase();
      var cur = byModel[key];
      if (!cur) { byModel[key] = x; return; }
      var wantThick = prefs.breaker || prefs.goal === 'durability';
      var wantThin = prefs.goal === 'spin' || prefs.goal === 'feel';
      var better;
      if (wantThick) better = Number(x.s.gauge_mm) > Number(cur.s.gauge_mm);
      else if (wantThin) better = Number(x.s.gauge_mm) < Number(cur.s.gauge_mm);
      else better = x.score > cur.score;
      if (better) byModel[key] = x;
    });

    var top = Object.keys(byModel).map(function (k) { return byModel[k]; })
      .sort(function (a, b) { return b.score - a.score; })
      .slice(0, 4)
      .map(function (x) {
        return {
          id: x.s.id, brand: x.s.brand, model: x.s.model,
          gauge_label: x.s.gauge_label || '', type: x.s.type || '',
          custom: !!x.s.custom,
          why: whyText(x.s, x.attrs, prefs)
        };
      });

    return { picks: top, tension: tensionAdvice(prefs, racquet), hybrid: hybridSuggestion(prefs) };
  }

  function whyText(s, a, prefs) {
    var bits = [];
    if (s.recommended_for) bits.push(s.recommended_for);
    if (prefs.elbow && s.type === 'Polyester') bits.push('one of the softer polys');
    if (prefs.elbow && (s.type === 'Multifilament' || s.type === 'Natural Gut')) bits.push('very arm-friendly');
    if (prefs.breaker && a.durability >= 2.2) bits.push('holds up for string breakers');
    if (prefs.value && VALUE[s.id]) bits.push('great value');
    return bits.join(' · ') || s.type;
  }

  /* Tension guidance in lbs (callers convert for display). Returns { line, extra }. */
  function tensionAdvice(prefs, racquet) {
    var min = racquet && racquet.recommended_tension_min;
    var max = racquet && racquet.recommended_tension_max;
    var mid = (min && max) ? Math.round((min + max) / 2) : null;
    var out = { targetLbs: null, line: '', extra: '' };
    if (prefs.goal === 'control') {
      out.targetLbs = mid ? Math.min(mid + 3, max) : null;
      out.line = mid ? 'Try the upper part of your racquet’s range.' : 'String toward the upper end of your racquet’s recommended range.';
    } else if (prefs.goal === 'spin' || prefs.goal === 'power') {
      out.targetLbs = mid ? Math.max(mid - 3, min) : null;
      out.line = 'String a few pounds below the middle of the range: looser beds give more launch and bite.';
    } else if (prefs.goal === 'comfort' || prefs.elbow) {
      out.targetLbs = min || null;
      out.line = 'String at the low end of the range: lower tension is measurably easier on the arm.';
    } else {
      out.targetLbs = mid;
      out.line = 'The middle of your racquet’s recommended range is the right starting point.';
    }
    if (prefs.elbow) {
      out.extra = 'With a sensitive arm, restring before poly goes dead (15–20 hours): old poly is harsher than fresh, and avoid stiff full-poly beds entirely.';
    }
    return out;
  }

  function hybridSuggestion(prefs) {
    var wantsSpin = prefs.goal === 'spin' || prefs.secondary === 'spin';
    if (prefs.elbow && wantsSpin) {
      return {
        title: 'Arm-friendly spin hybrid',
        mains: 'Head Velocity MLT 16 (multifilament)',
        crosses: 'Solinco Hyper-G Soft 16L (soft shaped poly)',
        why: 'Soft multi in the mains protects the arm; a shaped soft poly in the crosses keeps real spin. The best of both when full poly is off the table.',
        prefill: { brand: 'Head', model: 'Velocity MLT', gauge: '16g', type: 'Multifilament' },
        prefillCrosses: { brand: 'Solinco', model: 'Hyper-G Soft', gauge: '16L', type: 'Polyester' }
      };
    }
    if ((prefs.goal === 'feel' || prefs.goal === 'power') && !prefs.value) {
      return {
        title: 'The classic gut hybrid',
        mains: 'Natural gut 16 (e.g. Babolat VS Touch)',
        crosses: 'Luxilon ALU Power Rough 16L',
        why: 'The Federer/Djokovic pattern: gut mains for feel, pop, and tension stability; textured poly crosses for spin and control.',
        prefill: { brand: 'Babolat', model: 'VS Touch', gauge: '16g', type: 'Natural Gut' },
        prefillCrosses: { brand: 'Luxilon', model: 'ALU Power Rough', gauge: '16L', type: 'Polyester' }
      };
    }
    if (prefs.breaker && (prefs.goal === 'durability' || prefs.goal === 'control') && !prefs.elbow) {
      return {
        title: 'Maximum durability hybrid',
        mains: 'Prince Pro Blend (Kevlar) mains',
        crosses: 'Synthetic gut 16 crosses',
        why: 'The old-school answer for chronic string breakers. Stiff: only for healthy arms.',
        prefill: { brand: 'Prince', model: 'Pro Blend (Kevlar Hybrid)', gauge: '16g', type: 'Kevlar' }
      };
    }
    return null;
  }

  SL.advisor = { PRO_SETUPS: PRO_SETUPS, GOALS: GOALS, recommend: recommend, tensionAdvice: tensionAdvice, armSafe: armSafe };
})();

/**
 * Harmonopoly · Goldilocks nested agents (EGS φ)
 *
 * Depth: just right — outer Table Master + 3 inner stewards (not a flat swarm).
 * Parent: SynthOBS → Harmonopoly.TableMaster
 * Scale: Parent span = φ · child span; max children = round(φ + 1) = 3
 * Micro-snapshots: idle children freeze to a tiny metadata footprint (scale-to-zero).
 *
 * Plain speak: helpers nest inside each other. Only the one you need wakes up.
 */
(function (global) {
  'use strict';

  var PHI = 1.618033988749895;
  /** Goldilocks leaf count: not 1 (too thin), not N² peers — three doors / three jobs. */
  var MAX_CHILDREN = Math.round(PHI + 1); // 3
  /** Nest depth under SynthOBS for this game: outer + one inner layer only. */
  var MAX_DEPTH = 2;

  var SECTOR_ROLES = ['Surge', 'Ground', 'Bridge', 'Whisper', 'Yield', 'Overload'];
  var N = 12;

  function roleBias(roleId) {
    if (roleId === 'acoustic') return 2;
    if (roleId === 'prompter') return -3;
    return 0;
  }

  function microSnapshot(id, payload) {
    return {
      id: id,
      frozenAt: new Date().toISOString(),
      bytesHint: JSON.stringify(payload || {}).length,
      state: payload || null,
      status: 'frozen'
    };
  }

  /**
   * Blueprint (immutable geometry) vs Interface (live work).
   * Children never talk peer-to-peer — only through the parent (firewall).
   */
  function createNest(hooks) {
    hooks = hooks || {};

    var children = {
      solar: {
        id: 'Harmonopoly.SolarOracle',
        plainName: 'Sun helper',
        job: 'Check the Sun · pick the zone',
        status: 'frozen',
        snap: null
      },
      fairTrade: {
        id: 'Harmonopoly.FairTrade',
        plainName: 'Fair-trade helper',
        job: 'Just-right zones · chips · tips',
        status: 'frozen',
        snap: null
      },
      surge: {
        id: 'Harmonopoly.SurgeGround',
        plainName: 'Surge helper',
        job: 'Big solar surges · honor reset',
        status: 'frozen',
        snap: null
      }
    };

    var keys = Object.keys(children);
    if (keys.length > MAX_CHILDREN) {
      throw new Error('Goldilocks gate: too many nested agents');
    }

    function wake(key) {
      var c = children[key];
      if (!c) return null;
      keys.forEach(function (k) {
        if (k !== key && children[k].status === 'awake') freeze(k);
      });
      c.status = 'awake';
      c.snap = null;
      if (hooks.onNestChange) hooks.onNestChange(inspect());
      return c;
    }

    function freeze(key) {
      var c = children[key];
      if (!c) return;
      c.snap = microSnapshot(c.id, { lastJob: c.job });
      c.status = 'frozen';
      if (hooks.onNestChange) hooks.onNestChange(inspect());
    }

    function freezeAll() {
      keys.forEach(freeze);
    }

    function inspect() {
      return {
        phi: PHI,
        maxChildren: MAX_CHILDREN,
        maxDepth: MAX_DEPTH,
        outer: {
          id: 'Harmonopoly.TableMaster',
          plainName: 'Table master',
          job: 'Watches the whole table · wakes only the helper you need',
          parent: 'SynthOBS.autonomous.agent',
          scale: PHI
        },
        children: keys.map(function (k) {
          var c = children[k];
          return {
            key: k,
            id: c.id,
            plainName: c.plainName,
            job: c.job,
            status: c.status,
            snapBytes: c.snap ? c.snap.bytesHint : 0
          };
        }),
        topology: 'nested',
        flatPeerLinks: 0,
        honesty:
          'Nested helpers on this device. No flat agent chat storm. Only public sun data leaves the phone.'
      };
    }

    /**
     * Goldilocks event deck — sun numbers + timestamp pick one card.
     * Not too harsh, not too free: weights shift with storm intensity.
     */
    var REWARD_DECK = [
      { id: 'chip_breeze', plain: 'Solar breeze — pocket a few energy chips.', chips: 2 },
      { id: 'chip_gift', plain: 'Quiet corona gift — extra chips for the table helper.', chips: 3 },
      { id: 'cheap_light', plain: 'Soft light window — adding your resonance costs less focus.', calibrateDiscount: 1 },
      { id: 'cheaper_light', plain: 'Golden slit — attuning is much cheaper.', calibrateDiscount: 2 },
      { id: 'home_yield', plain: 'Shared-field gift — resonant harvests pay a little more.', yieldBonus: 2 },
      { id: 'tip_kind', plain: 'Kind flux — fair trades suggest a bigger tip-back.', tipSuggest: 2 },
      { id: 'root_warm', plain: 'Ground warmth — Root rises (you feel steadier).', rootDelta: 1 },
      { id: 'crown_clear', plain: 'Clear crown air — Crown rises (ideas land easier).', crownDelta: 1 },
      { id: 'double_soft', plain: 'Twin gift — chips plus cheaper attune focus.', chips: 1, calibrateDiscount: 1 },
      { id: 'valet_boost', plain: 'Valet luck — score a free honor exchange credit.', exchangeBonus: 1 }
    ];

    var CHALLENGE_DECK = [
      { id: 'chip_toll', plain: 'Sun tax — pay a small chip toll or pause.', chips: -2, canRefusePause: true },
      { id: 'chip_toll_hard', plain: 'Heavy toll — pay more chips or pause.', chips: -3, canRefusePause: true },
      { id: 'pricey_light', plain: 'Hazy sector — attuning costs extra focus.', calibrateSurcharge: 1 },
      { id: 'pricey_light_2', plain: 'Thick wind — attuning costs two more focus chips.', calibrateSurcharge: 2 },
      { id: 'thin_yield', plain: 'Thin return — shared harvests pay less this turn.', yieldBonus: -1 },
      { id: 'ground_nudge', plain: 'Micro-surge — ground a little energy or pause.', groundCost: 2, requiresGround: true },
      { id: 'ground_firm', plain: 'Anchor ask — ground firmly or pause.', groundCost: 3, requiresGround: true },
      { id: 'crown_static', plain: 'Static in the crown — Crown dips until you reset next honor.', crownDelta: -1 },
      { id: 'root_slip', plain: 'Slippery root — Root dips; stay kind in trades.', rootDelta: -1 },
      { id: 'trade_steep', plain: 'Steep trade wind — table fair trades cost one more chip.', offerSurcharge: 1 }
    ];

    function hashSeed(parts) {
      var s = 0;
      for (var i = 0; i < parts.length; i++) {
        var x = Number(parts[i]);
        if (!Number.isFinite(x)) x = String(parts[i]).length * 17;
        s = (s * 33 + Math.floor(x * 1000)) >>> 0;
      }
      return s;
    }

    function pickSolarEvent(ctx) {
      var ts = Date.parse(ctx.fetchedAt) || Date.now();
      var minuteOfDay = Math.floor((ts % 86400000) / 60000);
      var regionKey =
        (ctx.regions && ctx.regions[0] && ctx.regions[0].id) || 'none';
      var seed = hashSeed([
        ctx.ssn,
        ctx.stress,
        ctx.hsi,
        ctx.land,
        ctx.turnIndex,
        minuteOfDay,
        ts % 1000,
        regionKey
      ]);
      var roll = seed % 100;

      /** Goldilocks weights by intensity: calm → more gifts; storm → more asks. */
      var intensity = ctx.intensity || 0;
      var rewardChance = Math.round(58 - intensity * 32); // ~58% calm → ~26% storm
      var challengeChance = Math.round(28 + intensity * 36); // ~28% → ~64%
      if (rewardChance + challengeChance > 92) {
        challengeChance = 92 - rewardChance;
      }

      var kind;
      if (roll < rewardChance) kind = 'reward';
      else if (roll < rewardChance + challengeChance) kind = 'challenge';
      else kind = 'neutral';

      if (kind === 'neutral') {
        return {
          kind: 'neutral',
          id: 'steady_hum',
          plain: 'Steady hum — no extra gift or ask. Just play the land.',
          seed: seed,
          roll: roll,
          minuteOfDay: minuteOfDay
        };
      }

      var deck = kind === 'reward' ? REWARD_DECK : CHALLENGE_DECK;
      var idx = seed % deck.length;
      /** Second mix from timestamp seconds so same SSN still varies within the hour. */
      var idx2 = (seed + Math.floor((ts % 60000) / 1000)) % deck.length;
      var card = deck[intensity > 0.55 ? idx2 : idx];
      var out = {
        kind: kind,
        id: card.id,
        plain: card.plain,
        seed: seed,
        roll: roll,
        minuteOfDay: minuteOfDay,
        mappedFrom: {
          ssn: ctx.ssn,
          hsi: Math.round(ctx.hsi * 1000) / 1000,
          stress: Math.round(ctx.stress * 1000) / 1000,
          issuedAt: ctx.fetchedAt,
          land: ctx.land,
          turnIndex: ctx.turnIndex
        }
      };
      [
        'chips',
        'calibrateDiscount',
        'calibrateSurcharge',
        'yieldBonus',
        'tipSuggest',
        'rootDelta',
        'crownDelta',
        'exchangeBonus',
        'groundCost',
        'requiresGround',
        'canRefusePause',
        'offerSurcharge'
      ].forEach(function (k) {
        if (card[k] !== undefined) out[k] = card[k];
      });
      return out;
    }

    /** Inner: map live solar payload → land + beat + reward/challenge card */
    function runSolarOracle(payload, player, turnIndex) {
      wake('solar');
      var ssn =
        Number(
          payload.telemetry &&
            payload.telemetry.sunspot &&
            payload.telemetry.sunspot.sunspotNumber
        ) || 133;
      var mod = payload.modulation || {};
      var area = Number(mod.areaSumMuHem) || 0;
      var stress = Number(mod.stressFactor) || 1;
      var hsi = Number(payload.holographicStabilityIndex);
      if (!Number.isFinite(hsi)) hsi = 0.7;
      var regions =
        (payload.telemetry && payload.telemetry.activeRegions) || [];
      var bias = roleBias(player.roleId);
      var base = Math.floor(ssn * PHI + area / PHI + stress * 10) % N;
      if (base < 0) base += N;
      var land = (base + bias + turnIndex) % N;
      if (land < 0) land += N;

      var beat = 'flux';
      var beatLabel = 'Soft drift';
      var beta = Number(mod.betaGammaNodes) || 0;

      /**
       * Goldilocks beat map — solar sets the weather, turn/land mix the lane.
       * Old rule (stress > 1.35 OR beta >= 2) fired surge almost every live fetch
       * because NOAA stressFactor routinely sits ~1.4–1.6 even on calm days.
       */
      var stressNorm = Math.max(0, Math.min(1, (stress - 1) / 1.2));
      var hsiStorm = Math.max(0, Math.min(1, (0.75 - hsi) / 0.75));
      var betaNorm = Math.max(0, Math.min(1, beta / 5));
      var intensity = hsiStorm * 0.4 + stressNorm * 0.35 + betaNorm * 0.25;
      var mix = ((turnIndex * PHI) + land * 0.17 + ssn * 0.01) % 1;
      if (mix < 0) mix += 1;
      var lane = intensity * 0.55 + mix * 0.45;

      if (lane >= 0.82 || (intensity >= 0.72 && mix >= 0.55)) {
        beat = 'flare';
        beatLabel = 'Big solar surge';
      } else if (lane >= 0.38 && lane < 0.68) {
        beat = 'goldilocks';
        beatLabel = 'Just-right window';
      } else if (regions.length && lane >= 0.22) {
        beat = 'bound';
        beatLabel = 'Bound to a live sunspot';
      } else {
        beat = 'flux';
        beatLabel = 'Soft drift';
      }

      var src =
        (payload.telemetry &&
          payload.telemetry.sunspot &&
          payload.telemetry.sunspot.source) ||
        '';
      var fallback =
        /canonical/i.test(src) ||
        /canonical/i.test(
          (payload.telemetry && payload.telemetry.activeRegionsSource) || ''
        );

      var fetchedAt = payload.issuedAt || new Date().toISOString();
      var event = pickSolarEvent({
        ssn: ssn,
        stress: stress,
        hsi: hsi,
        land: land,
        turnIndex: turnIndex,
        intensity: intensity,
        fetchedAt: fetchedAt,
        regions: regions
      });

      /** Flare beat still maps to a firm ground challenge if the card was soft. */
      if (beat === 'flare' && !event.requiresGround) {
        event = Object.assign({}, event, {
          kind: 'challenge',
          id: 'flare_' + event.id,
          plain:
            'Big solar surge overlay — ' +
            event.plain +
            ' Ground the surge to stay in play.',
          requiresGround: true,
          groundCost: event.groundCost || 3,
          canRefusePause: true
        });
      }

      var result = {
        fetchedAt: fetchedAt,
        source: src || 'wavefield',
        ssn: ssn,
        hsi: hsi,
        stress: stress,
        intensity: Math.round(intensity * 1000) / 1000,
        landSector: land,
        beat: beat,
        beatLabel: beatLabel,
        event: event,
        regions: regions.slice(0, 4).map(function (r) {
          return {
            id: r.id,
            classification: r.classification,
            areaMuHem: r.areaMuHem
          };
        }),
        fallback: fallback,
        agent: children.solar.id
      };
      freeze('solar');
      return result;
    }

    /** Inner: resonance attune / shared harvest / table fair trade */
    function runFairTrade(kind, opts) {
      opts = opts || {};
      wake('fairTrade');
      var out = { agent: children.fairTrade.id, kind: kind };
      var ev = opts.event || {};
      if (kind === 'calibrateCost' || kind === 'attuneCost') {
        /** Focus cost to add your resonance — not a solo buy of the zone. */
        var base = opts.beat === 'goldilocks' ? 1 : 2;
        base -= Number(ev.calibrateDiscount) || 0;
        base += Number(ev.calibrateSurcharge) || 0;
        out.cost = Math.max(0, base);
        out.plain = 'Add your resonance to this section';
      } else if (kind === 'offer') {
        var offer = opts.beat === 'bound' ? 3 : 2;
        offer += Number(ev.offerSurcharge) || 0;
        out.offer = Math.max(1, offer);
        out.tipSuggest = Number(ev.tipSuggest) || 1;
        out.plain = 'Offer into the shared just-right field';
      } else if (kind === 'ownYield' || kind === 'resonanceHarvest') {
        var y = 1 + (Number(ev.yieldBonus) || 0);
        out.yieldAmt = Math.max(0, y);
        out.tableBonus = 1;
        out.plain = 'Shared harvest — you and the table both gain';
      } else if (kind === 'bloom') {
        out.bloomEach = 2;
        out.plain = 'Full resonance bloom — every player gains chips';
      }
      freeze('fairTrade');
      return out;
    }

    /** Inner: surge ground cost / pause */
    function runSurge(kind, opts) {
      opts = opts || {};
      wake('surge');
      var ev = opts.event || {};
      var cost = Number(ev.groundCost) || 3;
      var out = {
        agent: children.surge.id,
        kind: kind,
        groundCost: cost,
        plain:
          kind === 'ground'
            ? 'Spend chips to ground the surge'
            : 'Pause until you help as valet'
      };
      freeze('surge');
      return out;
    }

    return {
      PHI: PHI,
      MAX_CHILDREN: MAX_CHILDREN,
      MAX_DEPTH: MAX_DEPTH,
      N: N,
      sectorRole: function (i) {
        return SECTOR_ROLES[i % SECTOR_ROLES.length];
      },
      inspect: inspect,
      wake: wake,
      freeze: freeze,
      freezeAll: freezeAll,
      runSolarOracle: runSolarOracle,
      runFairTrade: runFairTrade,
      runSurge: runSurge,
      fallbackPayload: function () {
        return {
          issuedAt: new Date().toISOString(),
          holographicStabilityIndex: 0.72,
          modulation: {
            stressFactor: 1.12,
            areaSumMuHem: 800,
            betaGammaNodes: 1
          },
          telemetry: {
            sunspot: {
              sunspotNumber: 133,
              source: 'canonical snapshot SYN-SUN-2026-REV7'
            },
            activeRegions: [
              { id: 'AR14446', classification: 'beta-gamma', areaMuHem: 300 },
              { id: 'AR14455', classification: 'beta', areaMuHem: 380 }
            ],
            activeRegionsSource: 'canonical snapshot SYN-SUN-2026-REV7'
          }
        };
      }
    };
  }

  global.HarmonopolyNest = {
    PHI: PHI,
    MAX_CHILDREN: MAX_CHILDREN,
    MAX_DEPTH: MAX_DEPTH,
    createNest: createNest,
    blueprint: {
      title: 'Harmonopoly Goldilocks nest',
      parent: 'SynthOBS.autonomous.agent',
      outer: 'Harmonopoly.TableMaster',
      children: [
        'Harmonopoly.SolarOracle',
        'Harmonopoly.FairTrade',
        'Harmonopoly.SurgeGround'
      ],
      scaleLaw: 'Scale_parent = φ · Scale_child',
      plainSpeak:
        'One table boss. Three helpers. Only one helper awake at a time. The rest sleep tiny.'
    }
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);

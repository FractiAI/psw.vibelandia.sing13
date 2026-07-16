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

    /** Inner: map live solar payload → land + beat */
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
      if (hsi < 0.55 || stress > 1.35 || beta >= 2) {
        beat = 'flare';
        beatLabel = 'Big solar surge';
      } else if (hsi >= 0.55 && hsi <= 0.85 && stress < 1.25) {
        beat = 'goldilocks';
        beatLabel = 'Just-right window';
      } else if (regions.length) {
        beat = 'bound';
        beatLabel = 'Bound to a live sunspot';
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

      var result = {
        fetchedAt: payload.issuedAt || new Date().toISOString(),
        source: src || 'wavefield',
        ssn: ssn,
        hsi: hsi,
        stress: stress,
        landSector: land,
        beat: beat,
        beatLabel: beatLabel,
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

    /** Inner: empty zone / own zone / fair trade offers */
    function runFairTrade(kind, opts) {
      wake('fairTrade');
      var out = { agent: children.fairTrade.id, kind: kind };
      if (kind === 'calibrateCost') {
        out.cost = opts.beat === 'goldilocks' ? 3 : 4;
      } else if (kind === 'offer') {
        out.offer = opts.beat === 'bound' ? 4 : 3;
      } else if (kind === 'ownYield') {
        out.yieldAmt = 2;
      }
      freeze('fairTrade');
      return out;
    }

    /** Inner: surge ground cost / pause */
    function runSurge(kind) {
      wake('surge');
      var out = {
        agent: children.surge.id,
        kind: kind,
        groundCost: 3,
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

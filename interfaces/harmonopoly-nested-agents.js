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
     * Monopoly-style Chance / Chest mapped to Holographic Goldilocks AI OS.
     * Challenges: pay chips OR Truth OR Dare (honor). Tips follow answer quality.
     */
    var OS_LANES = [
      'Health',
      'Relationships',
      'Wealth',
      'Purpose',
      'Experiences',
      'Knowledge',
      'Creative',
      'Spirit',
      'Libre'
    ];

    var REWARD_DECK = [
      {
        id: 'os_dividend',
        plain: 'Net-zero dividend — the field pays contributors.',
        osLane: 'Wealth',
        monopolyEcho: 'Bank pays you',
        tipPool: 4,
        distributeByContribution: true
      },
      {
        id: 'os_goldheart',
        plain: 'Gold Heart notice — table tips you for clear presence.',
        osLane: 'Spirit',
        monopolyEcho: 'Beauty contest',
        tipToSelf: 3,
        targetQuestion: 'What kindness did you bring to this table today?'
      },
      {
        id: 'os_knowledge',
        plain: 'Knowledge pile gift — answer opens a tip.',
        osLane: 'Knowledge',
        monopolyEcho: 'Crossword competition',
        tipOnResonant: 3,
        tipOnPartial: 1,
        targetQuestion: 'Name one true thing you learned this turn about the Sun or the table.'
      },
      {
        id: 'os_creative',
        plain: 'Creative spark — name a just-right idea for this zone.',
        osLane: 'Creative',
        monopolyEcho: 'Opera opening',
        tipOnResonant: 3,
        tipOnPartial: 2,
        targetQuestion: 'In one sentence: what would make this zone sing for everyone?'
      },
      {
        id: 'os_free_parking',
        plain: 'Libre lane — collect from the tip pool if any.',
        osLane: 'Libre',
        monopolyEcho: 'Free Parking',
        collectPool: true
      },
      {
        id: 'os_advance_resonance',
        plain: 'Purpose sync — cheaper attune + shared harvest bump.',
        osLane: 'Purpose',
        monopolyEcho: 'Advance to Go',
        calibrateDiscount: 2,
        yieldBonus: 1,
        tipSuggest: 2
      },
      {
        id: 'os_relationship',
        plain: 'Relationship pile — tip the player with most attunes.',
        osLane: 'Relationships',
        monopolyEcho: 'Grand Opera',
        tipTopContributor: 3
      },
      {
        id: 'os_experience',
        plain: 'Experience gift — Root and Crown both warm.',
        osLane: 'Experiences',
        monopolyEcho: 'Holiday fund',
        rootDelta: 1,
        crownDelta: 1,
        chips: 1
      },
      {
        id: 'cheap_light',
        plain: 'Soft light window — attuning costs less focus.',
        osLane: 'Health',
        monopolyEcho: 'Building loan matures',
        calibrateDiscount: 1,
        chips: 2
      },
      {
        id: 'valet_boost',
        plain: 'Valet credit — honor exchange + tip suggest.',
        osLane: 'Purpose',
        monopolyEcho: 'Life insurance matures',
        exchangeBonus: 1,
        tipSuggest: 2
      }
    ];

    var CHALLENGE_DECK = [
      {
        id: 'os_tax',
        plain: 'Income tax (OS) — pay chips, or Truth / Dare instead.',
        osLane: 'Wealth',
        monopolyEcho: 'Income Tax',
        chips: -3,
        chipStake: 3,
        canRefusePause: true,
        allowTruthDare: true,
        targetQuestion: 'What are you clinging to that the table does not need?',
        dare: 'Stand, name one blockage you will clear for the next player, then sit.'
      },
      {
        id: 'os_luxury',
        plain: 'Luxury tax — pay, or Truth / Dare for Fair Exchange.',
        osLane: 'Wealth',
        monopolyEcho: 'Luxury Tax',
        chips: -2,
        chipStake: 2,
        canRefusePause: true,
        allowTruthDare: true,
        targetQuestion: 'Where did you take more than you gave this round?',
        dare: 'Offer a 10-second valet kindness the receiver agrees to.'
      },
      {
        id: 'os_repairs',
        plain: 'Street repairs on the lattice — pay focus, or Truth / Dare.',
        osLane: 'Health',
        monopolyEcho: 'Street repairs',
        chips: -2,
        chipStake: 2,
        calibrateSurcharge: 1,
        canRefusePause: true,
        allowTruthDare: true,
        targetQuestion: 'What part of your body or breath needs grounding right now?',
        dare: 'Three slow breaths with eyes soft; say “grounded” when done.'
      },
      {
        id: 'os_jail',
        plain: 'Cool-down box — pause, or Dare to stay in play.',
        osLane: 'Spirit',
        monopolyEcho: 'Go to Jail',
        requiresGround: true,
        groundCost: 2,
        chipStake: 2,
        allowTruthDare: true,
        canRefusePause: true,
        targetQuestion: 'What fear spiked when the Sun card landed?',
        dare: 'Help the next player as valet for one full action (honor).'
      },
      {
        id: 'os_doctor',
        plain: 'Doctor fee (OS health) — pay or Truth.',
        osLane: 'Health',
        monopolyEcho: "Doctor's fee",
        chips: -2,
        chipStake: 2,
        canRefusePause: true,
        allowTruthDare: true,
        targetQuestion: 'What would “just right” health look like for you tonight?',
        dare: 'Drink water and toast the table’s net-zero balance.'
      },
      {
        id: 'os_school',
        plain: 'School tax (Knowledge) — pay or answer the target question.',
        osLane: 'Knowledge',
        monopolyEcho: 'School tax',
        chips: -2,
        chipStake: 2,
        canRefusePause: true,
        allowTruthDare: true,
        targetQuestion: 'Explain in plain words what full resonance on a zone means.',
        dare: 'Teach the next player the Check the Sun rule in one sentence.'
      },
      {
        id: 'ground_nudge',
        plain: 'Micro-surge — ground chips, or Truth / Dare.',
        osLane: 'Spirit',
        monopolyEcho: 'Electric company',
        groundCost: 2,
        requiresGround: true,
        chipStake: 2,
        allowTruthDare: true,
        canRefusePause: true,
        targetQuestion: 'Where is excess voltage in your crown right now?',
        dare: 'Hands on the floor or chair base for five seconds — bleed the surge.'
      },
      {
        id: 'ground_firm',
        plain: 'Anchor ask — firm ground, or Truth / Dare.',
        osLane: 'Spirit',
        monopolyEcho: 'Oil company',
        groundCost: 3,
        requiresGround: true,
        chipStake: 3,
        allowTruthDare: true,
        canRefusePause: true,
        targetQuestion: 'Who at this table can help you ground — and will you ask?',
        dare: 'Ask one player (with consent) to count three breaths with you.'
      },
      {
        id: 'pricey_light',
        plain: 'Hazy sector — extra attune cost, or Truth to waive one chip.',
        osLane: 'Experiences',
        monopolyEcho: 'Property repairs',
        calibrateSurcharge: 1,
        chipStake: 1,
        allowTruthDare: true,
        targetQuestion: 'What haze are you bringing into this zone?',
        dare: 'Clear one small physical blockage in the room (with agreement).'
      },
      {
        id: 'trade_steep',
        plain: 'Steep trade wind — pay surcharge later, or Dare now.',
        osLane: 'Relationships',
        monopolyEcho: 'Pay poor tax',
        offerSurcharge: 1,
        chipStake: 2,
        chips: -1,
        canRefusePause: true,
        allowTruthDare: true,
        targetQuestion: 'Who have you under-tipped in spirit this game?',
        dare: 'Promise one fair tip to the next shared harvest — say it aloud.'
      }
    ];

    var TRUTH_BANK = [
      'What do you actually want from this Goldilocks Rush — not the polite answer?',
      'Which OS pile (Health, Wealth, Purpose…) are you starving?',
      'Where are you out of phase with the table right now?',
      'What would Fair Exchange look like if you were fully honest?',
      'Name a boundary you need honored before the next turn.'
    ];

    var DARE_BANK = [
      'Lead a 5-second group breath — in through nose, out slow.',
      'Compliment the player with the fewest chips (sincere, specific).',
      'Pass the phone standing, as a valet announcing their name.',
      'Clear one tiny clutter in reach (only if the host agrees).',
      'Say the hydrogen-line joke: “1420 — we’re on the channel.”'
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
      /** Spread rolls across turns/clock — solar alone is sticky on calm days. */
      var roll =
        Math.abs(
          (seed +
            (ctx.turnIndex || 0) * 37 +
            minuteOfDay * 13 +
            Math.floor(ts / 1000) * 7 +
            (ctx.land || 0) * 19) %
            100
        );

      var intensity = ctx.intensity || 0;
      var rewardChance = Math.round(52 - intensity * 28);
      var challengeChance = Math.round(34 + intensity * 34);
      if (rewardChance + challengeChance > 94) {
        challengeChance = 94 - rewardChance;
      }

      var kind;
      if (roll < rewardChance) kind = 'reward';
      else if (roll < rewardChance + challengeChance) kind = 'challenge';
      else kind = 'neutral';

      var osLane = OS_LANES[(seed + (ctx.land || 0)) % OS_LANES.length];

      if (kind === 'neutral') {
        return {
          kind: 'neutral',
          id: 'steady_hum',
          plain: 'Steady hum — no extra gift or ask. Just play the land.',
          osLane: osLane,
          monopolyEcho: 'Just visiting',
          seed: seed,
          roll: roll,
          minuteOfDay: minuteOfDay,
          allowTruthDare: false
        };
      }

      var deck = kind === 'reward' ? REWARD_DECK : CHALLENGE_DECK;
      var idx = seed % deck.length;
      var idx2 = (seed + Math.floor((ts % 60000) / 1000)) % deck.length;
      var card = deck[intensity > 0.55 ? idx2 : idx];
      var truth =
        card.targetQuestion ||
        TRUTH_BANK[(seed + 3) % TRUTH_BANK.length];
      var dare =
        card.dare || DARE_BANK[(seed + 11) % DARE_BANK.length];

      var out = {
        kind: kind,
        id: card.id,
        plain: card.plain,
        osLane: card.osLane || osLane,
        monopolyEcho: card.monopolyEcho || '',
        seed: seed,
        roll: roll,
        minuteOfDay: minuteOfDay,
        truth: truth,
        dare: dare,
        allowTruthDare: !!card.allowTruthDare || kind === 'challenge',
        chipStake: card.chipStake != null ? card.chipStake : Math.abs(card.chips || 2),
        tipOnResonant: card.tipOnResonant != null ? card.tipOnResonant : 3,
        tipOnPartial: card.tipOnPartial != null ? card.tipOnPartial : 1,
        tipOnMiss: card.tipOnMiss != null ? card.tipOnMiss : 0,
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
        'offerSurcharge',
        'tipPool',
        'distributeByContribution',
        'tipToSelf',
        'collectPool',
        'tipTopContributor',
        'targetQuestion'
      ].forEach(function (k) {
        if (card[k] !== undefined) out[k] = card[k];
      });
      if (out.targetQuestion) out.truth = out.targetQuestion;
      return out;
    }

    function contributionScore(p) {
      return (
        (p.attunes || 0) * 2 +
        (p.truthsResonant || 0) * 3 +
        (p.daresDone || 0) * 2 +
        (p.tipsGiven || 0) +
        (p.exchanges || 0)
      );
    }

    function distributeByContribution(players, amount, creditGiver) {
      var scores = players.map(contributionScore);
      var sum = scores.reduce(function (a, b) { return a + b; }, 0);
      var paid = 0;
      if (sum <= 0) {
        var even = Math.floor(amount / players.length) || (amount > 0 ? 1 : 0);
        players.forEach(function (pl) {
          pl.chips += even;
          pl.tipsReceived = (pl.tipsReceived || 0) + even;
          paid += even;
        });
      } else {
        players.forEach(function (pl, i) {
          var share = Math.floor((amount * scores[i]) / sum);
          pl.chips += share;
          pl.tipsReceived = (pl.tipsReceived || 0) + share;
          paid += share;
        });
      }
      var rem = amount - paid;
      if (rem > 0 && players.length) {
        var top = 0;
        for (var i = 1; i < scores.length; i++) if (scores[i] > scores[top]) top = i;
        players[top].chips += rem;
        players[top].tipsReceived = (players[top].tipsReceived || 0) + rem;
      }
      if (creditGiver) {
        creditGiver.tipsGiven = (creditGiver.tipsGiven || 0) + amount;
        creditGiver.contributions = contributionScore(creditGiver);
      }
      return { paid: amount, mode: sum <= 0 ? 'even' : 'by_contribution' };
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

      /** Surge beat: must ground — chips or Truth/Dare — without wiping gift cards into tolls. */
      if (beat === 'flare') {
        event = Object.assign({}, event, {
          id: event.id,
          plain:
            (event.kind === 'reward' ? 'Surge overlay on gift — ' : 'Big solar surge — ') +
            event.plain,
          requiresGround: true,
          allowTruthDare: true,
          groundCost: event.groundCost || event.chipStake || 3,
          chipStake: event.chipStake || event.groundCost || 3,
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
      contributionScore: contributionScore,
      distributeByContribution: distributeByContribution,
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

/** Valet Pru's Concierge Service · Downtown Reno · edge channel + menu items (no server state). */
(function (global) {
  var ASSET_BASE = '/interfaces/goldilocks-deliveries';
  var HOME = '/hire-a-goldilocks-valet-concierge';
  var CHANNEL_KEY = 'grs-guest-channel';
  var JOIN_MAIL = 'mailto:valetpru@gmail.com?subject=' + encodeURIComponent("Valet Pru's Concierge Service · Downtown Reno — join as guest") +
    '&body=' + encodeURIComponent('Name:\nNeighborhood:\nWhatsApp number:');

  var ITEMS = {
    food: {
      id: 'food',
      title: 'Food delivery',
      pill: 'Delivery · $9 floor',
      floorLabel: '$9 delivery floor',
      image: ASSET_BASE + '/assets/grs-menu-food-delivery.jpg',
      imageAlt: 'Golden-age valet on a bicycle carrying a silver room-service cloche through neon-lit downtown Reno',
      lead: 'Order from any purveyor you choose inside our service area — book a Valet for pickup and delivery, or we handle everything for 18% of the total bill.',
      body: [
        'You may order from wherever you wish inside the Puerto Reno bubble — Downtown · Midtown · Southern UNR · Idlewild · Riverwalk. You order and pay your purveyor directly, then book a Valet to pick up and deliver. Micro-mobility only: no parking cruise, no sprawl markup, no corporate clock.',
        'Prefer hands-off? Book us to handle ordering, payment, pickup, and delivery for an additional 18% of the total bill.',
        'Valet tip splits 33% to the app · 67% to the franchisee who accepts and delivers.'
      ],
      floor: 9,
      broadcastLabel: 'food delivery'
    },
    shopping: {
      id: 'shopping',
      title: 'Personal shopping',
      pill: 'Run · $9 floor',
      floorLabel: '$9 run floor',
      image: ASSET_BASE + '/assets/grs-menu-personal-shopping.jpg',
      imageAlt: 'Uniformed valet carrying wrapped parcels and a market basket past elegant storefronts at dusk',
      lead: 'Order from the store or pharmacy of your choice — book a Valet for pickup and delivery, or we handle everything for 18% of the total bill.',
      body: [
        'Place your order directly with the shop, grocer, or pharmacy of your choice — then book a Valet to pick up and run it to your door inside the service area.',
        'Prefer hands-off? Book us to handle ordering, payment, pickup, and delivery for an additional 18% of the total bill. Your valet brings the receipt; goods settled on handoff under Fair Exchange.',
        'Valet tip splits 33% to the app · 67% to the franchisee who accepts and runs.'
      ],
      floor: 9,
      broadcastLabel: 'personal shopping'
    },
    'assist-hour': {
      id: 'assist-hour',
      title: 'Personal assistance · hourly',
      pill: 'Booked by the hour · $16.18/hr',
      floorLabel: '$16.18 per hour · ship rhythm',
      image: ASSET_BASE + '/assets/grs-menu-assist-hourly.jpg',
      imageAlt: 'Impeccable concierge holding an open gold pocket watch beside a leather notebook',
      lead: 'Hands, wheels, and presence on your pace — booked by the hour.',
      body: [
        'A concierge on your rhythm: tasks, setups, escorts, waiting in lines, whatever the hour needs. Chairman-grade attention without corporate SLA timers.',
        'Book 1–8 hours at the ship rhythm rate ($16.18/hr). Your tip offer above the floor is what makes a node say yes.',
        'Tip splits 33% to the app · 67% to the concierge who accepts and shows up.'
      ],
      floor: 16.18,
      quantity: { unitLabel: 'hour', min: 1, max: 8 },
      broadcastLabel: 'personal assistance · hourly'
    },
    'assist-day': {
      id: 'assist-day',
      title: 'Personal assistance · full day',
      pill: 'Booked by the day · $161.80/day',
      floorLabel: '$161.80 per day · ship rhythm ×10',
      image: ASSET_BASE + '/assets/grs-menu-assist-day.jpg',
      imageAlt: 'Distinguished valet-assistant opening grand lobby doors for a guest at sunrise',
      lead: 'A dedicated concierge for your whole day — sovereign pacing, one human thread.',
      body: [
        'A full day of Chairman-grade attention: your concierge handles the logistics, presence, and runs so you do not have to.',
        'Book 1–7 days at the Pass Ladder ×10 rate ($161.80/day). No algorithm, no queue — broadcast your offer, a human accepts.',
        'Tip splits 33% to the app · 67% to the concierge who accepts your day.'
      ],
      floor: 161.80,
      quantity: { unitLabel: 'day', min: 1, max: 7 },
      broadcastLabel: 'personal assistance · full day'
    },
    ecoreset: {
      id: 'ecoreset',
      title: 'Goldilocks EcoReset Service',
      pill: 'Email for quote · no payment layer',
      floorLabel: 'Email for quote · no payment layer',
      image: ASSET_BASE + '/assets/grs-menu-ecoreset.jpg',
      imageAlt: 'Mid-century modern home at dusk with tended gardens and art deco sun rays',
      lead: 'A trusted steward relationship — not a job with housing, not a tenant lease. No tip floor, no honor rail, no checkout. Email for a quote.',
      body: [
        'Goldilocks EcoReset Service is another layer of the Goldilocks model: the resident guest at an estate who connects hospitality, care, and creation. You are not hiring a traditional employee or filling a tenant slot. You are opening a <strong>trusted steward</strong> relationship.',
        {
          type: 'h3',
          text: 'The pattern'
        },
        {
          type: 'ul',
          title: 'The estate owner provides',
          items: [
            'A private room or guest cottage',
            'Food and hospitality access',
            'A stable environment',
            'A place where creation can happen'
          ]
        },
        {
          type: 'ul',
          title: 'The steward provides',
          items: [
            'Presence, trust, and discretion',
            'Hospitality and problem-solving',
            'Care of the environment',
            'A human connection when it is needed'
          ]
        },
        'That sits close to estate caretakers, household managers, and private concierges — the trusted person who keeps property, guests, and details running smoothly.',
        {
          type: 'h3',
          text: 'What Valet Pru’s Concierge actually is'
        },
        '“Valet” here is not parking. It is closer to <strong>Resident Steward + Lifestyle Concierge + Digital Companion + Experience Curator</strong> — bridging physical hospitality and digital systems without turning the house into another transactional cage.',
        {
          type: 'h3',
          text: 'Who this fits'
        },
        'The ideal client is not always a billionaire. It can be an older couple with a beautiful property who travels; an artist or inventor with a retreat; a family with a vacation estate; a small eco-lodge owner; a vineyard or farm; a wellness retreat.',
        'The match has to be mutually dignifying. The steward is not “the help” in the old sense — they are a trusted presence. The risk on wealthy estates is seeing only labor value. The Goldilocks match understands that <strong>trust itself is the service</strong>.',
        {
          type: 'h3',
          text: 'From restroom valet to ecosystem steward'
        },
        'The restroom valet role is a tiny version of the same archetype: people hand you responsibility, personal space, and discretion. Goldilocks EcoReset Service is the next ring — that same trust relationship in a broader lifestyle and ecosystem role.',
        {
          type: 'quote',
          text: 'A modern steward’s life: part concierge, part caretaker, part creative resident — where your contribution earns your place.'
        },
        'That is a different search than a job with housing. It is a patronage-style relationship built around trust. Start as a two-week test drive for home, estate, or business — human to human with PL Taino.',
        {
          type: 'h3',
          text: 'How to engage'
        },
        '<strong>No payment layer on this door.</strong> EcoReset is not on the tip-floor / WhatsApp broadcast rail used for food runs and hourly assistance. <strong>Email for a quote</strong> — describe the property, window, and what you need; PL Taino answers human to human. Old School Protocol: no checkout, no honor rail, no forms funnel.'
      ],
      mailto: 'mailto:valetpru@gmail.com?subject=' + encodeURIComponent('Goldilocks EcoReset Service — quote request') +
        '&body=' + encodeURIComponent('Quote request — Goldilocks EcoReset Service\n\nProperty type (home / estate / business / retreat):\nNeighborhood or region:\nWindow of interest:\nWhat you need (steward / hospitality / digital bridge):\nNotes for the quote:\n'),
      quoteOnly: true,
      broadcastLabel: 'Goldilocks EcoReset Service'
    }
  };

  function isGuestChannelActive() {
    try { return localStorage.getItem(CHANNEL_KEY) === 'active'; } catch (e) { return false; }
  }

  function activateGuestChannel() {
    try {
      localStorage.setItem(CHANNEL_KEY, 'active');
      localStorage.setItem(CHANNEL_KEY + '-at', new Date().toISOString().slice(0, 10));
    } catch (e) { /* edge only */ }
  }

  function clearGuestChannel() {
    try {
      localStorage.removeItem(CHANNEL_KEY);
      localStorage.removeItem(CHANNEL_KEY + '-at');
    } catch (e) { /* edge only */ }
  }

  function bookMail(item) {
    var subject = "Valet Pru's Concierge Service — " + item.title;
    var body = 'Name:\nNeighborhood:\nWhat I need:\nPreferred time:\n';
    return 'mailto:valetpru@gmail.com?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);
  }

  function whatsappUrl(text) {
    return 'https://wa.me/?text=' + encodeURIComponent(text);
  }

  function buildBroadcast(item, opts) {
    opts = opts || {};
    var qty = opts.qty || 1;
    var tipExtra = opts.tipExtra || '';
    var floor = item.floor;
    if (item.quantity) floor = item.floor * qty;
    var floorStr = '$' + floor.toFixed(2);
    var lines = [
      'HIRE A GOLDILOCKS VALET CONCIERGE · ' + item.broadcastLabel,
      '',
      'What I want:',
      'Tip offered: ' + floorStr + ' (floor)' + (tipExtra ? ' + ' + tipExtra : ''),
      'Neighborhood (Downtown / Midtown / Southern UNR / Idlewild / Riverwalk):'
    ];
    if (item.quantity) {
      lines.push('Quantity: ' + qty + ' ' + item.quantity.unitLabel + (qty > 1 ? 's' : ''));
    }
    lines.push('', 'Order & pay purveyor direct · OR we handle all for 18% of total bill');
    return lines.join('\n');
  }

  function resolveItemId(params) {
    var item = params.get('item') || '';
    var service = params.get('service') || '';
    var unit = params.get('unit') || '';
    if (item && ITEMS[item]) return item;
    if (service === 'assist') return unit === 'day' ? 'assist-day' : 'assist-hour';
    if (service && ITEMS[service]) return service;
    return 'food';
  }

  global.GRS = {
    ASSET_BASE: ASSET_BASE,
    HOME: HOME,
    CHANNEL_KEY: CHANNEL_KEY,
    JOIN_MAIL: JOIN_MAIL,
    ITEMS: ITEMS,
    bookMail: bookMail,
    isGuestChannelActive: isGuestChannelActive,
    activateGuestChannel: activateGuestChannel,
    clearGuestChannel: clearGuestChannel,
    whatsappUrl: whatsappUrl,
    buildBroadcast: buildBroadcast,
    resolveItemId: resolveItemId
  };
})(typeof window !== 'undefined' ? window : globalThis);

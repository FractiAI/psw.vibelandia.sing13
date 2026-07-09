/** Hire-A-Goldilocks-Valet-Concierge · edge channel + menu items (no server state). */
(function (global) {
  var ASSET_BASE = '/interfaces/goldilocks-deliveries';
  var HOME = '/hire-a-goldilocks-valet-concierge';
  var CHANNEL_KEY = 'grs-guest-channel';
  var JOIN_MAIL = 'mailto:valetpru@gmail.com?subject=' + encodeURIComponent('Hire-A-Goldilocks-Valet-Concierge — join as guest') +
    '&body=' + encodeURIComponent('Name:\nNeighborhood:\nWhatsApp number:');

  var ITEMS = {
    food: {
      id: 'food',
      title: 'Food delivery',
      pill: 'Delivery · $9 floor',
      floorLabel: '$9 delivery floor',
      image: ASSET_BASE + '/assets/grs-menu-food-delivery.jpg',
      imageAlt: 'Golden-age valet on a bicycle carrying a silver room-service cloche through neon-lit downtown Reno',
      lead: 'Order from your purveyor of choice — book a Valet for pickup and delivery, or we handle everything for 18% of the total bill.',
      body: [
        'You order and pay your purveyor directly — then book a Valet to pick up and deliver inside the service area. Micro-mobility only: no parking cruise, no sprawl markup, no corporate clock.',
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
      floorLabel: '$16.18 per hour · EGS φ rate',
      image: ASSET_BASE + '/assets/grs-menu-assist-hourly.jpg',
      imageAlt: 'Impeccable concierge holding an open gold pocket watch beside a leather notebook',
      lead: 'Hands, wheels, and presence on your pace — booked by the hour.',
      body: [
        'A concierge on your rhythm: tasks, setups, escorts, waiting in lines, whatever the hour needs. Chairman-grade attention without corporate SLA timers.',
        'Book 1–8 hours at the EGS φ rate ($16.18/hr). Your tip offer above the floor is what makes a node say yes.',
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
      floorLabel: '$161.80 per day · EGS φ ×10 rate',
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
      title: 'EcoReset',
      pill: 'Home · Estate · Business',
      floorLabel: 'Old School Protocol · no payment layer',
      image: ASSET_BASE + '/assets/grs-menu-ecoreset.jpg',
      imageAlt: 'Mid-century modern home at dusk with tended gardens and art deco sun rays',
      lead: 'Two-week test drive for your home, estate, or business — human to human.',
      body: [
        'EcoReset is not a menu order — it is a residency conversation with PL Taino directly. Property type: home, estate, or business inside or near the bubble.',
        'No WhatsApp channel, no honor rail on this door. Email what resonates and we schedule the two-week test drive.',
        'Old School Protocol — no forms funnel, no CRM, no surveillance.'
      ],
      mailto: 'mailto:valetpru@gmail.com?subject=' + encodeURIComponent('Goldilocks EcoReset — interested node') +
        '&body=' + encodeURIComponent('Property type (home / estate / business):\nNeighborhood:\nWindow of interest:\nWhat resonates:'),
      broadcastLabel: 'EcoReset residency'
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
      'Neighborhood (Downtown / Midtown / UNR / Idlewild / Reno Experience District):'
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
    isGuestChannelActive: isGuestChannelActive,
    activateGuestChannel: activateGuestChannel,
    clearGuestChannel: clearGuestChannel,
    whatsappUrl: whatsappUrl,
    buildBroadcast: buildBroadcast,
    resolveItemId: resolveItemId
  };
})(typeof window !== 'undefined' ? window : globalThis);

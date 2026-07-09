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
      lead: 'Order from any purveyor you choose inside our service area — book a Valet for pickup and delivery, or we handle everything for 18% of the total bill.',
      body: [
        'You may order from wherever you wish inside the Puerto Reno bubble — Downtown · Midtown · UNR · Idlewild · Reno Experience District. You order and pay your purveyor directly, then book a Valet to pick up and deliver. Micro-mobility only: no parking cruise, no sprawl markup, no corporate clock.',
        'Prefer hands-off? Book us to handle ordering, payment, pickup, and delivery for an additional 18% of the total bill.',
        'Valet tip splits 33% to the app · 67% to the franchisee who accepts and delivers.'
      ],
      valetPicks: {
        title: 'Goldilocks Valet Picks',
        intro:
          'You may order from <strong>wherever you wish</strong> inside our Puerto Reno service area — Downtown · Midtown · UNR · Idlewild · Reno Experience District. The purveyors below are ones we are <strong>proud to recommend and support</strong>. They are not the only options.',
        instructions:
          'Order online or by phone, then book your Valet. You place and pay for your order, or have us do it for you for an extra <strong>18%</strong>. Include <strong>“In care of Goldilocks Valet”</strong> in Special Order Instructions.',
        sections: [
          {
            label: 'Breakfast',
            picks: [
              {
                name: 'Desert Sun Bagels',
                href: 'https://order.toasttab.com/online/desert-sun-bagel-co',
                phone: '(775) 357-9480',
                phoneTel: '+17753579480',
                image: ASSET_BASE + '/assets/picks/desert-sun-bagels.png',
                imageAlt: 'Desert Sun Bagel Co. logo'
              }
            ]
          },
          {
            label: 'Lunch',
            picks: [
              {
                name: 'Rubicon Deli',
                href: 'https://order.toasttab.com/online/rubicon-deli-reno-445-california-ave-suite-b',
                phone: '(775) 322-9792',
                phoneTel: '+17753229792',
                image: ASSET_BASE + '/assets/picks/rubicon-deli.jpg',
                imageAlt: 'Rubicon Deli logo'
              }
            ]
          },
          {
            label: 'Vegans',
            picks: [
              {
                name: 'Great Full Gardens',
                href: 'https://greatfullgardens.toast.site/order/great-full-gardens-midtown',
                phone: '(775) 324-2013',
                phoneTel: '+17753242013',
                image: ASSET_BASE + '/assets/picks/great-full-gardens.jpg',
                imageAlt: 'Great Full Gardens logo'
              }
            ]
          },
          {
            label: 'Dinner',
            picks: [
              {
                name: 'Liberty Food & Wine',
                href: 'https://www.libertyfoodandwine.com/popmenu-order',
                phone: '(775) 336-1091',
                phoneTel: '+17753361091',
                image: ASSET_BASE + '/assets/picks/liberty-food-wine.jpg',
                imageAlt: 'Liberty Food & Wine Exchange logo'
              },
              {
                name: 'Taiwan 101',
                href: 'https://101restaurant.hrpos.heartland.us/order',
                phone: '(775) 657-6144',
                phoneTel: '+17756576144',
                image: ASSET_BASE + '/assets/picks/taiwan-101.jpg',
                imageAlt: '101 Taiwanese Cuisine logo'
              }
            ]
          }
        ]
      },
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

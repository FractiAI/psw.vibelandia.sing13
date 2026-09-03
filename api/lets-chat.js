/**
 * Let's Chat · ephemeral guest comms pipe.
 * GET ?roster=1 — allowlisted peers (email header required).
 * GET ?inbox=1&since= — pull ciphertext envelopes for signed-in peer.
 * GET ?presence=1 — ephemeral DND / online snapshot.
 * POST ?inbox=1 — push ciphertext envelope (no plaintext stored).
 * POST ?presence=1 — set DND / online (TTL only).
 *
 * Honesty: relay only — no Blob, no message archive. Creators are guests here too.
 */
let libs;
async function loadLibs() {
  if (!libs) {
    const [access, peers, signal] = await Promise.all([
      import('../lib/lattice-access.mjs'),
      import('../lib/lets-chat-peers.mjs'),
      import('../lib/lets-chat-signal.mjs'),
    ]);
    libs = { ...access, ...peers, ...signal };
  }
  return libs;
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, x-lattice-email, X-Lattice-Email',
  );
}

function requestUrl(req) {
  return new URL(req.url || '/', 'http://localhost');
}

function emailFromReq(req, body, normalizeEmail) {
  const header =
    req.headers?.['x-lattice-email'] ||
    req.headers?.['X-Lattice-Email'] ||
    '';
  const fromBody = body && typeof body.email === 'string' ? body.email : '';
  return normalizeEmail(header || fromBody);
}

async function requireSeat(req, body, L) {
  const email = emailFromReq(req, body, L.normalizeEmail);
  const access = L.checkLatticeEmailAccess(email);
  if (!access.ok) {
    return { error: { status: 401, code: 'email_required', message: access.reason } };
  }
  const myPeerId = L.resolveLetsChatPeerId(email);
  if (!myPeerId) {
    return {
      error: {
        status: 403,
        code: 'no_seat',
        message: 'This email has no Let\'s Chat seat yet. Email the Purser to request access.',
      },
    };
  }
  return { email, access, myPeerId };
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  let L;
  try {
    L = await loadLibs();
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: 'lets_chat_libs_failed',
      message: err instanceof Error ? err.message : String(err),
    });
    return;
  }

  const url = requestUrl(req);
  const body =
    req.method === 'POST'
      ? typeof req.body === 'string'
        ? JSON.parse(req.body || '{}')
        : req.body || {}
      : null;

  try {
    if (url.searchParams.get('presence') === '1') {
      const seat = await requireSeat(req, body, L);
      if (seat.error) {
        res.status(seat.error.status).json({ ok: false, error: seat.error.code, message: seat.error.message });
        return;
      }
      if (req.method === 'GET') {
        const presence = await L.snapshotPresence();
        res.status(200).json({
          ok: true,
          product: L.LETS_CHAT_PRODUCT,
          myPeerId: seat.myPeerId,
          presence,
          honesty:
            'Presence relay — TTL ~45s. Blob-backed when BLOB_READ_WRITE_TOKEN is set. DND blocks incoming call/chat offers on the edge.',
        });
        return;
      }
      if (req.method === 'POST') {
        await L.setPresence(seat.myPeerId, {
          dnd: Boolean(body?.dnd),
          label: typeof body?.label === 'string' ? body.label : '',
        });
        res.status(200).json({ ok: true, myPeerId: seat.myPeerId, dnd: Boolean(body?.dnd) });
        return;
      }
      res.status(405).json({ ok: false, error: 'method_not_allowed' });
      return;
    }

    if (url.searchParams.get('inbox') === '1') {
      const seat = await requireSeat(req, body, L);
      if (seat.error) {
        res.status(seat.error.status).json({ ok: false, error: seat.error.code, message: seat.error.message });
        return;
      }
      if (req.method === 'GET') {
        const since = Number(url.searchParams.get('since') || 0) || 0;
        const envelopes = await L.pullInbox({ toPeerId: seat.myPeerId, since });
        res.status(200).json({
          ok: true,
          product: L.LETS_CHAT_PRODUCT,
          myPeerId: seat.myPeerId,
          envelopes,
          honesty:
            'Ciphertext relay only — center pipe never holds plaintext. Blob-backed when BLOB_READ_WRITE_TOKEN is set. Envelopes expire in ~90s. Edge clients decrypt locally.',
        });
        return;
      }
      if (req.method === 'POST') {
        const envelope = L.sanitizeEnvelope({
          id: body?.id,
          kind: body?.kind || 'msg',
          fromPeerId: seat.myPeerId,
          toPeerId: body?.toPeerId,
          threadId: body?.threadId,
          ciphertext: body?.ciphertext,
        });
        if (!envelope) {
          res.status(400).json({ ok: false, error: 'invalid_envelope' });
          return;
        }
        const roster = L.listLetsChatPeers();
        const target = roster.find((p) => p.id === envelope.toPeerId);
        if (!target) {
          res.status(403).json({ ok: false, error: 'unknown_peer' });
          return;
        }
        const result = await L.pushEnvelope(envelope);
        res.status(200).json({ ok: true, duplicate: Boolean(result.duplicate), id: envelope.id });
        return;
      }
      res.status(405).json({ ok: false, error: 'method_not_allowed' });
      return;
    }

    if (url.searchParams.get('roster') === '1' && req.method === 'GET') {
      const seat = await requireSeat(req, null, L);
      if (seat.error) {
        res.status(seat.error.status).json({ ok: false, error: seat.error.code, message: seat.error.message });
        return;
      }
      const peers = L.listLetsChatPeers()
        .filter((p) => p.id !== seat.myPeerId)
        .map(({ id, name, privilege }) => ({ id, name, privilege }));
      res.status(200).json({
        ok: true,
        product: L.LETS_CHAT_PRODUCT,
        myPeerId: seat.myPeerId,
        privilege: seat.access.privilege,
        peers,
        egsFrontalConstant: L.EGS_FRONTAL_CONSTANT,
        honesty:
          'Registered guests + creators (creators are guests here). Request access by email — no Lattice Chat BYOK required.',
      });
      return;
    }

    if (req.method === 'GET') {
      res.status(200).json({
        ok: true,
        product: L.LETS_CHAT_PRODUCT,
        endpoints: {
          roster: '?roster=1',
          inbox: '?inbox=1',
          presence: '?presence=1',
        },
        honesty:
          'Let\'s Chat — guest-to-guest encrypted comms. No harvesting. Fractal EGS encryption on the edge. Fair Exchange · consent-first · predators never welcome.',
      });
      return;
    }

    res.status(405).json({ ok: false, error: 'method_not_allowed' });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: 'lets_chat_failed',
      message: err instanceof Error ? err.message : String(err),
    });
  }
}

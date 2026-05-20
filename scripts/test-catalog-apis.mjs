#!/usr/bin/env node
/**
 * Smoke-test catalog upload API (run: node scripts/test-catalog-apis.mjs)
 */
const ORIGIN =
  process.env.CATALOG_ORIGIN || 'https://www.ssvibelandiaquestfest24x365.com';
const SECRET = process.env.CATALOG_UPLOAD_SECRET || 'valetpru1!';

async function main() {
  console.log('Origin:', ORIGIN);

  const catRes = await fetch(`${ORIGIN}/api/catalog`, { cache: 'no-store' });
  const catJson = await catRes.json().catch(() => ({}));
  console.log('GET /api/catalog', catRes.status, catRes.ok ? 'ok' : catJson);

  const tiny = Buffer.alloc(512, 0);
  const upRes = await fetch(`${ORIGIN}/api/catalog-upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'audio/mpeg',
      'X-Catalog-Secret': SECRET,
      'X-Filename': 'smoke-test.mp3',
      'X-Track-Title': 'Smoke Test',
      'X-Track-Artist': 'API Test',
    },
    body: tiny,
  });
  const upJson = await upRes.json().catch(() => ({}));
  console.log('POST /api/catalog-upload (inline)', upRes.status, upJson.error || upJson.track?.id || upJson);

  const regRes = await fetch(`${ORIGIN}/api/catalog-upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Catalog-Secret': SECRET,
    },
    body: JSON.stringify({
      action: 'register',
      trackId: 'trk-srv-smoke-register',
      url: 'https://example.com/smoke.mp3',
      contentType: 'audio/mpeg',
      title: 'Register smoke',
      artist: 'Test',
      filename: 'smoke.mp3',
    }),
  });
  const regJson = await regRes.json().catch(() => ({}));
  console.log('POST /api/catalog-upload (register)', regRes.status, regJson.error || regJson.track?.id || regJson);

  const clientRes = await fetch(`${ORIGIN}/api/catalog-upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Catalog-Secret': SECRET,
    },
    body: JSON.stringify({
      type: 'blob.generate-client-token',
      payload: { pathname: 'catalog/smoke-test.bin', callbackUrl: `${ORIGIN}/api/catalog-upload` },
    }),
  });
  const clientText = await clientRes.text();
  console.log('POST /api/catalog-upload (blob token)', clientRes.status, clientText.slice(0, 240));

  const editId = Object.keys(catJson.tracks || {}).find((id) => id.startsWith('trk-srv-'));
  if (editId && catRes.ok) {
    const origTitle = catJson.tracks[editId].title;
    const probe = `EDIT_VERIFY_${Date.now()}`;
    const patchRes = await fetch(`${ORIGIN}/api/catalog-track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Catalog-Secret': SECRET },
      body: JSON.stringify({ action: 'update', trackId: editId, title: probe }),
    });
    const patchJson = await patchRes.json().catch(() => ({}));
    console.log('POST /api/catalog-track (update)', patchRes.status, patchJson.error || patchJson.track?.title);

    const readRes = await fetch(`${ORIGIN}/api/catalog`, { cache: 'no-store' });
    const readJson = await readRes.json().catch(() => ({}));
    const readTitle = readJson.tracks?.[editId]?.title;
    const match = readTitle === probe;
    console.log(
      'GET /api/catalog after edit',
      readRes.status,
      match ? 'title matches' : `MISMATCH got=${readTitle} want=${probe} ver=${readJson.version}`,
    );

    await fetch(`${ORIGIN}/api/catalog-track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Catalog-Secret': SECRET },
      body: JSON.stringify({ action: 'update', trackId: editId, title: origTitle }),
    });

    if (!patchRes.ok || !match) process.exitCode = 1;
  }

  const ok = regRes.ok && clientRes.ok && !process.exitCode;
  if (!ok) process.exitCode = process.exitCode || 1;
  else console.log('\nOK — register + blob token + track edit verify.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

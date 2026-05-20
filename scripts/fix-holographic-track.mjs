#!/usr/bin/env node
const ORIGIN = 'https://www.ssvibelandiaquestfest24x365.com';
const SECRET = process.env.CATALOG_UPLOAD_SECRET || 'valetpru1!';
const id = 'trk-srv-c5f6a10a-cd5c-4fb1-9e58-0a0aa9c505dd';
const mp3 = `https://klep96o4e14lvmyd.public.blob.vercel-storage.com/catalog/${id}.mp3`;
const cover = `https://klep96o4e14lvmyd.public.blob.vercel-storage.com/catalog/covers/${id}.jpg`;

const reg = await fetch(`${ORIGIN}/api/catalog-upload`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-Catalog-Secret': SECRET },
  body: JSON.stringify({
    action: 'register',
    trackId: id,
    url: mp3,
    contentType: 'audio/mpeg',
    title: 'Holographic Merengazo',
    artist: "Hero Jo's Golden Bachdoor Hit Factory",
    filename: `${id}.mp3`,
    genre: 'Caliente',
    durationSec: 323,
  }),
});
const regJson = await reg.json();
console.log('register', reg.status, regJson.error || regJson.track?.src?.slice(-20));

if (reg.ok) {
  const coverHead = await fetch(cover, { method: 'HEAD' });
  if (coverHead.ok) {
    await fetch(`${ORIGIN}/api/catalog-track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Catalog-Secret': SECRET },
      body: JSON.stringify({ action: 'update', trackId: id, posterSrc: cover, clearVideo: true }),
    });
  }
}

const cat = await fetch(`${ORIGIN}/api/catalog`, { cache: 'no-store' }).then((r) => r.json());
const tr = cat.tracks[id];
console.log('catalog', cat.version, 'mp3', tr?.src?.includes('.mp3'), 'video', !!tr?.videoSrc);

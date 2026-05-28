const ql = `[out:json][timeout:25];
way["barrier"="fence"](around:8000,45.18,-111.25);
out geom;`;
for (const url of [
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass-api.de/api/interpreter',
]) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        Accept: 'application/json',
        'User-Agent': 'SS-Vibelandia-TurnerOSM/1.0 (+https://www.ssvibelandiaquestfest24x365.com; turner-bison-fence)',
      },
      body: `data=${encodeURIComponent(ql)}`,
    });
    const text = await res.text();
    let j;
    try {
      j = JSON.parse(text);
      console.log(url, res.status, j.elements?.length ?? 0, j.remark || j.error || '');
    } catch {
      console.log(url, res.status, 'non-json', text.slice(0, 120));
    }
  } catch (e) {
    console.log(url, 'fail', e.message);
  }
}

/**
 * Upstash Redis REST — optional. Falls back to null when env unset (caller uses in-memory).
 */
export function upstashConfigured() {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

async function upstash(command, ...args) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([command, ...args]),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.result ?? null;
}

export async function redisSetJson(key, value, ttlSec) {
  const raw = JSON.stringify(value);
  const result = ttlSec
    ? await upstash('SET', key, raw, 'EX', String(ttlSec))
    : await upstash('SET', key, raw);
  return result === 'OK' || result === true;
}

export async function redisGetJson(key) {
  const raw = await upstash('GET', key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function redisLpush(key, value, maxLen = 500) {
  await upstash('LPUSH', key, value);
  await upstash('LTRIM', key, '0', String(maxLen - 1));
}

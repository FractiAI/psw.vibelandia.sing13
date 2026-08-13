import { describe, expect, it } from 'vitest';
import handler from '../../api/lattice-chat.js';

function response() {
  const headers = {};
  return {
    statusCode: 0,
    headers,
    setHeader(name, value) {
      headers[String(name).toLowerCase()] = value;
    },
    end() {},
  };
}

describe('lattice-chat CORS preflight', () => {
  it('allows all provider headers and methods', async () => {
    // Regression coverage for the CORS fixes in PR #77/#73.
    const res = response();
    await handler({ method: 'OPTIONS', headers: {}, query: {} }, res);

    expect(res.statusCode).toBe(204);

    const allowHeaders = String(res.headers['access-control-allow-headers']).toLowerCase();
    for (const header of [
      'content-type',
      'x-lattice-email',
      'x-cursor-api-key',
      'x-lattice-provider',
      'x-anthropic-api-key',
      'x-gemini-api-key',
      'x-openrouter-api-key',
    ]) {
      expect(allowHeaders).toContain(header);
    }

    const allowMethods = String(res.headers['access-control-allow-methods']);
    for (const method of ['POST', 'GET', 'OPTIONS']) {
      expect(allowMethods).toContain(method);
    }
  });
});

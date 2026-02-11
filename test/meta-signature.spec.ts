import { createHmac } from 'crypto';
import { verifyMetaSignature } from '../src/webhooks/meta-signature';

describe('verifyMetaSignature', () => {
  const secret = 'test-app-secret';
  const body = Buffer.from(JSON.stringify({ hello: 'world' }));

  it('returns true for valid signature', () => {
    const digest = createHmac('sha256', secret).update(body).digest('hex');
    const header = `sha256=${digest}`;

    expect(verifyMetaSignature(body, header, secret)).toBe(true);
  });

  it('returns false for invalid signature', () => {
    const header = 'sha256=deadbeef';

    expect(verifyMetaSignature(body, header, secret)).toBe(false);
  });

  it('returns false when header is missing', () => {
    expect(verifyMetaSignature(body, undefined, secret)).toBe(false);
  });
});

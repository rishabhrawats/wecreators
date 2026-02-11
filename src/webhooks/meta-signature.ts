import { createHmac, timingSafeEqual } from 'crypto';

export function verifyMetaSignature(
  rawBody: Buffer,
  signatureHeader: string | undefined,
  appSecret: string,
): boolean {
  if (!signatureHeader || !signatureHeader.startsWith('sha256=')) {
    return false;
  }

  const providedDigest = signatureHeader.slice('sha256='.length);
  const expectedDigest = createHmac('sha256', appSecret).update(rawBody).digest('hex');

  const providedBuffer = Buffer.from(providedDigest, 'hex');
  const expectedBuffer = Buffer.from(expectedDigest, 'hex');

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(providedBuffer, expectedBuffer);
}

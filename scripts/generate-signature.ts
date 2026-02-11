import { createHmac } from 'crypto';
import { readFileSync } from 'fs';

const filePath = process.argv[2];
const secret = process.env.APP_SECRET;

if (!filePath) {
  throw new Error('Usage: ts-node scripts/generate-signature.ts <json-file-path>');
}

if (!secret) {
  throw new Error('APP_SECRET env var is required');
}

const raw = readFileSync(filePath);
const digest = createHmac('sha256', secret).update(raw).digest('hex');
console.log(`sha256=${digest}`);

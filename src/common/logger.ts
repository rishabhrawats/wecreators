import pino from 'pino';

export const appLogger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', '*.accessTokenEncrypted'],
    censor: '[REDACTED]',
  },
});

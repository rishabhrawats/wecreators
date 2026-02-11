import { createHash } from 'crypto';
import { NormalizedEvent } from './normalized-event';

function stableExternalId(parts: Array<string | number | undefined>): string {
  const source = parts.filter(Boolean).join(':');
  if (source.length > 0) {
    return source;
  }
  return createHash('sha256').update(JSON.stringify(parts)).digest('hex');
}

export function normalizeMetaWebhook(payload: any): NormalizedEvent[] {
  const entryList = Array.isArray(payload?.entry) ? payload.entry : [];
  const events: NormalizedEvent[] = [];

  for (const entry of entryList) {
    const igAccountId = entry?.id ? String(entry.id) : undefined;
    const time = entry?.time ? String(entry.time) : undefined;

    if (Array.isArray(entry?.changes)) {
      for (const change of entry.changes) {
        const field = change?.field ? String(change.field) : undefined;
        const value = change?.value ?? {};

        const isComment = field === 'comments' || Boolean(value.comment_id || value.media_id);
        const eventType = isComment ? 'COMMENT' : 'UNKNOWN';
        const externalEventId = stableExternalId([
          'entry',
          igAccountId,
          field,
          time,
          value.comment_id,
          value.media_id,
          value.id,
          value.from?.id,
        ]);

        events.push({
          source: 'instagram',
          eventType,
          externalEventId,
          igAccountId,
          actorIgUserId: value.from?.id ? String(value.from.id) : undefined,
          postId: value.media_id ? String(value.media_id) : undefined,
          threadId: undefined,
          text: value.text ? String(value.text) : undefined,
          raw: { entry, change },
        });
      }
    }

    if (Array.isArray(entry?.messaging)) {
      for (const messaging of entry.messaging) {
        const message = messaging?.message ?? {};
        const externalEventId = stableExternalId([
          'entry',
          igAccountId,
          'messaging',
          time,
          message.mid,
          messaging?.sender?.id,
          messaging?.recipient?.id,
        ]);

        events.push({
          source: 'instagram',
          eventType: message?.text ? 'DM' : 'UNKNOWN',
          externalEventId,
          igAccountId,
          actorIgUserId: messaging?.sender?.id ? String(messaging.sender.id) : undefined,
          postId: undefined,
          threadId: messaging?.recipient?.id ? String(messaging.recipient.id) : undefined,
          text: message?.text ? String(message.text) : undefined,
          raw: { entry, messaging },
        });
      }
    }
  }

  if (events.length === 0) {
    events.push({
      source: 'instagram',
      eventType: 'UNKNOWN',
      externalEventId: stableExternalId(['fallback', Date.now(), JSON.stringify(payload)]),
      raw: payload,
    });
  }

  return events;
}

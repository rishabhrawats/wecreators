export type NormalizedEventType = 'COMMENT' | 'DM' | 'UNKNOWN';

export interface NormalizedEvent {
  source: 'instagram';
  eventType: NormalizedEventType;
  externalEventId: string;
  igAccountId?: string;
  actorIgUserId?: string;
  postId?: string;
  threadId?: string;
  text?: string;
  raw: any;
}

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';
import { appLogger } from '../common/logger';
import { NormalizedEvent } from './normalized-event';

@Injectable()
export class WebhooksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queueService: QueueService,
  ) {}

  async persistAndEnqueue(events: NormalizedEvent[]): Promise<void> {
    for (const event of events) {
      try {
        const incoming = await this.prisma.incomingEvent.create({
          data: {
            orgId: null,
            integrationId: null,
            source: event.source,
            eventType: event.eventType,
            externalEventId: event.externalEventId,
            actorIgUserId: event.actorIgUserId,
            postId: event.postId,
            threadId: event.threadId,
            text: event.text,
            raw: event.raw as Prisma.InputJsonValue,
          },
        });

        await this.queueService.enqueueIncomingEvent(incoming.id);
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          appLogger.info({ externalEventId: event.externalEventId }, 'duplicate incoming event ignored');
          continue;
        }
        throw error;
      }
    }
  }
}

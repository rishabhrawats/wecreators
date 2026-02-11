import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Queue } from 'bullmq';
import { EnvService } from '../config/env.service';

export type IncomingEventJob = { incomingEventId: string };

@Injectable()
export class QueueService implements OnModuleDestroy {
  private readonly queue: Queue<IncomingEventJob>;

  constructor(private readonly envService: EnvService) {
    this.queue = new Queue<IncomingEventJob>('incoming-events', {
      connection: {
        host: this.envService.get('REDIS_HOST'),
        port: this.envService.get('REDIS_PORT'),
        password: this.envService.get('REDIS_PASSWORD') || undefined,
      },
      defaultJobOptions: {
        removeOnComplete: 1000,
        removeOnFail: 5000,
      },
    });
  }

  async enqueueIncomingEvent(incomingEventId: string): Promise<void> {
    await this.queue.add(
      'incoming-event',
      { incomingEventId },
      {
        jobId: incomingEventId,
      },
    );
  }

  async onModuleDestroy(): Promise<void> {
    await this.queue.close();
  }
}

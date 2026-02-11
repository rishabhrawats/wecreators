import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Job, Worker } from 'bullmq';
import { EnvService } from '../config/env.service';
import { appLogger } from '../common/logger';
import { IncomingEventJob } from './queue.service';

@Injectable()
export class IncomingEventsWorker implements OnModuleInit, OnModuleDestroy {
  private worker?: Worker<IncomingEventJob>;

  constructor(private readonly envService: EnvService) {}

  onModuleInit(): void {
    this.worker = new Worker<IncomingEventJob>(
      'incoming-events',
      async (job: Job<IncomingEventJob>) => {
        appLogger.info(
          {
            jobId: job.id,
            incomingEventId: job.data.incomingEventId,
          },
          'incoming event job received',
        );
      },
      {
        connection: {
          host: this.envService.get('REDIS_HOST'),
          port: this.envService.get('REDIS_PORT'),
          password: this.envService.get('REDIS_PASSWORD') || undefined,
        },
      },
    );
  }

  async onModuleDestroy(): Promise<void> {
    if (this.worker) {
      await this.worker.close();
    }
  }
}

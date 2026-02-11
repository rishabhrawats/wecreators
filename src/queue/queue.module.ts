import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { IncomingEventsWorker } from './incoming-events.worker';

@Module({
  providers: [QueueService, IncomingEventsWorker],
  exports: [QueueService],
})
export class QueueModule {}

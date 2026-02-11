import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { json } from 'body-parser';
import { ConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { QueueModule } from './queue/queue.module';
import { RequestIdMiddleware } from './common/request-id.middleware';
import { WebhooksModule } from './webhooks/webhooks.module';

@Module({
  imports: [ConfigModule, PrismaModule, QueueModule, WebhooksModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
    consumer
      .apply(
        json({
          verify: (req: any, _res, buffer) => {
            req.rawBody = Buffer.from(buffer);
          },
        }),
      )
      .forRoutes('webhooks/meta');
  }
}

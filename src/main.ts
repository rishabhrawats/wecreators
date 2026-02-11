import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { randomUUID } from 'crypto';
import pinoHttp from 'pino-http';
import { AppModule } from './app.module';
import { appLogger } from './common/logger';
import { PrismaService } from './prisma/prisma.service';

dotenv.config();

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.use(
    pinoHttp({
      logger: appLogger,
      genReqId: (req) => (req.headers['x-request-id'] as string) ?? randomUUID(),
    }),
  );

  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');
}

bootstrap();

import {
  Controller,
  ForbiddenException,
  Get,
  Headers,
  HttpCode,
  Query,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { EnvService } from '../config/env.service';
import { normalizeMetaWebhook } from './normalize-meta-webhook';
import { verifyMetaSignature } from './meta-signature';
import { WebhooksService } from './webhooks.service';

type RawRequest = Request & { rawBody?: Buffer };

@Controller('webhooks')
export class WebhooksController {
  constructor(
    private readonly envService: EnvService,
    private readonly webhooksService: WebhooksService,
  ) {}

  @Get('meta')
  verifyMetaWebhook(
    @Query('hub.mode') mode: string | undefined,
    @Query('hub.verify_token') verifyToken: string | undefined,
    @Query('hub.challenge') challenge: string | undefined,
    @Res() res: Response,
  ): Response {
    if (
      mode === 'subscribe' &&
      verifyToken &&
      verifyToken === this.envService.get('VERIFY_TOKEN') &&
      challenge
    ) {
      return res.status(200).send(challenge);
    }

    throw new ForbiddenException('Webhook verification failed');
  }

  @Post('meta')
  @HttpCode(200)
  async receiveMetaWebhook(
    @Req() req: RawRequest,
    @Headers('x-hub-signature-256') signatureHeader: string | undefined,
  ): Promise<{ status: 'ok' }> {
    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new UnauthorizedException('Missing raw body for signature verification');
    }

    const isSignatureValid = verifyMetaSignature(
      rawBody,
      signatureHeader,
      this.envService.get('APP_SECRET'),
    );

    if (!isSignatureValid) {
      throw new UnauthorizedException('Invalid Meta signature');
    }

    const payload = req.body;
    const events = normalizeMetaWebhook(payload);
    await this.webhooksService.persistAndEnqueue(events);

    return { status: 'ok' };
  }
}

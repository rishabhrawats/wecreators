import { Test } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { WebhooksController } from '../src/webhooks/webhooks.controller';
import { EnvService } from '../src/config/env.service';
import { WebhooksService } from '../src/webhooks/webhooks.service';

describe('WebhooksController GET /webhooks/meta', () => {
  let controller: WebhooksController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [WebhooksController],
      providers: [
        {
          provide: EnvService,
          useValue: {
            get: (key: string) => {
              if (key === 'VERIFY_TOKEN') {
                return 'expected-token';
              }
              if (key === 'APP_SECRET') {
                return 'app-secret';
              }
              return undefined;
            },
          },
        },
        {
          provide: WebhooksService,
          useValue: {
            persistAndEnqueue: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(WebhooksController);
  });

  it('returns challenge when verify token is valid', () => {
    const response = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    } as any;

    controller.verifyMetaWebhook('subscribe', 'expected-token', 'challenge123', response);

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.send).toHaveBeenCalledWith('challenge123');
  });

  it('throws ForbiddenException when verify token is invalid', () => {
    const response = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    } as any;

    expect(() =>
      controller.verifyMetaWebhook('subscribe', 'invalid-token', 'challenge123', response),
    ).toThrow(ForbiddenException);
  });
});

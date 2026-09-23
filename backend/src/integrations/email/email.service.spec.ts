import { Test } from '@nestjs/testing';
import { PinoLogger } from 'nestjs-pino';

import { appConfig, authConfig } from '../../config/configuration';
import { classifyEmailError } from './email.errors';
import { EMAIL_PROVIDER, type EmailProvider } from './email.interface';
import { maskAddress } from './email.masking';
import { EmailService } from './email.service';

describe('EmailService', () => {
  let service: EmailService;
  let provider: jest.Mocked<EmailProvider>;

  const ok = {
    messageId: 'm1',
    accepted: ['ada@example.com'],
    rejected: [],
    provider: 'smtp',
    attempts: 1,
  };

  beforeEach(async () => {
    provider = {
      name: 'smtp',
      isConfigured: jest.fn().mockReturnValue(true),
      send: jest.fn().mockResolvedValue(ok),
      verifyConnection: jest.fn(),
    };

    const logger = {
      setContext: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        EmailService,
        { provide: EMAIL_PROVIDER, useValue: provider },
        { provide: appConfig.KEY, useValue: { env: 'test' } },
        { provide: authConfig.KEY, useValue: { appUrl: 'https://app.test' } },
        { provide: PinoLogger, useValue: logger },
      ],
    }).compile();

    service = moduleRef.get(EmailService);
  });

  describe('retries', () => {
    it('retries a transient failure and reports the attempt count', async () => {
      provider.send
        .mockRejectedValueOnce(Object.assign(new Error('boom'), { code: 'ETIMEDOUT' }))
        .mockResolvedValueOnce(ok);

      const result = await service.send({ to: 'ada@example.com', subject: 'x', text: 'y' });

      expect(provider.send).toHaveBeenCalledTimes(2);
      expect(result?.attempts).toBe(2);
    });

    it('does not retry a rejected password', async () => {
      // Repeating a bad credential wastes time and gets a sending address
      // blocked; no number of retries will fix it.
      provider.send.mockRejectedValue(Object.assign(new Error('nope'), { code: 'EAUTH' }));

      const result = await service.send({ to: 'ada@example.com', subject: 'x', text: 'y' });

      expect(provider.send).toHaveBeenCalledTimes(1);
      expect(result).toBeNull();
    });

    it('does not retry a refused recipient', async () => {
      provider.send.mockRejectedValue(
        Object.assign(new Error('bad address'), { responseCode: 550 }),
      );
      await service.send({ to: 'nobody@example.com', subject: 'x', text: 'y' });
      expect(provider.send).toHaveBeenCalledTimes(1);
    });

    it('gives up after three attempts', async () => {
      provider.send.mockRejectedValue(Object.assign(new Error('flaky'), { code: 'ESOCKET' }));
      const result = await service.send({ to: 'ada@example.com', subject: 'x', text: 'y' });
      expect(provider.send).toHaveBeenCalledTimes(3);
      expect(result).toBeNull();
    });

    it('returns null rather than throwing, so a booking survives a mail failure', async () => {
      // Email is a side effect of a user action, not the action itself.
      provider.send.mockRejectedValue(
        Object.assign(new Error('down'), { code: 'ECONNECTION' }),
      );
      await expect(
        service.send({ to: 'ada@example.com', subject: 'x', text: 'y' }),
      ).resolves.toBeNull();
    });
  });

  describe('templates', () => {
    it('refuses an unknown trigger instead of sending something generic', async () => {
      const result = await service.sendTemplate({ trigger: 'made.up', to: 'ada@example.com' });
      expect(result).toBeNull();
      expect(provider.send).not.toHaveBeenCalled();
    });

    it('renders both an HTML and a plain-text part', async () => {
      await service.sendTemplate({
        trigger: 'account.welcome',
        to: 'ada@example.com',
        vars: { full_name: 'Ada', role: 'parent' },
      });

      const sent = provider.send.mock.calls[0]![0];
      expect(sent.html).toContain('Ada');
      expect(sent.text).toContain('Ada');
      expect(sent.html).toContain('<!DOCTYPE html>');
    });

    it('prefers the database template over the built-in wording', async () => {
      service.useTemplateSource(async () => ({
        subject: 'Admin-edited subject',
        body: 'Admin-edited body for {{full_name}}.',
      }));

      await service.sendTemplate({
        trigger: 'account.welcome',
        to: 'ada@example.com',
        vars: { full_name: 'Ada' },
      });

      const sent = provider.send.mock.calls[0]![0];
      expect(sent.subject).toBe('Admin-edited subject');
      expect(sent.text).toContain('Admin-edited body for Ada.');
    });

    it('falls back to the built-in definition when no row exists', async () => {
      service.useTemplateSource(async () => null);
      await service.sendTemplate({
        trigger: 'account.password_reset',
        to: 'ada@example.com',
        vars: { reset_url: 'https://app.test/r', expiry_minutes: 60 },
      });
      expect(provider.send.mock.calls[0]![0].subject).toBe('Reset your DiaLearn password');
    });

    it('survives a template lookup that throws', async () => {
      service.useTemplateSource(async () => {
        throw new Error('database down');
      });
      const result = await service.sendTemplate({
        trigger: 'account.welcome',
        to: 'ada@example.com',
        vars: { full_name: 'Ada', role: 'parent' },
      });
      expect(result).not.toBeNull();
    });

    it('escapes variable values, so a name cannot inject markup', async () => {
      await service.sendTemplate({
        trigger: 'account.welcome',
        to: 'ada@example.com',
        vars: { full_name: '<script>alert(1)</script>', role: 'parent' },
      });

      const html = provider.send.mock.calls[0]![0].html!;
      expect(html).not.toContain('<script>');
      expect(html).toContain('&lt;script&gt;');
    });

    it('tags the message with its trigger for tracing', async () => {
      await service.sendTemplate({
        trigger: 'payout.sent',
        to: 'tutor@example.com',
        vars: { amount: '100.00', currency: 'USD' },
      });
      expect(provider.send.mock.calls[0]![0].headers).toMatchObject({
        'X-DiaLearn-Trigger': 'payout.sent',
      });
    });
  });
});

describe('classifyEmailError', () => {
  it.each([
    ['EAUTH', false, 'authentication'],
    ['ETIMEDOUT', true, 'timeout'],
    ['ECONNECTION', true, 'connection'],
    ['ECONNREFUSED', true, 'connection'],
    ['EENVELOPE', false, 'recipient'],
  ])('%s -> retryable=%s kind=%s', (code, retryable, kind) => {
    const result = classifyEmailError({ code });
    expect(result.retryable).toBe(retryable);
    expect(result.kind).toBe(kind);
  });

  it('treats 4xx as temporary and 5xx as permanent, per SMTP', () => {
    expect(classifyEmailError({ responseCode: 451 }).retryable).toBe(true);
    expect(classifyEmailError({ responseCode: 552 }).retryable).toBe(false);
  });

  it('never returns a raw provider message', () => {
    const result = classifyEmailError(new Error('535 5.7.8 password for ada@x was rejected'));
    expect(result.summary).not.toContain('password');
  });
});

describe('maskAddress', () => {
  it('keeps the domain and hides the local part', () => {
    // Enough to debug a delivery problem; not a full address sitting in an
    // aggregated log indefinitely.
    expect(maskAddress('ada.lovelace@example.com')).toBe('a***@example.com');
  });

  it('does not crash on a malformed address', () => {
    expect(maskAddress('not-an-address')).toBe('***');
    expect(maskAddress('')).toBe('***');
  });
});

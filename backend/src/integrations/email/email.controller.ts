import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { IsEmail, IsIn, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

import {
  CurrentUser,
  type AuthenticatedUser,
} from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { EmailService } from './email.service';
import { EMAIL_TRIGGERS, type EmailTrigger } from './templates/email-templates';
import type { EmailHealth } from './email.interface';

export class SendTestEmailDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  to!: string;

  /** Restricted to known triggers so this cannot be a generic mail relay. */
  @IsOptional()
  @IsIn(EMAIL_TRIGGERS)
  trigger?: EmailTrigger;
}

/**
 * Email diagnostics.
 *
 * Administrators only. Two reasons this is not open more widely: the health
 * response names the mail host and reports whether authentication succeeded,
 * which is reconnaissance; and the test endpoint sends to an address the
 * caller chooses, which is a mail relay if left unguarded.
 *
 * Developers reach this through the same admin role. The overall provider
 * status is also on the unauthenticated `/health` report, which is enough to
 * see that email is configured without exposing the detail.
 */
@Controller('email')
@Roles('admin')
export class EmailAdminController {
  constructor(private readonly email: EmailService) {}

  /** Connects and authenticates without sending. */
  @Get('health')
  async health(): Promise<EmailHealth & { environment: string }> {
    const health = await this.email.checkHealth();
    return { ...health, environment: this.email.environment };
  }

  /** The trigger keys this deployment can send, for the admin UI. */
  @Get('triggers')
  triggers(): { triggers: readonly string[] } {
    return { triggers: EMAIL_TRIGGERS };
  }

  /**
   * Sends one real message, to prove delivery end to end.
   *
   * Rendered from a real template with placeholder variables rather than
   * free-form content — so it exercises the path production uses, and cannot
   * be used to send arbitrary text to arbitrary people.
   */
  @Post('test')
  @HttpCode(HttpStatus.OK)
  async sendTest(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SendTestEmailDto,
  ): Promise<{ sent: boolean; provider: string; messageId?: string; attempts?: number }> {
    const result = await this.email.sendTemplate({
      trigger: dto.trigger ?? 'account.welcome',
      to: dto.to,
      vars: {
        full_name: 'DiaLearn test',
        role: 'administrator',
        otp_code: '000000',
        expiry_minutes: 10,
        expiry_hours: 24,
        status: 'verified',
        amount: '0.00',
        currency: 'USD',
        subject: 'Test lesson',
        tutor_name: 'Test tutor',
        student_name: 'Test learner',
        starts_at: new Date().toISOString(),
      },
      headers: { 'X-DiaLearn-Test': 'true' },
    });

    return {
      sent: result !== null,
      provider: this.email.providerName,
      ...(result?.messageId ? { messageId: result.messageId } : {}),
      ...(result?.attempts ? { attempts: result.attempts } : {}),
    };
  }
}

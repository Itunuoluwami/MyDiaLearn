import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { RefreshTokenRepository } from '../database/repositories/refresh-token.repository';
import { UserRepository } from '../database/repositories/user.repository';
import { VerificationTokenRepository } from '../database/repositories/verification-token.repository';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PasswordService } from './services/password.service';
import { TokenService } from './services/token.service';

/**
 * Authentication, replacing Supabase GoTrue.
 *
 * Repositories are declared here rather than in DatabaseModule because they
 * belong to this domain: nothing outside auth has any business reading
 * auth.refresh_tokens. JwtModule is registered globally in AppModule, so it is
 * not re-imported.
 */
@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt', session: false })],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenService,
    PasswordService,
    JwtStrategy,
    JwtAuthGuard,
    UserRepository,
    RefreshTokenRepository,
    VerificationTokenRepository,
  ],
  exports: [AuthService, TokenService, PasswordService],
})
export class AuthModule {}

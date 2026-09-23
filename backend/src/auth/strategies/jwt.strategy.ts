import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { jwtConfig, type JwtConfig } from '../../config/configuration';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import type { AccessTokenClaims } from '../interfaces/auth.interface';

/**
 * Access-token strategy.
 *
 * Claims are trusted as-is — no database lookup per request. Roles and
 * permissions were resolved when the token was issued, which is what keeps
 * authorization off the hot path. The trade is staleness bounded by the access
 * token's lifetime; a revoked admin keeps their rights for at most that long,
 * which is why it is minutes rather than days.
 *
 * `ignoreExpiration: false` is the default and is left explicit, because
 * turning it on is a mistake that looks like a convenience.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(@Inject(jwtConfig.KEY) config: JwtConfig) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.secret,
    });
  }

  validate(claims: AccessTokenClaims): AuthenticatedUser {
    // Whatever this returns becomes request.user, which @CurrentUser reads.
    return {
      id: claims.sub,
      email: claims.email,
      roles: claims.roles ?? [],
      permissions: claims.permissions ?? [],
    };
  }
}

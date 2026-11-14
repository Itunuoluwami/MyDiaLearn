import { Strategy } from 'passport-jwt';
import { type JwtConfig } from '../../config/configuration';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import type { AccessTokenClaims } from '../interfaces/auth.interface';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    constructor(config: JwtConfig);
    validate(claims: AccessTokenClaims): AuthenticatedUser;
}
export {};

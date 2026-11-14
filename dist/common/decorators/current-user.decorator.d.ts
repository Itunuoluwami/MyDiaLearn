import type { Request } from 'express';
import type { AppRole } from './roles.decorator';
export interface AuthenticatedUser {
    id: string;
    email: string;
    roles: AppRole[];
    permissions: string[];
}
export type RequestWithUser = Request & {
    user?: AuthenticatedUser;
    requestId?: string;
};
export declare const CurrentUser: (...dataOrPipes: (keyof AuthenticatedUser | import("@nestjs/common").PipeTransform<any, any> | import("@nestjs/common").Type<import("@nestjs/common").PipeTransform<any, any>> | undefined)[]) => ParameterDecorator;
export declare const RequestId: (...dataOrPipes: unknown[]) => ParameterDecorator;

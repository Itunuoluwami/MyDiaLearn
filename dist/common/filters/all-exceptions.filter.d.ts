import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
export interface ApiErrorBody {
    statusCode: number;
    code: string;
    message: string;
    requestId: string;
    timestamp: string;
    path: string;
    details?: unknown;
}
export declare class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger;
    constructor(logger: PinoLogger);
    catch(exception: unknown, host: ArgumentsHost): void;
    private describe;
    private messageOf;
    private codeForStatus;
}

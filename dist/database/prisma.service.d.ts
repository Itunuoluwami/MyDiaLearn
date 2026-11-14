import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PinoLogger } from 'nestjs-pino';
import type { AppConfig, DatabaseConfig } from '../config/configuration';
export declare class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly app;
    private readonly logger;
    private connected;
    private readonly restricted;
    constructor(database: DatabaseConfig, app: AppConfig, logger: PinoLogger);
    private static poolOptions;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    usesRestrictedLogin(): boolean;
    isConnected(): boolean;
    ping(): Promise<void>;
    withUser<T>(userId: string, fn: (tx: Prisma.TransactionClient) => Promise<T>, options?: {
        role?: string;
        timeoutMs?: number;
    }): Promise<T>;
    asAnonymous<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T>;
}

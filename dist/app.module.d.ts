import { MiddlewareConsumer, NestModule, OnModuleInit } from '@nestjs/common';
import type { AppConfig, IntegrationsConfig } from './config/configuration';
export declare class AppModule implements NestModule, OnModuleInit {
    private readonly app;
    private readonly integrations;
    constructor(app: AppConfig, integrations: IntegrationsConfig);
    onModuleInit(): void;
    configure(consumer: MiddlewareConsumer): void;
}

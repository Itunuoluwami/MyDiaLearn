import type { AppConfig, IntegrationsConfig } from '../config/configuration';
import { PrismaService } from '../database/prisma.service';
export type ComponentStatus = 'up' | 'down' | 'not_configured';
export interface HealthReport {
    status: 'ok' | 'degraded';
    service: string;
    version: string;
    env: string;
    uptimeSeconds: number;
    timestamp: string;
    checks: {
        database: {
            status: ComponentStatus;
            latencyMs?: number;
            error?: string;
        };
        integrations: Record<string, {
            adapter: string;
            status: ComponentStatus;
        }>;
    };
}
export declare class HealthService {
    private readonly prisma;
    private readonly app;
    private readonly integrations;
    private readonly startedAt;
    constructor(prisma: PrismaService, app: AppConfig, integrations: IntegrationsConfig);
    report(): Promise<HealthReport>;
    isReady(): Promise<boolean>;
    private checkDatabase;
}

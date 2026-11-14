import type { Response } from 'express';
import { HealthService, type HealthReport } from './health.service';
export declare class HealthController {
    private readonly health;
    constructor(health: HealthService);
    check(): Promise<HealthReport>;
    live(): {
        status: 'ok';
    };
    ready(response: Response): Promise<{
        status: string;
    }>;
}

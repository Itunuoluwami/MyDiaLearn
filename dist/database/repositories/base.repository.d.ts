import { PrismaService } from '../prisma.service';
export declare abstract class BaseRepository {
    protected readonly prisma: PrismaService;
    protected constructor(prisma: PrismaService);
}

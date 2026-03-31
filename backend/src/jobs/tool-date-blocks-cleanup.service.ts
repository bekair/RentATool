import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ToolDateBlocksCleanupService {
  constructor(private readonly prisma: PrismaService) {}

  async cleanupPastDateBlocks(): Promise<{
    deletedCount: number;
    cutoff: string;
  }> {
    const todayUtc = new Date();
    todayUtc.setUTCHours(0, 0, 0, 0);

    const deleted = await this.prisma.toolDateBlock.deleteMany({
      where: {
        date: {
          lt: todayUtc,
        },
      },
    });

    return {
      deletedCount: deleted.count,
      cutoff: todayUtc.toISOString().slice(0, 10),
    };
  }
}

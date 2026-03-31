import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { ToolDateBlocksCleanupService } from './tool-date-blocks-cleanup.service';

function validateJobEnv(config: Record<string, unknown>) {
  const databaseUrl = config.DATABASE_URL;

  if (typeof databaseUrl !== 'string' || !databaseUrl.trim()) {
    throw new Error('Missing required environment variable: DATABASE_URL');
  }

  return config;
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateJobEnv }),
    PrismaModule,
  ],
  providers: [ToolDateBlocksCleanupService],
})
export class JobsModule {}

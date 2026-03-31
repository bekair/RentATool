import { NestFactory } from '@nestjs/core';
import { JobsModule } from '../src/jobs/jobs.module';
import { ToolDateBlocksCleanupService } from '../src/jobs/tool-date-blocks-cleanup.service';

async function main(): Promise<void> {
  const app = await NestFactory.createApplicationContext(JobsModule, {
    logger: ['error', 'warn'],
  });

  try {
    const cleanupService = app.get(ToolDateBlocksCleanupService);
    const result = await cleanupService.cleanupPastDateBlocks();

    console.log(
      `[cleanup-tool-date-blocks] deleted=${result.deletedCount} cutoff=${result.cutoff} (UTC)`,
    );
  } finally {
    await app.close();
  }
}

main().catch((error) => {
  console.error('[cleanup-tool-date-blocks] failed', error);
  process.exitCode = 1;
});

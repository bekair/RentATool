import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ToolsService } from '../src/tools/tools.service';

async function main(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const toolsService = app.get(ToolsService);
    const result = await toolsService.cleanupPastDateBlocks();

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

import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';

async function generateOpenApi() {
  const app = await NestFactory.create(AppModule, { logger: false });
  const config = new DocumentBuilder()
    .setTitle('Rent a Tool API')
    .setDescription('API documentation for the Rent a Tool platform')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const outputDir = join(process.cwd(), '..', 'openapi');
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(
    join(outputDir, 'openapi.json'),
    JSON.stringify(document, null, 2),
    'utf8',
  );

  await app.close();
  // eslint-disable-next-line no-console
  console.log('Generated openapi/openapi.json');
}

generateOpenApi().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});

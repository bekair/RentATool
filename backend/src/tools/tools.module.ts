import { Module } from '@nestjs/common';
import { ToolsService } from './tools.service';
import { ToolsController } from './tools.controller';
import { CountriesModule } from '../countries/countries.module';

@Module({
  imports: [CountriesModule],
  controllers: [ToolsController],
  providers: [ToolsService],
})
export class ToolsModule {}

import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Request,
    Query,
} from '@nestjs/common';
import { ToolsService } from './tools.service';
import { CreateToolDto, UpdateToolDto } from './dto/tool.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tools')
export class ToolsController {
    constructor(private readonly toolsService: ToolsService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    create(@Request() req, @Body() createToolDto: CreateToolDto) {
        return this.toolsService.create(req.user.id, createToolDto);
    }

    @Get()
    findAll(@Query('exclude') exclude?: string) {
        return this.toolsService.findAll(exclude);
    }

    @Get('mine')
    @UseGuards(JwtAuthGuard)
    findMine(@Request() req) {
        return this.toolsService.findByOwner(req.user.id);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.toolsService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    update(
        @Param('id') id: string,
        @Request() req,
        @Body() updateToolDto: UpdateToolDto,
    ) {
        return this.toolsService.update(id, req.user.id, updateToolDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    remove(@Param('id') id: string, @Request() req) {
        return this.toolsService.remove(id, req.user.id);
    }
}

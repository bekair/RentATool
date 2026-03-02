import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Get()
    async findAll(@Req() req: Request, @Res() res: Response) {
        const etag = await this.categoriesService.getEtag();

        if (req.headers['if-none-match'] === etag) {
            return res.status(304).send();
        }

        const categories = await this.categoriesService.findAll();

        return res
            .set('ETag', etag)
            .set('Cache-Control', 'public, max-age=3600')
            .json(categories);
    }

    @Get(':id/subcategories')
    findSubcategories(@Param('id') id: string) {
        return this.categoriesService.findSubcategories(id);
    }
}

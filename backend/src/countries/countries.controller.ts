import { Controller, Get, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { CountriesService } from './countries.service';

@Controller('countries')
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Get()
  async findAll(@Req() req: Request, @Res() res: Response) {
    const etag = await this.countriesService.getEtag();

    // If client has the same version, skip the body entirely
    if (req.headers['if-none-match'] === etag) {
      return res.status(304).send();
    }

    const countries = await this.countriesService.findAll();

    return res
      .set('ETag', etag)
      .set('Cache-Control', 'public, max-age=3600') // also allow CDN/proxy caching for 1h
      .json(countries);
  }
}

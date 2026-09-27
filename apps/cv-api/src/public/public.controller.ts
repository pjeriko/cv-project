import { Controller, Get, Param } from '@nestjs/common';
import { PublicService } from './public.service.js';

@Controller('public/cv')
export class PublicController {
  constructor(private publicService: PublicService) {}

  @Get(':slug')
  getCvByVariant(@Param('slug') slug: string) {
    return this.publicService.getCvByVariant(slug);
  }
}

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
} from '@nestjs/common';
import { VariantService } from './variant.service.js';
import { CreateVariantDto } from './dto/create-variant.dto.js';
import { UpdateVariantDto } from './dto/update-variant.dto.js';

@Controller('variants')
export class VariantController {
  constructor(private variantService: VariantService) {}

  @Get()
  findAll() {
    return this.variantService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.variantService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateVariantDto) {
    return this.variantService.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateVariantDto) {
    return this.variantService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.variantService.remove(id);
  }
}

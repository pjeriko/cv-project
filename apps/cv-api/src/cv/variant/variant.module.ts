import { Module } from '@nestjs/common';
import { VariantController } from './variant.controller.js';
import { VariantService } from './variant.service.js';

@Module({
  controllers: [VariantController],
  providers: [VariantService],
})
export class VariantModule {}

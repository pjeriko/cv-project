import { Module } from '@nestjs/common';
import { VariantModule } from './variant/variant.module.js';

@Module({
  imports: [VariantModule],
})
export class CvModule {}

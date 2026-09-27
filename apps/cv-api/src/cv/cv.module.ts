import { Module } from '@nestjs/common';
import { VariantModule } from './variant/variant.module.js';
import { ProfileModule } from './profile/profile.module.js';

@Module({
  imports: [VariantModule, ProfileModule],
})
export class CvModule {}

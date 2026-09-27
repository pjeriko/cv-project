// src/cv/cv.module.ts (mis à jour)
import { Module } from '@nestjs/common';
import { VariantModule } from './variant/variant.module.js';
import { ProfileModule } from './profile/profile.module.js';
import { SkillModule } from './skill/skill.module.js';

@Module({
  imports: [VariantModule, ProfileModule, SkillModule],
})
export class CvModule {}

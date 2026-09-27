// src/cv/skill/skill.module.ts
import { Module } from '@nestjs/common';
import { SkillController } from './skill.controller.js';
import { SkillService } from './skill.service.js';

@Module({
  controllers: [SkillController],
  providers: [SkillService],
})
export class SkillModule {}

// src/cv/skill/dto/update-skill.dto.ts (version corrigée)
import { PartialType, OmitType } from '@nestjs/mapped-types';
import { IsOptional, IsArray, IsInt } from 'class-validator';
import { CreateSkillDto } from './create-skill.dto.js';

export class UpdateSkillDto extends PartialType(
  OmitType(CreateSkillDto, ['variantIds'] as const),
) {
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  variantIds?: number[];
}

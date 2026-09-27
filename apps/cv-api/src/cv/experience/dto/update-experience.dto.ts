import { PartialType, OmitType } from '@nestjs/mapped-types';
import { IsOptional, IsArray, IsInt } from 'class-validator';
import { CreateExperienceDto } from './create-experience.dto.js';

export class UpdateExperienceDto extends PartialType(
  OmitType(CreateExperienceDto, ['variantIds'] as const),
) {
  @IsOptional() @IsArray() @IsInt({ each: true }) variantIds?: number[];
}

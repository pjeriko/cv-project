import { PartialType, OmitType } from '@nestjs/mapped-types';
import { IsOptional, IsArray, IsInt } from 'class-validator';
import { CreateProjectDto } from './create-project.dto.js';

export class UpdateProjectDto extends PartialType(
  OmitType(CreateProjectDto, ['variantIds'] as const),
) {
  @IsOptional() @IsArray() @IsInt({ each: true }) variantIds?: number[];
}

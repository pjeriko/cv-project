import { PartialType, OmitType } from '@nestjs/mapped-types';
import { IsOptional, IsArray, IsInt, IsDateString } from 'class-validator';
import { CreateEducationDto } from './create-education.dto.js';

export class UpdateEducationDto extends PartialType(
  OmitType(CreateEducationDto, ['variantIds', 'endDate'] as const),
) {
  @IsOptional() @IsArray() @IsInt({ each: true }) variantIds?: number[];

  @IsOptional() @IsDateString() endDate?: string | null;
}

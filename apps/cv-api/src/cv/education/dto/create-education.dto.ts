import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsArray,
  IsInt,
} from 'class-validator';

export class CreateEducationDto {
  @IsString() @IsNotEmpty() degree: string;
  @IsString() @IsNotEmpty() institution: string;
  @IsDateString() startDate: string;
  @IsOptional() @IsDateString() endDate?: string;
  @IsOptional() @IsArray() @IsInt({ each: true }) variantIds?: number[];
}

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsArray,
  IsInt,
} from 'class-validator';

export class CreateExperienceDto {
  @IsString() @IsNotEmpty() position: string;
  @IsString() @IsNotEmpty() company: string;
  @IsDateString() startDate: string;
  @IsOptional() @IsDateString() endDate?: string;
  @IsString() @IsNotEmpty() description: string;
  @IsOptional() @IsArray() @IsInt({ each: true }) variantIds?: number[];
}

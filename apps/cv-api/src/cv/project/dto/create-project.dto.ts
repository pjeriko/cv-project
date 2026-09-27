import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsArray,
  IsInt,
} from 'class-validator';

export class CreateProjectDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() description: string;
  @IsOptional() @IsUrl() url?: string;
  @IsOptional() @IsArray() @IsInt({ each: true }) variantIds?: number[];
}

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
  @IsOptional()
  @IsUrl({ require_protocol: true, protocols: ['http', 'https'] })
  url?: string;
  @IsOptional() @IsInt() position?: number;
  @IsOptional() @IsArray() @IsInt({ each: true }) variantIds?: number[];
}

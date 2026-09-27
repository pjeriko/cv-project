import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateVariantDto {
  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsNotEmpty()
  label: string;

  @IsOptional()
  @IsString()
  summary?: string;
}

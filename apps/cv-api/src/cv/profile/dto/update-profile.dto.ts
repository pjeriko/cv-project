// src/cv/profile/dto/update-profile.dto.ts
import { IsString, IsOptional, IsEmail, IsUrl } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true, protocols: ['http', 'https'] })
  linkedin?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true, protocols: ['http', 'https'] })
  github?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true, protocols: ['http', 'https'] })
  website?: string;
}

import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';

@Controller('profile')
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Get()
  findOne() {
    return this.profileService.findOne();
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  update(@Body() dto: UpdateProfileDto) {
    return this.profileService.update(dto);
  }
}

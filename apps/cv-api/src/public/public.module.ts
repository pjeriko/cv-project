import { Module } from '@nestjs/common';
import { PublicController } from './public.controller.js';
import { PublicService } from './public.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { ProfileModule } from '../cv/profile/profile.module.js';

@Module({
  imports: [PrismaModule, ProfileModule],
  controllers: [PublicController],
  providers: [PublicService],
})
export class PublicModule {}

import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module.js';
import { CvModule } from './cv/cv.module.js';
import { AuthModule } from './auth/auth.module.js';
import { PublicModule } from './public/public.module.js';

@Module({
  imports: [PrismaModule, CvModule, AuthModule, PublicModule],
})
export class AppModule {}

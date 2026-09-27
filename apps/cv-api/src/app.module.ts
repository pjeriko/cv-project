import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { CvModule } from './cv/cv.module.js';
import { AuthModule } from './auth/auth.module.js';
import { PublicModule } from './public/public.module.js';

@Module({
  imports: [PrismaModule, CvModule, AuthModule, PublicModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

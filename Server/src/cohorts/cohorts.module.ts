import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { CohortsController } from './cohorts.controller.js';
import { CohortsService } from './cohorts.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [CohortsController],
  providers: [CohortsService],
})
export class CohortsModule {}

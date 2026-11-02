import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { DiscussionsController } from './discussions.controller.js';
import { DiscussionsService } from './discussions.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [DiscussionsController],
  providers: [DiscussionsService],
})
export class DiscussionsModule {}

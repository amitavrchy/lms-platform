import { Global, Module } from '@nestjs/common';
import { EngagementController } from './engagement.controller.js';
import { EngagementService } from './engagement.service.js';

@Global()
@Module({
  controllers: [EngagementController],
  providers: [EngagementService],
  exports: [EngagementService],
})
export class EngagementModule {}

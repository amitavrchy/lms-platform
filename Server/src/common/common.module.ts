import { Global, Module } from '@nestjs/common';
import { AccessService } from './services/access.service.js';

@Global()
@Module({
  providers: [AccessService],
  exports: [AccessService],
})
export class CommonModule {}

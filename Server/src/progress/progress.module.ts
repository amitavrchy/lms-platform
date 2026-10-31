import { Module } from '@nestjs/common';
import { CertificatesModule } from '../certificates/certificates.module.js';
import { ProgressController } from './progress.controller.js';
import { ProgressService } from './progress.service.js';

@Module({
  imports: [CertificatesModule],
  controllers: [ProgressController],
  providers: [ProgressService],
})
export class ProgressModule {}

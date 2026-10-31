import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from './admin/admin.module.js';
import { AiModule } from './ai/ai.module.js';
import { AnalyticsModule } from './analytics/analytics.module.js';
import { AuthModule } from './auth/auth.module.js';
import { CatalogModule } from './catalog/catalog.module.js';
import { CertificatesModule } from './certificates/certificates.module.js';
import { CommonModule } from './common/common.module.js';
import { EngagementModule } from './engagement/engagement.module.js';
import { EnrollmentsModule } from './enrollments/enrollments.module.js';
import { PathsModule } from './paths/paths.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ProgressModule } from './progress/progress.module.js';
import { QuizzesModule } from './quizzes/quizzes.module.js';
import { StudioModule } from './studio/studio.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    CommonModule,
    EngagementModule,
    AuthModule,
    CatalogModule,
    EnrollmentsModule,
    ProgressModule,
    QuizzesModule,
    CertificatesModule,
    StudioModule,
    PathsModule,
    AnalyticsModule,
    AiModule,
    AdminModule,
  ],
})
export class AppModule {}

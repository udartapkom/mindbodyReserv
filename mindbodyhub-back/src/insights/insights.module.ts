import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageModule } from '../storage/storage.module';
import { Insight } from './entities/insight.entity';
import { InsightsController } from './insights.controller';
import { InsightsUploadController } from './insights-upload.controller';
import { InsightsService } from './insights.service';

@Module({
  imports: [TypeOrmModule.forFeature([Insight]), StorageModule],
  controllers: [InsightsController, InsightsUploadController],
  providers: [InsightsService],
  exports: [InsightsService],
})
export class InsightsModule {}

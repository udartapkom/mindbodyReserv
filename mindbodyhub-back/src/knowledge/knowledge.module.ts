import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageModule } from '../storage/storage.module';
import { KnowledgeArticle } from './entities/knowledge-article.entity';
import { KnowledgeController } from './knowledge.controller';
import { KnowledgeUploadController } from './knowledge-upload.controller';
import { KnowledgeService } from './knowledge.service';

@Module({
  imports: [TypeOrmModule.forFeature([KnowledgeArticle]), StorageModule],
  controllers: [KnowledgeController, KnowledgeUploadController],
  providers: [KnowledgeService],
  exports: [KnowledgeService],
})
export class KnowledgeModule {}

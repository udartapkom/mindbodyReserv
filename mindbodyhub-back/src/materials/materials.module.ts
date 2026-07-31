import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageModule } from '../storage/storage.module';
import { TariffsModule } from '../tariffs/tariffs.module';
import { Material } from './entities/material.entity';
import { UserReadingProgress } from './entities/user-reading-progress.entity';
import { MaterialsController } from './materials.controller';
import { MaterialsUploadController } from './materials-upload.controller';
import { MaterialsService } from './materials.service';
import { ReadingProgressService } from './reading-progress.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Material, UserReadingProgress]),
    StorageModule,
    TariffsModule,
  ],
  controllers: [MaterialsController, MaterialsUploadController],
  providers: [MaterialsService, ReadingProgressService],
  exports: [MaterialsService, ReadingProgressService],
})
export class MaterialsModule {}

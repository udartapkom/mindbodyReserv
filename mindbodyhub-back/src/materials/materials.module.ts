import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageModule } from '../storage/storage.module';
import { TariffsModule } from '../tariffs/tariffs.module';
import { Material } from './entities/material.entity';
import { MaterialsController } from './materials.controller';
import { MaterialsUploadController } from './materials-upload.controller';
import { MaterialsService } from './materials.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Material]),
    StorageModule,
    TariffsModule,
  ],
  controllers: [MaterialsController, MaterialsUploadController],
  providers: [MaterialsService],
  exports: [MaterialsService],
})
export class MaterialsModule {}

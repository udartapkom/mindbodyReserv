import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { Roles } from '../auth/decorators/roles.decorator';
import { StorageService } from '../storage/storage.service';
import { UserRole } from '../users/user-role.enum';

type UploadedImageFile = {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
};

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const MAX_SIZE_BYTES = 8 * 1024 * 1024;

@Controller('materials')
export class MaterialsUploadController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @Roles(UserRole.ADMIN)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_SIZE_BYTES },
    }),
  )
  async upload(
    @UploadedFile() file?: UploadedImageFile,
  ): Promise<{ key: string; url: string; contentType: string }> {
    if (!file) {
      throw new BadRequestException('Файл не передан');
    }

    if (!ALLOWED_MIME.has(file.mimetype)) {
      throw new BadRequestException(
        'Допустимы только изображения: jpeg, png, webp, gif',
      );
    }

    const extension = extname(file.originalname).toLowerCase() || '.bin';
    const key = `materials/${randomUUID()}${extension}`;
    const bucket = this.storageService.getMaterialsBucket();

    const url = await this.storageService.uploadFile({
      bucket,
      key,
      body: file.buffer,
      contentType: file.mimetype,
      isPublic: true,
    });

    return {
      key,
      url,
      contentType: file.mimetype,
    };
  }
}

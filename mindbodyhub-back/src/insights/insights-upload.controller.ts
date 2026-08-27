import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'crypto';
import { Roles } from '../auth/decorators/roles.decorator';
import { detectImageFromBuffer } from '../common/utils/image-magic.util';
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

@Controller('insights')
export class InsightsUploadController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
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

    const detected = detectImageFromBuffer(file.buffer);
    if (!detected || !ALLOWED_MIME.has(detected.mime)) {
      throw new BadRequestException(
        'Допустимы только изображения: jpeg, png, webp, gif',
      );
    }

    const key = `insights/${randomUUID()}${detected.extension}`;
    const bucket = this.storageService.getMaterialsBucket();

    const url = await this.storageService.uploadFile({
      bucket,
      key,
      body: file.buffer,
      contentType: detected.mime,
      isPublic: true,
    });

    return {
      key,
      url,
      contentType: detected.mime,
    };
  }
}

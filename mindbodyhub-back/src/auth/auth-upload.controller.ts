import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import type { AuthUser } from './decorators/current-user.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthService } from './auth.service';
import { UserProfileResponse } from './auth.types';

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
]);

const MAX_SIZE_BYTES = 4 * 1024 * 1024;

@Controller('auth')
export class AuthUploadController {
  constructor(private readonly authService: AuthService) {}

  @Post('me/avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_SIZE_BYTES },
    }),
  )
  uploadAvatar(
    @CurrentUser() user: AuthUser,
    @UploadedFile() file?: UploadedImageFile,
  ): Promise<UserProfileResponse> {
    if (!file) {
      throw new BadRequestException('Файл не передан');
    }

    if (!ALLOWED_MIME.has(file.mimetype)) {
      throw new BadRequestException(
        'Допустимы только изображения: jpeg, png, webp',
      );
    }

    const extension = extname(file.originalname).toLowerCase() || '.jpg';

    return this.authService.uploadAvatar(user.id, {
      buffer: file.buffer,
      contentType: file.mimetype,
      extension,
    });
  }
}

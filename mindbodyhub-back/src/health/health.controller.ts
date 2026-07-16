import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { StorageService } from '../storage/storage.service';

@Controller('health')
export class HealthController {
  constructor(private readonly storageService: StorageService) {}

  @Public()
  @Get()
  async check() {
    let storage: 'ok' | 'error' = 'ok';

    try {
      await this.storageService.checkBuckets(
        this.storageService.getAvatarsBucket(),
        this.storageService.getMaterialsBucket(),
      );
    } catch {
      storage = 'error';
    }

    return {
      status: storage === 'ok' ? 'ok' : 'degraded',
      storage,
    };
  }
}

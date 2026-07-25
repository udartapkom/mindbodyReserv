import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateSupportLinksDto } from './dto/update-support-links.dto';
import { SiteSettings } from './entities/site-settings.entity';
import {
  DEFAULT_SUPPORT_LINKS,
  SupportLinksDto,
} from './settings.types';

const SETTINGS_ROW_ID = 1;

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(
    @InjectRepository(SiteSettings)
    private readonly settingsRepository: Repository<SiteSettings>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.ensureDefaults();
  }

  async ensureDefaults(): Promise<SiteSettings> {
    const existing = await this.settingsRepository.findOne({
      where: { id: SETTINGS_ROW_ID },
    });

    if (existing) {
      return existing;
    }

    const created = this.settingsRepository.create({
      id: SETTINGS_ROW_ID,
      supportTelegramUrl: DEFAULT_SUPPORT_LINKS.telegram,
      supportVkUrl: DEFAULT_SUPPORT_LINKS.vk,
      supportMaxUrl: DEFAULT_SUPPORT_LINKS.max,
    });

    return this.settingsRepository.save(created);
  }

  async getSupportLinks(): Promise<SupportLinksDto> {
    const settings = await this.ensureDefaults();
    return this.toDto(settings);
  }

  async updateSupportLinks(dto: UpdateSupportLinksDto): Promise<SupportLinksDto> {
    const settings = await this.ensureDefaults();
    settings.supportTelegramUrl = dto.telegram.trim();
    settings.supportVkUrl = dto.vk.trim();
    settings.supportMaxUrl = dto.max.trim();
    const saved = await this.settingsRepository.save(settings);
    return this.toDto(saved);
  }

  private toDto(settings: SiteSettings): SupportLinksDto {
    return {
      telegram: settings.supportTelegramUrl,
      vk: settings.supportVkUrl,
      max: settings.supportMaxUrl,
    };
  }
}

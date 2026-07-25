import { Body, Controller, Get, Put } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user-role.enum';
import { UpdateSupportLinksDto } from './dto/update-support-links.dto';
import { SettingsService } from './settings.service';
import { SupportLinksDto } from './settings.types';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Public()
  @Get('support-links')
  getSupportLinks(): Promise<SupportLinksDto> {
    return this.settingsService.getSupportLinks();
  }

  @Put('support-links')
  @Roles(UserRole.ADMIN)
  updateSupportLinks(
    @Body() dto: UpdateSupportLinksDto,
  ): Promise<SupportLinksDto> {
    return this.settingsService.updateSupportLinks(dto);
  }
}

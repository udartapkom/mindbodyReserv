import { Controller, DefaultValuePipe, Get, ParseIntPipe, Query } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user-role.enum';
import {
  DbStatusDto,
  SystemLogsDto,
  SystemOverviewDto,
  SystemService,
} from './system.service';

@Controller('system')
@Roles(UserRole.ADMIN)
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Get('overview')
  getOverview(): Promise<SystemOverviewDto> {
    return this.systemService.getOverview();
  }

  @Get('logs')
  getLogs(
    @Query('lines', new DefaultValuePipe(100), ParseIntPipe) lines: number,
  ): Promise<SystemLogsDto> {
    return this.systemService.getApiLogs(lines);
  }

  @Get('db-status')
  getDbStatus(): Promise<DbStatusDto> {
    return this.systemService.getDbStatus();
  }
}

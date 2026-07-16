import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user-role.enum';
import { CreateTariffDto } from './dto/create-tariff.dto';
import { UpdateTariffDto } from './dto/update-tariff.dto';
import { TariffDto, toTariffDto } from './tariff.mapper';
import { TariffsService } from './tariffs.service';

@Controller('tariffs')
export class TariffsController {
  constructor(private readonly tariffsService: TariffsService) {}

  /** Public list of active tariffs for the site */
  @Public()
  @Get('public')
  async findPublic(): Promise<TariffDto[]> {
    const tariffs = await this.tariffsService.findActive();
    return tariffs.map(toTariffDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  async findAll(): Promise<TariffDto[]> {
    const tariffs = await this.tariffsService.findAll();
    return tariffs.map(toTariffDto);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<TariffDto> {
    const tariff = await this.tariffsService.findById(id);
    if (!tariff) {
      throw new NotFoundException('Тариф не найден');
    }
    return toTariffDto(tariff);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Body() dto: CreateTariffDto): Promise<TariffDto> {
    const tariff = await this.tariffsService.create(dto);
    return toTariffDto(tariff);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTariffDto,
  ): Promise<TariffDto> {
    const tariff = await this.tariffsService.update(id, dto);
    return toTariffDto(tariff);
  }

  @Patch(':id/activate')
  @Roles(UserRole.ADMIN)
  async activate(@Param('id', ParseUUIDPipe) id: string): Promise<TariffDto> {
    const tariff = await this.tariffsService.setActive(id, true);
    return toTariffDto(tariff);
  }

  @Patch(':id/deactivate')
  @Roles(UserRole.ADMIN)
  async deactivate(@Param('id', ParseUUIDPipe) id: string): Promise<TariffDto> {
    const tariff = await this.tariffsService.setActive(id, false);
    return toTariffDto(tariff);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ success: true }> {
    await this.tariffsService.remove(id);
    return { success: true };
  }
}

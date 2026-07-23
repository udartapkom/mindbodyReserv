import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser, type AuthUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user-role.enum';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import {
  FREE_ACCESS_TYPE,
  MaterialStatus,
  REGISTERED_ACCESS_TYPE,
} from './material.types';
import { MaterialDto, toMaterialDto } from './material.mapper';
import { MaterialsService } from './materials.service';

@Controller('materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  /**
   * Public catalog.
   * - anonymous: only free
   * - authenticated free: free + registered
   * - authenticated with paid tariff: free + registered + ladder up to user.tariff
   * - ?forTariff=... optional override (debug / explicit)
   */
  @Public()
  @Get('public')
  async findPublic(
    @Query('forTariff') forTariff?: string,
    @CurrentUser() user?: AuthUser | null,
  ): Promise<MaterialDto[]> {
    const materials = await this.materialsService.findPublishedForAccess({
      forTariff,
      userTariff: user?.tariff,
      isAuthenticated: Boolean(user),
    });
    return materials.map(toMaterialDto);
  }

  @Public()
  @Get('public/:slug')
  async findPublicBySlug(
    @Param('slug') slug: string,
    @Query('forTariff') forTariff?: string,
    @CurrentUser() user?: AuthUser | null,
  ): Promise<MaterialDto> {
    const material = await this.materialsService.findBySlug(slug);
    if (!material || material.status !== MaterialStatus.PUBLISHED) {
      throw new NotFoundException('Материал не найден');
    }

    const access = {
      forTariff,
      userTariff: user?.tariff,
      isAuthenticated: Boolean(user),
    };

    if (this.materialsService.isAccessible(material, access)) {
      return toMaterialDto(material);
    }

    if (material.tariffType === REGISTERED_ACCESS_TYPE) {
      throw new ForbiddenException(
        'Материал доступен только зарегистрированным пользователям',
      );
    }

    if (material.tariffType !== FREE_ACCESS_TYPE) {
      throw new ForbiddenException('Материал доступен по тарифу');
    }

    throw new NotFoundException('Материал не найден');
  }

  @Get()
  @Roles(UserRole.ADMIN)
  async findAll(): Promise<MaterialDto[]> {
    const materials = await this.materialsService.findAll();
    return materials.map(toMaterialDto);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<MaterialDto> {
    const material = await this.materialsService.findById(id);
    if (!material) {
      throw new NotFoundException('Материал не найден');
    }
    return toMaterialDto(material);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Body() dto: CreateMaterialDto): Promise<MaterialDto> {
    const material = await this.materialsService.create(dto);
    return toMaterialDto(material);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMaterialDto,
  ): Promise<MaterialDto> {
    const material = await this.materialsService.update(id, dto);
    return toMaterialDto(material);
  }

  @Patch(':id/publish')
  @Roles(UserRole.ADMIN)
  async publish(@Param('id', ParseUUIDPipe) id: string): Promise<MaterialDto> {
    const material = await this.materialsService.publish(id);
    return toMaterialDto(material);
  }

  @Patch(':id/unpublish')
  @Roles(UserRole.ADMIN)
  async unpublish(@Param('id', ParseUUIDPipe) id: string): Promise<MaterialDto> {
    const material = await this.materialsService.unpublish(id);
    return toMaterialDto(material);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ success: true }> {
    await this.materialsService.remove(id);
    return { success: true };
  }
}

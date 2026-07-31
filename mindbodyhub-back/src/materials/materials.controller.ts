import {
  BadRequestException,
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
  Put,
  Query,
} from '@nestjs/common';
import { CurrentUser, type AuthUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  canAccessMaterialShelf,
  isPaidTariffShelf,
} from '../common/tariff/access.types';
import { UserRole } from '../users/user-role.enum';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpsertReadingProgressDto } from './dto/upsert-reading-progress.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import {
  FREE_ACCESS_TYPE,
  MaterialStatus,
  REGISTERED_ACCESS_TYPE,
} from './material.types';
import { MaterialDto, toMaterialDto } from './material.mapper';
import { MaterialsService } from './materials.service';
import {
  ReadingProgressDto,
  ReadingProgressService,
} from './reading-progress.service';

@Controller('materials')
export class MaterialsController {
  constructor(
    private readonly materialsService: MaterialsService,
    private readonly readingProgressService: ReadingProgressService,
  ) {}

  /** Recent unfinished reading positions for the current user. */
  @Get('reading-progress')
  async listReadingProgress(
    @CurrentUser() user: AuthUser,
  ): Promise<ReadingProgressDto[]> {
    return this.readingProgressService.listRecent(user.id);
  }

  @Get('reading-progress/:materialId')
  async getReadingProgress(
    @Param('materialId', ParseUUIDPipe) materialId: string,
    @CurrentUser() user: AuthUser,
  ): Promise<ReadingProgressDto | null> {
    return this.readingProgressService.getOne(user.id, materialId);
  }

  @Put('reading-progress')
  async upsertReadingProgress(
    @Body() dto: UpsertReadingProgressDto,
    @CurrentUser() user: AuthUser,
  ): Promise<ReadingProgressDto> {
    return this.readingProgressService.upsert(
      user.id,
      dto.materialId,
      dto.scrollRatio,
    );
  }

  /**
   * Public catalog.
   * - ?tariffType=… — exact shelf (strict). free is always public.
   * - without tariffType: ladder access
   * - ?forTariff=... optional override (debug / explicit)
   */
  @Public()
  @Get('public')
  async findPublic(
    @Query('forTariff') forTariff?: string,
    @Query('tariffType') tariffType?: string,
    @CurrentUser() user?: AuthUser | null,
  ): Promise<MaterialDto[]> {
    const access = {
      forTariff,
      userTariff: user?.tariff,
      isAuthenticated: Boolean(user),
    };

    const exactType = tariffType?.trim();
    if (exactType) {
      if (exactType === FREE_ACCESS_TYPE) {
        const materials =
          await this.materialsService.findPublishedExact(FREE_ACCESS_TYPE);
        return materials.map(toMaterialDto);
      }

      if (!canAccessMaterialShelf(exactType, access)) {
        throw new ForbiddenException(
          'Материалы этого раздела доступны по тарифу',
        );
      }

      const materials =
        await this.materialsService.findPublishedExact(exactType);
      return materials.map(toMaterialDto);
    }

    const materials = await this.materialsService.findPublishedForAccess(access);
    return materials.map(toMaterialDto);
  }

  /** Paid cabinet shelves — exact tariffType only (trial|popular|vip). */
  @Get('cabinet/:tariffType')
  async findCabinetShelf(
    @Param('tariffType') tariffType: string,
    @CurrentUser() user: AuthUser,
  ): Promise<MaterialDto[]> {
    const type = tariffType.trim();
    if (!isPaidTariffShelf(type)) {
      throw new BadRequestException(
        'Раздел материалов: укажите trial, popular или vip',
      );
    }

    if (
      !canAccessMaterialShelf(type, {
        isAuthenticated: true,
        userTariff: user.tariff,
      })
    ) {
      throw new ForbiddenException('Раздел доступен на более высоком тарифе');
    }

    const materials = await this.materialsService.findPublishedExact(type);
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
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async findAll(): Promise<MaterialDto[]> {
    const materials = await this.materialsService.findAll();
    return materials.map(toMaterialDto);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<MaterialDto> {
    const material = await this.materialsService.findById(id);
    if (!material) {
      throw new NotFoundException('Материал не найден');
    }
    return toMaterialDto(material);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async create(@Body() dto: CreateMaterialDto): Promise<MaterialDto> {
    const material = await this.materialsService.create(dto);
    return toMaterialDto(material);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMaterialDto,
  ): Promise<MaterialDto> {
    const material = await this.materialsService.update(id, dto);
    return toMaterialDto(material);
  }

  @Patch(':id/publish')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async publish(@Param('id', ParseUUIDPipe) id: string): Promise<MaterialDto> {
    const material = await this.materialsService.publish(id);
    return toMaterialDto(material);
  }

  @Patch(':id/unpublish')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async unpublish(@Param('id', ParseUUIDPipe) id: string): Promise<MaterialDto> {
    const material = await this.materialsService.unpublish(id);
    return toMaterialDto(material);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ success: true }> {
    await this.materialsService.remove(id);
    return { success: true };
  }
}

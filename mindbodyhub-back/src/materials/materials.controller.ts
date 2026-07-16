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
  Query,
} from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user-role.enum';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { FREE_ACCESS_TYPE, MaterialStatus } from './material.types';
import { MaterialDto, toMaterialDto } from './material.mapper';
import { MaterialsService } from './materials.service';

@Controller('materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  /**
   * Public catalog.
   * - without query: only free materials
   * - ?forTariff=popular: free + materials for that tariff type
   */
  @Public()
  @Get('public')
  async findPublic(
    @Query('forTariff') forTariff?: string,
  ): Promise<MaterialDto[]> {
    const materials = await this.materialsService.findPublishedForAccess(forTariff);
    return materials.map(toMaterialDto);
  }

  @Public()
  @Get('public/:slug')
  async findPublicBySlug(
    @Param('slug') slug: string,
    @Query('forTariff') forTariff?: string,
  ): Promise<MaterialDto> {
    const material = await this.materialsService.findBySlug(slug);
    if (!material || material.status !== MaterialStatus.PUBLISHED) {
      throw new NotFoundException('Материал не найден');
    }

    const allowed =
      material.tariffType === FREE_ACCESS_TYPE ||
      (forTariff?.trim() && material.tariffType === forTariff.trim());

    if (!allowed) {
      throw new NotFoundException('Материал не найден');
    }

    return toMaterialDto(material);
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

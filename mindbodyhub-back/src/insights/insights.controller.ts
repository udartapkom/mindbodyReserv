import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user-role.enum';
import { CreateInsightDto } from './dto/create-insight.dto';
import { UpdateInsightDto } from './dto/update-insight.dto';
import {
  InsightDto,
  InsightListItemDto,
  toInsightDto,
  toInsightListItemDto,
} from './insight.mapper';
import { InsightsService } from './insights.service';

export type InsightsPageDto = {
  items: InsightListItemDto[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

@Controller('insights')
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  /** Cabinet feed — any authenticated user (all tariffs). */
  @Get('cabinet')
  async findCabinet(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<InsightsPageDto> {
    const result = await this.insightsService.findPublishedPage(page, limit);
    return {
      items: result.items.map(toInsightListItemDto),
      total: result.total,
      page: result.page,
      limit: result.limit,
      hasMore: result.hasMore,
    };
  }

  @Get('cabinet/:slug')
  async findCabinetBySlug(@Param('slug') slug: string): Promise<InsightDto> {
    const insight = await this.insightsService.findPublishedBySlug(slug);
    if (!insight) {
      throw new NotFoundException('Инсайт не найден');
    }
    return toInsightDto(insight);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async findAll(): Promise<InsightDto[]> {
    const insights = await this.insightsService.findAll();
    return insights.map(toInsightDto);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<InsightDto> {
    const insight = await this.insightsService.findById(id);
    if (!insight) {
      throw new NotFoundException('Инсайт не найден');
    }
    return toInsightDto(insight);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async create(@Body() dto: CreateInsightDto): Promise<InsightDto> {
    const insight = await this.insightsService.create(dto);
    return toInsightDto(insight);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInsightDto,
  ): Promise<InsightDto> {
    const insight = await this.insightsService.update(id, dto);
    return toInsightDto(insight);
  }

  @Patch(':id/publish')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async publish(@Param('id', ParseUUIDPipe) id: string): Promise<InsightDto> {
    const insight = await this.insightsService.publish(id);
    return toInsightDto(insight);
  }

  @Patch(':id/unpublish')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async unpublish(@Param('id', ParseUUIDPipe) id: string): Promise<InsightDto> {
    const insight = await this.insightsService.unpublish(id);
    return toInsightDto(insight);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ success: true }> {
    await this.insightsService.remove(id);
    return { success: true };
  }
}

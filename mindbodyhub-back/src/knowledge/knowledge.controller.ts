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
import { CreateKnowledgeArticleDto } from './dto/create-knowledge-article.dto';
import { UpdateKnowledgeArticleDto } from './dto/update-knowledge-article.dto';
import { KnowledgeStatus } from './knowledge.types';
import {
  KnowledgeArticleDto,
  toKnowledgeArticleDto,
} from './knowledge.mapper';
import { KnowledgeService } from './knowledge.service';

@Controller('knowledge')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  /** Always public catalog — knowledge base has no tariff gating */
  @Public()
  @Get('public')
  async findPublic(): Promise<KnowledgeArticleDto[]> {
    const articles = await this.knowledgeService.findPublished();
    return articles.map(toKnowledgeArticleDto);
  }

  @Public()
  @Get('public/:slug')
  async findPublicBySlug(
    @Param('slug') slug: string,
  ): Promise<KnowledgeArticleDto> {
    const article = await this.knowledgeService.findBySlug(slug);
    if (!article || article.status !== KnowledgeStatus.PUBLISHED) {
      throw new NotFoundException('Статья не найдена');
    }
    return toKnowledgeArticleDto(article);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  async findAll(): Promise<KnowledgeArticleDto[]> {
    const articles = await this.knowledgeService.findAll();
    return articles.map(toKnowledgeArticleDto);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<KnowledgeArticleDto> {
    const article = await this.knowledgeService.findById(id);
    if (!article) {
      throw new NotFoundException('Статья не найдена');
    }
    return toKnowledgeArticleDto(article);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  async create(
    @Body() dto: CreateKnowledgeArticleDto,
  ): Promise<KnowledgeArticleDto> {
    const article = await this.knowledgeService.create(dto);
    return toKnowledgeArticleDto(article);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateKnowledgeArticleDto,
  ): Promise<KnowledgeArticleDto> {
    const article = await this.knowledgeService.update(id, dto);
    return toKnowledgeArticleDto(article);
  }

  @Patch(':id/publish')
  @Roles(UserRole.ADMIN)
  async publish(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<KnowledgeArticleDto> {
    const article = await this.knowledgeService.publish(id);
    return toKnowledgeArticleDto(article);
  }

  @Patch(':id/unpublish')
  @Roles(UserRole.ADMIN)
  async unpublish(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<KnowledgeArticleDto> {
    const article = await this.knowledgeService.unpublish(id);
    return toKnowledgeArticleDto(article);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ success: true }> {
    await this.knowledgeService.remove(id);
    return { success: true };
  }
}

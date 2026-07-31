import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  DefaultValuePipe,
} from '@nestjs/common';
import { CurrentUser, type AuthUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user-role.enum';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { QuoteDto, toQuoteDto } from './quote.mapper';
import { QuotesService } from './quotes.service';

export type QuotesPageDto = {
  items: QuoteDto[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  /** Cabinet feed — requires auth + trial+ tariff */
  @Get('cabinet')
  async findCabinet(
    @CurrentUser() user: AuthUser,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<QuotesPageDto> {
    this.quotesService.assertQuotesAccess({
      isAuthenticated: true,
      userTariff: user.tariff,
      userRole: user.role,
    });

    const result = await this.quotesService.findPublishedPage(page, limit);
    return {
      items: result.items.map(toQuoteDto),
      total: result.total,
      page: result.page,
      limit: result.limit,
      hasMore: result.hasMore,
    };
  }

  @Get('cabinet/today')
  async findToday(@CurrentUser() user: AuthUser): Promise<QuoteDto | null> {
    this.quotesService.assertQuotesAccess({
      isAuthenticated: true,
      userTariff: user.tariff,
      userRole: user.role,
    });

    const quote = await this.quotesService.findToday();
    return quote ? toQuoteDto(quote) : null;
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async findAll(): Promise<QuoteDto[]> {
    const quotes = await this.quotesService.findAll();
    return quotes.map(toQuoteDto);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<QuoteDto> {
    const quote = await this.quotesService.findById(id);
    if (!quote) {
      throw new NotFoundException('Цитата не найдена');
    }
    return toQuoteDto(quote);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async create(@Body() dto: CreateQuoteDto): Promise<QuoteDto> {
    const quote = await this.quotesService.create(dto);
    return toQuoteDto(quote);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateQuoteDto,
  ): Promise<QuoteDto> {
    const quote = await this.quotesService.update(id, dto);
    return toQuoteDto(quote);
  }

  @Patch(':id/publish')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async publish(@Param('id', ParseUUIDPipe) id: string): Promise<QuoteDto> {
    const quote = await this.quotesService.publish(id);
    return toQuoteDto(quote);
  }

  @Patch(':id/unpublish')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async unpublish(@Param('id', ParseUUIDPipe) id: string): Promise<QuoteDto> {
    const quote = await this.quotesService.unpublish(id);
    return toQuoteDto(quote);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ success: true }> {
    await this.quotesService.remove(id);
    return { success: true };
  }
}

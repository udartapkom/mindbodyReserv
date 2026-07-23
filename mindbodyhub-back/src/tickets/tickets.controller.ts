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
import type { AuthUser } from '../auth/decorators/current-user.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user-role.enum';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { toTicketDto } from './ticket.mapper';
import { TicketDto } from './ticket.types';
import { TicketsService } from './tickets.service';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Public()
  @Post()
  async create(
    @Body() dto: CreateTicketDto,
    @CurrentUser() user?: AuthUser | null,
  ): Promise<TicketDto> {
    const ticket = await this.ticketsService.create({
      name: dto.name,
      phone: dto.phone,
      message: dto.message,
      source: dto.source,
      userId: user?.id ?? null,
    });

    return toTicketDto(ticket);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  async findAll(): Promise<TicketDto[]> {
    const tickets = await this.ticketsService.findAll();
    return tickets.map(toTicketDto);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TicketDto> {
    const ticket = await this.ticketsService.findById(id);

    if (!ticket) {
      throw new NotFoundException('Обращение не найдено');
    }

    return toTicketDto(ticket);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTicketDto,
  ): Promise<TicketDto> {
    const existing = await this.ticketsService.findById(id);

    if (!existing) {
      throw new NotFoundException('Обращение не найдено');
    }

    const ticket = await this.ticketsService.update(id, {
      status: dto.status,
      adminNote: dto.adminNote,
    });

    return toTicketDto(ticket);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ success: true }> {
    const existing = await this.ticketsService.findById(id);

    if (!existing) {
      throw new NotFoundException('Обращение не найдено');
    }

    await this.ticketsService.remove(id);
    return { success: true };
  }
}

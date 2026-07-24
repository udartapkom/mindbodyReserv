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
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/user-role.enum';
import { CreateCabinetTicketDto } from './dto/create-cabinet-ticket.dto';
import { CreateTicketMessageDto } from './dto/create-ticket-message.dto';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { toTicketDto, toTicketMessageDto } from './ticket.mapper';
import {
  TicketDto,
  TicketMessageDto,
  TicketSource,
} from './ticket.types';
import { TicketsService } from './tickets.service';

@Controller('tickets')
export class TicketsController {
  constructor(
    private readonly ticketsService: TicketsService,
    private readonly usersService: UsersService,
  ) {}

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

    const messages = await this.ticketsService.findMessages(ticket.id);
    return toTicketDto(ticket, messages);
  }

  @Get('me')
  async findMine(@CurrentUser() user: AuthUser): Promise<TicketDto[]> {
    const tickets = await this.ticketsService.findMine(user.id, user.phone);
    return tickets.map((ticket) => toTicketDto(ticket));
  }

  @Post('me')
  async createMine(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateCabinetTicketDto,
  ): Promise<TicketDto> {
    const profile = await this.usersService.findById(user.id);
    const nameFromProfile = [profile?.firstName, profile?.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();

    const ticket = await this.ticketsService.create({
      name: dto.name?.trim() || nameFromProfile || user.phone,
      phone: user.phone,
      message: dto.message,
      source: TicketSource.CABINET,
      userId: user.id,
    });
    const messages = await this.ticketsService.findMessages(ticket.id);
    return toTicketDto(ticket, messages);
  }

  @Get('me/:id')
  async findMineOne(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TicketDto> {
    await this.ticketsService.findMine(user.id, user.phone);
    const ticket = await this.ticketsService.getOwnedOrThrow(user.id, id);
    const messages = await this.ticketsService.findMessages(ticket.id);
    return toTicketDto(ticket, messages);
  }

  @Post('me/:id/messages')
  async addMineMessage(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateTicketMessageDto,
  ): Promise<TicketMessageDto> {
    const message = await this.ticketsService.addUserMessage(
      user.id,
      id,
      dto.body,
    );
    return toTicketMessageDto(message);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  async findAll(): Promise<TicketDto[]> {
    const tickets = await this.ticketsService.findAll();
    return tickets.map((ticket) => toTicketDto(ticket));
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

    const messages = await this.ticketsService.findMessages(ticket.id);
    return toTicketDto(ticket, messages);
  }

  @Get(':id/messages')
  @Roles(UserRole.ADMIN)
  async findMessages(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TicketMessageDto[]> {
    const ticket = await this.ticketsService.findById(id);
    if (!ticket) {
      throw new NotFoundException('Обращение не найдено');
    }
    const messages = await this.ticketsService.findMessages(id);
    return messages.map(toTicketMessageDto);
  }

  @Post(':id/messages')
  @Roles(UserRole.ADMIN)
  async addAdminMessage(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateTicketMessageDto,
  ): Promise<TicketMessageDto> {
    const message = await this.ticketsService.addAdminMessage(
      user.id,
      id,
      dto.body,
    );
    return toTicketMessageDto(message);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTicketDto,
  ): Promise<TicketDto> {
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
    await this.ticketsService.remove(id);
    return { success: true };
  }
}

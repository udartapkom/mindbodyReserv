import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import type { AuthUser } from '../auth/decorators/current-user.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { toPublicProfile } from './user.mapper';
import { UserRole } from './user-role.enum';
import { UserPublicProfile } from './user.types';
import { UsersService } from './users.service';

@Controller('users')
@Roles(UserRole.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(): Promise<UserPublicProfile[]> {
    const users = await this.usersService.findAll();
    return users.map(toPublicProfile);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserPublicProfile> {
    const user = await this.usersService.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return toPublicProfile(user);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdminUpdateUserDto,
  ): Promise<UserPublicProfile> {
    const existing = await this.usersService.findById(id);

    if (!existing) {
      throw new NotFoundException('User not found');
    }

    const user = await this.usersService.adminUpdateUser(id, dto);
    return toPublicProfile(user);
  }

  @Patch(':id/block')
  async block(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthUser,
  ): Promise<UserPublicProfile> {
    if (currentUser.id === id) {
      throw new BadRequestException('Нельзя заблокировать свой аккаунт');
    }

    const existing = await this.usersService.findById(id);

    if (!existing) {
      throw new NotFoundException('User not found');
    }

    const user = await this.usersService.setActive(id, false);
    return toPublicProfile(user);
  }

  @Patch(':id/unblock')
  async unblock(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserPublicProfile> {
    const existing = await this.usersService.findById(id);

    if (!existing) {
      throw new NotFoundException('User not found');
    }

    const user = await this.usersService.setActive(id, true);
    return toPublicProfile(user);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthUser,
  ): Promise<{ success: true }> {
    if (currentUser.id === id) {
      throw new BadRequestException('Нельзя удалить свой аккаунт');
    }

    const existing = await this.usersService.findById(id);

    if (!existing) {
      throw new NotFoundException('User not found');
    }

    await this.usersService.deleteUser(id);
    return { success: true };
  }
}

import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';

import { auditContextOf } from '../common/audit/request-context';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../common/decorators/current-user.decorator';
import { RequirePermission, Roles } from '../common/decorators/roles.decorator';
import type { Paginated } from '../shared/query.dto';
import {
  SearchUsersQueryDto,
  SetPermissionDto,
  SetRolesDto,
  UpdateProfileDto,
  type CurrentUserResponse,
  type UserProfileResponse,
} from './dto/user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  async me(@CurrentUser() user: AuthenticatedUser): Promise<CurrentUserResponse> {
    return this.users.me(user.id);
  }

  @Patch('me')
  async updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
    @Req() request: Request,
  ): Promise<UserProfileResponse> {
    return this.users.updateOwn(user.id, dto, auditContextOf(request));
  }

  /** Admin directory. RLS restricts the rows; the role gate stops the call. */
  @Get()
  @Roles('admin')
  @RequirePermission('users.view')
  async search(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: SearchUsersQueryDto,
  ): Promise<Paginated<UserProfileResponse>> {
    return this.users.search(user.id, query);
  }

  @Get(':id')
  async findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<UserProfileResponse> {
    return this.users.findOne(user.id, id);
  }

  @Get(':id/roles')
  @Roles('admin')
  async roles(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<{ roles: string[] }> {
    return { roles: await this.users.roles(user.id, id) };
  }

  /**
   * Role assignment. Super-admin only, enforced again by
   * admin_set_user_roles() and by the user_roles_guard trigger — three layers,
   * because privilege escalation is the failure that matters most.
   */
  @Post(':id/roles')
  @Roles('super_admin')
  @HttpCode(HttpStatus.OK)
  async setRoles(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: SetRolesDto,
    @Req() request: Request,
  ): Promise<{ roles: string[] }> {
    return this.users.setRoles(user.id, id, dto.roles, auditContextOf(request));
  }

  @Post(':id/permissions')
  @Roles('super_admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async setPermission(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: SetPermissionDto,
    @Req() request: Request,
  ): Promise<void> {
    await this.users.setPermission(
      user.id,
      id,
      dto.permissionKey,
      dto.granted,
      auditContextOf(request),
    );
  }
}

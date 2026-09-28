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
  @RequirePermission('admin.users')
  async search(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: SearchUsersQueryDto,
  ): Promise<Paginated<UserProfileResponse>> {
    return this.users.search(user.id, query);
  }

  /** Declared before `:id` so the literal path is not parsed as a UUID. */
  @Get('permissions/catalog')
  permissionCatalog(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Record<string, unknown>[]> {
    return this.users.permissionCatalog(user.id);
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
   * Role assignment for ordinary roles, by an admin holding admin.users —
   * the same rule admin_set_user_roles() applies. Granting or removing admin
   * or super_admin is refused there (ELEVATED_ROLE_REQUIRES_APPROVAL) and goes
   * through the approval queue instead; the user_roles_guard trigger is the
   * third layer, because privilege escalation is the failure that matters most.
   */
  @Post(':id/roles')
  @Roles('admin')
  @RequirePermission('admin.users')
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

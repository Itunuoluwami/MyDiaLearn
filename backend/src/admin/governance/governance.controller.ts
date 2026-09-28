import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';

import { auditContextOf } from '../../common/audit/request-context';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../../common/decorators/current-user.decorator';
import { RequirePermission, Roles } from '../../common/decorators/roles.decorator';
import {
  ActionRequestsQueryDto,
  AuditLogQueryDto,
  CreateActionRequestDto,
  CreateInvitationDto,
  ElevatedRoleRequestDto,
  RedeemInvitationDto,
  ReviewActionRequestDto,
  SetUserPermissionDto,
} from './governance.dto';
import { GovernanceService } from './governance.service';

const UUID = new ParseUUIDPipe({ version: '4' });
type Row = Record<string, unknown>;

/** Admins & roles, Approvals and Audit log pages. */
@Controller('admin/governance')
@Roles('admin')
export class GovernanceController {
  constructor(private readonly governance: GovernanceService) {}

  @Get('accounts')
  @RequirePermission('admin.admins')
  accounts(@CurrentUser() user: AuthenticatedUser): Promise<Row[]> {
    return this.governance.adminAccounts(user.id);
  }

  @Get('invitations')
  @RequirePermission('admin.admins')
  invitations(@CurrentUser() user: AuthenticatedUser): Promise<Row[]> {
    return this.governance.invitations(user.id);
  }

  /** Super admins only; admin_invite_create() checks it again. */
  @Post('invitations')
  @Roles('super_admin')
  @HttpCode(HttpStatus.CREATED)
  invite(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateInvitationDto,
    @Req() request: Request,
  ): ReturnType<GovernanceService['invite']> {
    return this.governance.invite(user.id, dto, auditContextOf(request));
  }

  @Post('invitations/:id/revoke')
  @RequirePermission('admin.admins')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revoke(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', UUID) id: string,
    @Req() request: Request,
  ): Promise<void> {
    await this.governance.revokeInvitation(user.id, id, auditContextOf(request));
  }

  @Get('permissions')
  @RequirePermission('admin.admins')
  permissionCatalog(@CurrentUser() user: AuthenticatedUser): Promise<Row[]> {
    return this.governance.permissionCatalog(user.id);
  }

  @Get('users/:id/permissions')
  @RequirePermission('admin.admins')
  userPermissions(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', UUID) id: string,
  ): Promise<Row[]> {
    return this.governance.userPermissions(user.id, id);
  }

  /** Super admins only (admin_set_user_permission checks is_super_admin). */
  @Put('users/:id/permissions/:key')
  @Roles('super_admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async setUserPermission(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', UUID) id: string,
    @Param('key') key: string,
    @Body() dto: SetUserPermissionDto,
    @Req() request: Request,
  ): Promise<void> {
    await this.governance.setUserPermission(
      user.id,
      id,
      key,
      dto.granted,
      auditContextOf(request),
    );
  }

  /** Granting or removing admin/super_admin always goes for approval. */
  @Post('users/:id/elevated-role')
  @RequirePermission('admin.admins')
  @HttpCode(HttpStatus.ACCEPTED)
  requestElevatedRole(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', UUID) id: string,
    @Body() dto: ElevatedRoleRequestDto,
  ): Promise<{ requestId: string }> {
    return this.governance.requestAction(user.id, 'user_roles.grant_elevated', {
      user_id: id,
      role: dto.role,
      revoke: dto.revoke ?? false,
    });
  }

  @Get('requests')
  @RequirePermission('admin.approvals')
  requests(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ActionRequestsQueryDto,
  ): Promise<Row[]> {
    return this.governance.actionRequests(user.id, query.status ?? 'pending');
  }

  @Post('requests')
  @RequirePermission('admin.approvals')
  @HttpCode(HttpStatus.ACCEPTED)
  createRequest(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateActionRequestDto,
  ): Promise<{ requestId: string }> {
    return this.governance.requestAction(user.id, dto.action, dto.payload);
  }

  /** Approving executes the action; a second admin is enforced in the database. */
  @Post('requests/:id/review')
  @RequirePermission('admin.approvals')
  @HttpCode(HttpStatus.OK)
  review(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', UUID) id: string,
    @Body() dto: ReviewActionRequestDto,
    @Req() request: Request,
  ): Promise<Row> {
    return this.governance.reviewAction(user.id, id, dto, auditContextOf(request));
  }

  @Get('audit-logs')
  @RequirePermission('admin.audit')
  auditLogs(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: AuditLogQueryDto,
  ): Promise<Row[]> {
    return this.governance.auditLogs(user.id, query);
  }
}

/**
 * Accepting an invitation. The invitee is not an admin yet — that is what
 * redeeming makes them — so this sits outside the admin role gate; any
 * signed-in user may try, and admin_invite_redeem() checks the address and
 * the code.
 */
@Controller('invitations')
export class InvitationsController {
  constructor(private readonly governance: GovernanceService) {}

  @Post('redeem')
  @HttpCode(HttpStatus.NO_CONTENT)
  async redeem(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RedeemInvitationDto,
  ): Promise<void> {
    await this.governance.redeemInvitation(user.id, dto.email, dto.otp);
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
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
  CreateCommissionRuleDto,
  CreateCurriculumDto,
  CreateSubjectDto,
  PlatformSettingDto,
  PlatformSettingsQueryDto,
  SetActiveDto,
  TemplateDto,
  UpdateSettingValueDto,
  UpdateTemplateDto,
  UpsertPlatformSettingsDto,
} from './admin-settings.dto';
import { AdminSettingsService } from './admin-settings.service';

const UUID = new ParseUUIDPipe({ version: '4' });
type Row = Record<string, unknown>;

/** The Platform settings page. Every route needs admin.settings. */
@Controller('admin/settings')
@Roles('admin')
@RequirePermission('admin.settings')
export class AdminSettingsController {
  constructor(private readonly settings: AdminSettingsService) {}

  @Get('subjects')
  subjects(@CurrentUser() user: AuthenticatedUser): Promise<Row[]> {
    return this.settings.subjects(user.id);
  }

  @Post('subjects')
  @HttpCode(HttpStatus.CREATED)
  async createSubject(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateSubjectDto,
  ): Promise<void> {
    await this.settings.createSubject(user.id, dto);
  }

  @Patch('subjects/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async setSubjectActive(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', UUID) id: string,
    @Body() dto: SetActiveDto,
  ): Promise<void> {
    await this.settings.setSubjectActive(user.id, id, dto.isActive);
  }

  @Delete('subjects/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSubject(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', UUID) id: string,
  ): Promise<void> {
    await this.settings.deleteSubject(user.id, id);
  }

  @Get('curricula')
  curricula(@CurrentUser() user: AuthenticatedUser): Promise<Row[]> {
    return this.settings.curricula(user.id);
  }

  @Post('curricula')
  @HttpCode(HttpStatus.CREATED)
  async createCurriculum(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCurriculumDto,
  ): Promise<void> {
    await this.settings.createCurriculum(user.id, dto);
  }

  @Patch('curricula/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async setCurriculumActive(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', UUID) id: string,
    @Body() dto: SetActiveDto,
  ): Promise<void> {
    await this.settings.setCurriculumActive(user.id, id, dto.isActive);
  }

  @Get('commission-rules')
  commissionRules(@CurrentUser() user: AuthenticatedUser): Promise<Row[]> {
    return this.settings.commissionRules(user.id);
  }

  @Get('commission-targets')
  commissionTargets(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ tutors: Row[]; agencies: Row[] }> {
    return this.settings.commissionTargets(user.id);
  }

  @Post('commission-rules')
  @HttpCode(HttpStatus.CREATED)
  async createCommissionRule(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCommissionRuleDto,
    @Req() request: Request,
  ): Promise<void> {
    await this.settings.createCommissionRule(user.id, dto, auditContextOf(request));
  }

  @Patch('commission-rules/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async setCommissionRuleActive(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', UUID) id: string,
    @Body() dto: SetActiveDto,
    @Req() request: Request,
  ): Promise<void> {
    await this.settings.setCommissionRuleActive(
      user.id,
      id,
      dto.isActive,
      auditContextOf(request),
    );
  }

  @Get('platform')
  platformSettings(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: PlatformSettingsQueryDto,
  ): Promise<Row[]> {
    return this.settings.platformSettings(user.id, query.scope);
  }

  /** Insert-or-update by key, used by the pricing panel. */
  @Put('platform')
  @HttpCode(HttpStatus.NO_CONTENT)
  async upsertSettings(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpsertPlatformSettingsDto,
  ): Promise<void> {
    await this.settings.upsertSettings(user.id, dto.settings);
  }

  @Post('platform')
  @HttpCode(HttpStatus.CREATED)
  async createSetting(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: PlatformSettingDto,
  ): Promise<void> {
    await this.settings.upsertSettings(user.id, [dto]);
  }

  @Patch('platform/:key')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateSettingValue(
    @CurrentUser() user: AuthenticatedUser,
    @Param('key') key: string,
    @Body() dto: UpdateSettingValueDto,
  ): Promise<void> {
    await this.settings.updateSettingValue(user.id, key, dto.value);
  }

  @Get('templates')
  templates(@CurrentUser() user: AuthenticatedUser): Promise<Row[]> {
    return this.settings.templates(user.id);
  }

  @Post('templates')
  @HttpCode(HttpStatus.CREATED)
  async createTemplate(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: TemplateDto,
    @Req() request: Request,
  ): Promise<void> {
    await this.settings.createTemplate(user.id, dto, auditContextOf(request));
  }

  @Patch('templates/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateTemplate(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', UUID) id: string,
    @Body() dto: UpdateTemplateDto,
    @Req() request: Request,
  ): Promise<void> {
    await this.settings.updateTemplate(user.id, id, dto, auditContextOf(request));
  }
}

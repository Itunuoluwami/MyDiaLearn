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
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';

import { auditContextOf } from '../common/audit/request-context';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import type { Paginated } from '../shared/query.dto';
import {
  CreateStudentDto,
  ListStudentsQueryDto,
  UpdateStudentDto,
  type StudentResponse,
} from './dto/student.dto';
import { StudentsService } from './students.service';

@Controller('students')
export class StudentsController {
  constructor(private readonly students: StudentsService) {}

  /**
   * Learners the caller can see.
   *
   * No role gate: a parent sees their children, a student sees themselves, a
   * tutor sees learners they teach. Which of those applies is decided by
   * can_access_student() rather than by a decorator that would have to
   * enumerate the cases and would drift from the policy.
   */
  @Get()
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListStudentsQueryDto,
  ): Promise<Paginated<StudentResponse>> {
    return this.students.list(user.id, query);
  }

  @Post()
  @Roles('parent')
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateStudentDto,
    @Req() request: Request,
  ): Promise<StudentResponse> {
    return this.students.create(user.id, dto, auditContextOf(request));
  }

  /** Declared before `:id` so "me" is not parsed as a UUID. */
  @Get('me')
  me(@CurrentUser() user: AuthenticatedUser): Promise<StudentResponse> {
    return this.students.me(user.id, user.roles);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<StudentResponse> {
    return this.students.findOne(user.id, id);
  }

  @Patch(':id')
  @Roles('parent')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateStudentDto,
    @Req() request: Request,
  ): Promise<StudentResponse> {
    return this.students.update(user.id, id, dto, auditContextOf(request));
  }

  /** Deactivates. A learner referenced by bookings is never hard-deleted. */
  @Delete(':id')
  @Roles('parent')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deactivate(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Req() request: Request,
  ): Promise<void> {
    await this.students.deactivate(user.id, id, auditContextOf(request));
  }

  @Get(':id/progress')
  progress(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<Record<string, unknown>[]> {
    return this.students.progress(user.id, id);
  }
}

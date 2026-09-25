import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import {
  CurrentUser,
  type AuthenticatedUser,
} from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import type { Paginated } from '../shared/query.dto';
import {
  CreateAssignmentDto,
  CreateResourceDto,
  ListAssignmentsQueryDto,
  ListResourcesQueryDto,
  ReviewAssignmentDto,
  SubmitAssignmentDto,
  UpsertLessonNoteDto,
  type AssignmentResponse,
  type LessonNoteResponse,
  type ResourceResponse,
} from './dto/teaching.dto';
import { TeachingService } from './teaching.service';

@Controller()
export class TeachingController {
  constructor(private readonly teaching: TeachingService) {}

  // --- Lesson notes ----------------------------------------------------------

  @Get('bookings/:bookingId/lesson-notes')
  lessonNotes(
    @CurrentUser() user: AuthenticatedUser,
    @Param('bookingId', new ParseUUIDPipe({ version: '4' })) bookingId: string,
  ): Promise<LessonNoteResponse[]> {
    return this.teaching.lessonNotes(user.id, bookingId);
  }

  @Put('bookings/:bookingId/lesson-notes')
  @Roles('tutor')
  saveLessonNote(
    @CurrentUser() user: AuthenticatedUser,
    @Param('bookingId', new ParseUUIDPipe({ version: '4' })) bookingId: string,
    @Body() dto: UpsertLessonNoteDto,
  ): Promise<LessonNoteResponse> {
    return this.teaching.saveLessonNote(user.id, bookingId, dto);
  }

  // --- Assignments -----------------------------------------------------------

  @Get('assignments')
  assignments(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListAssignmentsQueryDto,
  ): Promise<Paginated<AssignmentResponse>> {
    return this.teaching.assignments(user.id, query);
  }

  @Post('assignments')
  @Roles('tutor')
  @HttpCode(HttpStatus.CREATED)
  createAssignment(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateAssignmentDto,
  ): Promise<AssignmentResponse> {
    return this.teaching.createAssignment(user.id, dto);
  }

  @Get('assignments/:id')
  assignment(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<AssignmentResponse> {
    return this.teaching.assignment(user.id, id);
  }

  /** Family submits work. The "Families submit" policy confines it to theirs. */
  @Post('assignments/:id/submit')
  @HttpCode(HttpStatus.OK)
  submit(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: SubmitAssignmentDto,
  ): Promise<AssignmentResponse> {
    return this.teaching.submitAssignment(user.id, id, dto);
  }

  @Post('assignments/:id/review')
  @Roles('tutor')
  @HttpCode(HttpStatus.OK)
  review(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: ReviewAssignmentDto,
  ): Promise<AssignmentResponse> {
    return this.teaching.reviewAssignment(user.id, id, dto.feedback);
  }

  // --- Learning resources ----------------------------------------------------

  @Get('learning-resources')
  resources(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListResourcesQueryDto,
  ): Promise<Paginated<ResourceResponse>> {
    return this.teaching.resources(user.id, query);
  }

  @Post('learning-resources')
  @Roles('tutor')
  @HttpCode(HttpStatus.CREATED)
  createResource(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateResourceDto,
  ): Promise<ResourceResponse> {
    return this.teaching.createResource(user.id, dto);
  }

  @Delete('learning-resources/:id')
  @Roles('tutor')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteResource(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<void> {
    await this.teaching.deleteResource(user.id, id);
  }
}

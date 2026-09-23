import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';

import {
  CurrentUser,
  type AuthenticatedUser,
} from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { ListStudentsQueryDto, type StudentResponse } from '../students/dto/student.dto';
import type { Paginated } from '../shared/query.dto';
import { ParentsService } from './parents.service';

@Controller('parents')
@Roles('parent')
export class ParentsController {
  constructor(private readonly parents: ParentsService) {}

  @Get('me/dashboard')
  dashboard(@CurrentUser() user: AuthenticatedUser): Promise<Record<string, unknown> | null> {
    return this.parents.dashboard(user.id);
  }

  @Get('me/children')
  children(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListStudentsQueryDto,
  ): Promise<Paginated<StudentResponse>> {
    return this.parents.children(user.id, query);
  }

  @Get('me/children/:id')
  child(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<StudentResponse> {
    return this.parents.child(user.id, id);
  }

  @Get('me/children/:id/progress')
  childProgress(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<Record<string, unknown>[]> {
    return this.parents.childProgress(user.id, id);
  }
}

import { Injectable } from '@nestjs/common';

import type { Paginated, PaginationQueryDto } from '../shared/query.dto';
import type { StudentResponse } from '../students/dto/student.dto';
import { StudentsService } from '../students/students.service';
import { ParentsRepository } from './parents.repository';

/**
 * The parent portal.
 *
 * Children are served by delegating to StudentsService rather than querying
 * students again here. One definition of what a learner looks like, one place
 * where access is decided.
 */
@Injectable()
export class ParentsService {
  constructor(
    private readonly repository: ParentsRepository,
    private readonly students: StudentsService,
  ) {}

  async dashboard(userId: string): Promise<Record<string, unknown> | null> {
    return this.repository.dashboardSummary(userId);
  }

  async children(
    userId: string,
    query: PaginationQueryDto,
  ): Promise<Paginated<StudentResponse>> {
    return this.students.list(userId, query);
  }

  async child(userId: string, studentId: string): Promise<StudentResponse> {
    return this.students.findOne(userId, studentId);
  }

  async childProgress(userId: string, studentId: string): Promise<Record<string, unknown>[]> {
    return this.repository.childProgress(userId, studentId);
  }
}

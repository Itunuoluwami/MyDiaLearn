import type { Request } from 'express';
import { type AuthenticatedUser } from '../common/decorators/current-user.decorator';
import type { Paginated } from '../shared/query.dto';
import { CreateStudentDto, ListStudentsQueryDto, UpdateStudentDto, type StudentResponse } from './dto/student.dto';
import { StudentsService } from './students.service';
export declare class StudentsController {
    private readonly students;
    constructor(students: StudentsService);
    list(user: AuthenticatedUser, query: ListStudentsQueryDto): Promise<Paginated<StudentResponse>>;
    create(user: AuthenticatedUser, dto: CreateStudentDto, request: Request): Promise<StudentResponse>;
    me(user: AuthenticatedUser): Promise<StudentResponse>;
    findOne(user: AuthenticatedUser, id: string): Promise<StudentResponse>;
    update(user: AuthenticatedUser, id: string, dto: UpdateStudentDto, request: Request): Promise<StudentResponse>;
    deactivate(user: AuthenticatedUser, id: string, request: Request): Promise<void>;
    progress(user: AuthenticatedUser, id: string): Promise<Record<string, unknown>[]>;
}

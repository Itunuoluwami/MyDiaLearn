import { AuditService, type AuditContext } from '../common/audit/audit.service';
import { type Paginated, type PaginationQueryDto } from '../shared/query.dto';
import type { CreateStudentDto, StudentResponse, UpdateStudentDto } from './dto/student.dto';
import { StudentsRepository, type StudentRow } from './students.repository';
export declare class StudentsService {
    private readonly repository;
    private readonly audit;
    constructor(repository: StudentsRepository, audit: AuditService);
    list(userId: string, query: PaginationQueryDto): Promise<Paginated<StudentResponse>>;
    me(userId: string, roles: readonly string[]): Promise<StudentResponse>;
    findOne(userId: string, id: string): Promise<StudentResponse>;
    create(parentUserId: string, dto: CreateStudentDto, context: AuditContext): Promise<StudentResponse>;
    update(userId: string, id: string, dto: UpdateStudentDto, context: AuditContext): Promise<StudentResponse>;
    deactivate(userId: string, id: string, context: AuditContext): Promise<void>;
    progress(userId: string, studentId: string): Promise<Record<string, unknown>[]>;
}
export declare function toResponse(row: StudentRow): StudentResponse;

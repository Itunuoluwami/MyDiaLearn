import type { Paginated, PaginationQueryDto } from '../shared/query.dto';
import type { StudentResponse } from '../students/dto/student.dto';
import { StudentsService } from '../students/students.service';
import { ParentsRepository } from './parents.repository';
export declare class ParentsService {
    private readonly repository;
    private readonly students;
    constructor(repository: ParentsRepository, students: StudentsService);
    dashboard(userId: string): Promise<Record<string, unknown> | null>;
    children(userId: string, query: PaginationQueryDto): Promise<Paginated<StudentResponse>>;
    child(userId: string, studentId: string): Promise<StudentResponse>;
    childProgress(userId: string, studentId: string): Promise<Record<string, unknown>[]>;
}

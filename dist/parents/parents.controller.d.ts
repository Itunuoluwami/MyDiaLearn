import { type AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { ListStudentsQueryDto, type StudentResponse } from '../students/dto/student.dto';
import type { Paginated } from '../shared/query.dto';
import { ParentsService } from './parents.service';
export declare class ParentsController {
    private readonly parents;
    constructor(parents: ParentsService);
    dashboard(user: AuthenticatedUser): Promise<Record<string, unknown> | null>;
    children(user: AuthenticatedUser, query: ListStudentsQueryDto): Promise<Paginated<StudentResponse>>;
    child(user: AuthenticatedUser, id: string): Promise<StudentResponse>;
    childProgress(user: AuthenticatedUser, id: string): Promise<Record<string, unknown>[]>;
}

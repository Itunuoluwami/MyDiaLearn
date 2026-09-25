import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

import { PaginationQueryDto } from '../../shared/query.dto';

export class SendMessageDto {
  @IsString()
  @MinLength(1, { message: 'A message cannot be empty.' })
  @MaxLength(5000)
  body!: string;

  /** Provider-relative key; the bytes go to StorageProvider, not here. */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  attachmentPath?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  attachmentName?: string;
}

export class StartConversationDto {
  @IsUUID('4')
  studentId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(160)
  subject!: string;
}

export class ListMessagesQueryDto extends PaginationQueryDto {}

/**
 * Response shape.
 *
 * A hidden message (moderated) returns with its body replaced rather than
 * omitted, so the thread keeps its shape and a participant sees that something
 * was removed rather than a silent gap.
 */
export interface MessageResponse {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  attachmentName: string | null;
  isHidden: boolean;
  createdAt: string;
}

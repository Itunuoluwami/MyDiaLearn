import { Injectable } from '@nestjs/common';

import { PrismaService } from '../database/prisma.service';
import { BaseRepository } from '../database/repositories/base.repository';
import type { PaginationQueryDto } from '../shared/query.dto';

export interface ConversationRow {
  id: string;
  subject: string | null;
  booking_id: string | null;
  student_id: string | null;
  created_by: string;
  last_message_at: Date | null;
  created_at: Date;
}

export interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  attachment_path: string | null;
  attachment_name: string | null;
  is_hidden: boolean;
  hidden_reason: string | null;
  created_at: Date;
}

/**
 * Conversations and messages.
 *
 * Membership is the access rule, expressed by in_conversation() through the
 * "Participants read/send" policies. Every method runs inside the caller's
 * claims, so a non-participant sees nothing and cannot post — there is no
 * membership check to write here, and writing one would risk drifting from the
 * policy.
 */
@Injectable()
export class MessagingRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  /** The caller's conversations, newest activity first, via my_conversations(). */
  async listConversations(userId: string): Promise<Record<string, unknown>[]> {
    return this.prisma.withUser(userId, async (tx) =>
      tx.$queryRaw<Record<string, unknown>[]>`select * from public.my_conversations()`,
    );
  }

  async findConversation(userId: string, id: string): Promise<ConversationRow | null> {
    return this.prisma.withUser(userId, async (tx) => {
      const rows = await tx.$queryRaw<ConversationRow[]>`
        select id, subject, booking_id, student_id, created_by, last_message_at, created_at
        from public.conversations where id = ${id}::uuid
      `;
      return rows[0] ?? null;
    });
  }

  async listMessages(
    userId: string,
    conversationId: string,
    query: PaginationQueryDto,
  ): Promise<{ rows: MessageRow[]; total: number }> {
    return this.prisma.withUser(userId, async (tx) => {
      // Page 1 is the most recent messages (a thread opens at its end), still
      // returned oldest-first so the page reads top to bottom.
      const rows = await tx.$queryRaw<MessageRow[]>`
        select * from (
          select id, conversation_id, sender_id, body, attachment_path, attachment_name,
                 is_hidden, hidden_reason, created_at
          from public.messages
          where conversation_id = ${conversationId}::uuid
          order by created_at desc
          limit ${query.limit} offset ${query.skip}
        ) recent
        order by created_at asc
      `;
      const counted = await tx.$queryRaw<{ n: bigint }[]>`
        select count(*)::bigint n from public.messages
        where conversation_id = ${conversationId}::uuid
      `;
      return { rows, total: Number(counted[0]?.n ?? 0) };
    });
  }

  /**
   * Posts a message.
   *
   * The "Participants send messages" INSERT policy refuses a sender who is not
   * in the conversation, so an outsider posting fails at the database rather
   * than by a check here. last_message_at is bumped in the same transaction so
   * the conversation list re-sorts correctly.
   */
  async sendMessage(
    userId: string,
    input: {
      conversationId: string;
      body: string;
      attachmentPath?: string | undefined;
      attachmentName?: string | undefined;
    },
  ): Promise<MessageRow> {
    return this.prisma.withUser(userId, async (tx) => {
      const rows = await tx.$queryRaw<MessageRow[]>`
        insert into public.messages
          (conversation_id, sender_id, body, attachment_path, attachment_name)
        values (
          ${input.conversationId}::uuid, ${userId}::uuid, ${input.body},
          ${input.attachmentPath ?? null}, ${input.attachmentName ?? null}
        )
        returning id, conversation_id, sender_id, body, attachment_path, attachment_name,
                  is_hidden, hidden_reason, created_at
      `;
      await tx.$executeRaw`
        update public.conversations set last_message_at = now(), updated_at = now()
        where id = ${input.conversationId}::uuid
      `;
      return rows[0]!;
    });
  }

  /** Marks the caller's participation read up to now. */
  async markRead(userId: string, conversationId: string): Promise<void> {
    await this.prisma.withUser(userId, async (tx) => {
      await tx.$executeRaw`
        update public.conversation_participants set last_read_at = now()
        where conversation_id = ${conversationId}::uuid and user_id = ${userId}::uuid
      `;
    });
  }

  /** Tutor opens a conversation with a student, via tutor_start_conversation(). */
  async startConversation(
    tutorUserId: string,
    input: { studentId: string; subject: string },
  ): Promise<string> {
    return this.prisma.withUser(tutorUserId, async (tx) => {
      const rows = await tx.$queryRaw<{ id: string }[]>`
        select public.tutor_start_conversation(${input.studentId}::uuid, ${input.subject}) as id
      `;
      return rows[0]!.id;
    });
  }
}

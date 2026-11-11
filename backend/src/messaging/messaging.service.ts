import { Injectable } from '@nestjs/common';
import { NotificationDispatchService } from '../notifications/services/notification-dispatch.service';

import { NotFoundError } from '../common/exceptions/app.exception';
import { paginate, type Paginated, type PaginationQueryDto } from '../shared/query.dto';
import type { MessageResponse } from './dto/messaging.dto';
import { MessagingRepository, type MessageRow } from './messaging.repository';

/**
 * Conversations and messages.
 *
 * Membership decides access, and the database enforces it — so this service
 * orchestrates and shapes responses rather than re-checking who may read what.
 */
@Injectable()
export class MessagingService {
  constructor(
    private readonly repository: MessagingRepository,
    private readonly notifications: NotificationDispatchService,
  ) {}

  /**
   * Emails the other participants about a new message.
   *
   * notify_message_received() raises the in-app notice, so only email is sent
   * from here. A note on volume: this is one email per message, which is
   * right for an occasional question between a parent and a tutor and wrong
   * for a back-and-forth conversation — a digest, or a delay that skips
   * anyone who has already read the thread, is the usual answer and would
   * need a scheduled job this codebase does not yet have. Until then the copy
   * carries a preview so a reader can judge from the subject line alone.
   *
   * The preview is clipped to one line: the full message lives on DiaLearn,
   * and an email that reproduces it invites a reply by email, off the record.
   */
  private async emailParticipants(
    senderId: string,
    conversationId: string,
    body: string,
  ): Promise<void> {
    try {
      const recipients = await this.repository.messageRecipients(conversationId, senderId);
      const preview = body.length > 140 ? `${body.slice(0, 137)}...` : body;
      for (const recipient of recipients) {
        await this.notifications.dispatchEmail({
          to: recipient.email,
          triggerKey: 'message.received',
          vars: { sender_name: recipient.sender_name ?? 'Someone', preview },
        });
      }
    } catch {
      // Already logged by the dispatcher; the message itself has been sent.
    }
  }

  listConversations(userId: string): Promise<Record<string, unknown>[]> {
    return this.repository.listConversations(userId);
  }

  async messages(
    userId: string,
    conversationId: string,
    query: PaginationQueryDto,
  ): Promise<Paginated<MessageResponse>> {
    // A non-participant sees an empty conversation rather than an error, which
    // is what RLS returns and what does not confirm the conversation exists.
    const conversation = await this.repository.findConversation(userId, conversationId);
    if (!conversation) throw new NotFoundError('Conversation');

    const { rows, total } = await this.repository.listMessages(userId, conversationId, query);
    return paginate(rows.map(toResponse), total, query);
  }

  async send(
    userId: string,
    conversationId: string,
    input: { body: string; attachmentPath?: string; attachmentName?: string },
  ): Promise<MessageResponse> {
    // Deliberately not audited per-message: chatter is not a sensitive
    // operation and would drown the audit log. Moderating a message IS audited,
    // in the admin module, because that is the sensitive action.
    const message = await this.repository.sendMessage(userId, {
      conversationId,
      body: input.body,
      attachmentPath: input.attachmentPath,
      attachmentName: input.attachmentName,
    });
    await this.emailParticipants(userId, conversationId, input.body);
    return toResponse(message);
  }

  async markRead(userId: string, conversationId: string): Promise<void> {
    await this.repository.markRead(userId, conversationId);
  }

  async startConversation(
    tutorUserId: string,
    input: { studentId: string; subject?: string | undefined },
  ): Promise<{ id: string }> {
    return { id: await this.repository.startConversation(tutorUserId, input) };
  }
}

export function toResponse(row: MessageRow): MessageResponse {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    // A moderated message keeps its slot in the thread with its content
    // replaced, rather than vanishing and leaving a confusing gap.
    body: row.is_hidden ? '[This message was removed by a moderator.]' : row.body,
    attachmentName: row.is_hidden ? null : row.attachment_name,
    isHidden: row.is_hidden,
    createdAt: row.created_at.toISOString(),
  };
}

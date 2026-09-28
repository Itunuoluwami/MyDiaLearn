import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';

import {
  CurrentUser,
  type AuthenticatedUser,
} from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import type { Paginated } from '../shared/query.dto';
import {
  ListMessagesQueryDto,
  SendMessageDto,
  StartConversationDto,
  type MessageResponse,
} from './dto/messaging.dto';
import { MessagingService } from './messaging.service';

@Controller('conversations')
export class MessagingController {
  constructor(private readonly messaging: MessagingService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser): Promise<Record<string, unknown>[]> {
    return this.messaging.listConversations(user.id);
  }

  /** Tutor-initiated. Families reply within a thread but do not open new ones. */
  @Post()
  @Roles('tutor')
  @HttpCode(HttpStatus.CREATED)
  start(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: StartConversationDto,
  ): Promise<{ id: string }> {
    return this.messaging.startConversation(user.id, dto);
  }

  @Get(':id/messages')
  messages(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Query() query: ListMessagesQueryDto,
  ): Promise<Paginated<MessageResponse>> {
    return this.messaging.messages(user.id, id, query);
  }

  @Post(':id/messages')
  @HttpCode(HttpStatus.CREATED)
  send(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: SendMessageDto,
  ): Promise<MessageResponse> {
    return this.messaging.send(user.id, id, dto);
  }

  @Post(':id/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  async markRead(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<void> {
    await this.messaging.markRead(user.id, id);
  }
}

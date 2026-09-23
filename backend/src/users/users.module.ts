import { Module } from '@nestjs/common';

import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

/**
 * Profiles, roles and resolved permissions.
 *
 * Replaces direct reads of profiles, user_roles, permissions, role_permissions
 * and user_permissions, and the my_permissions() / has_permission() /
 * has_role() helpers. This is the module that lets the frontend stop reading
 * Supabase for identity.
 */
@Module({
  controllers: [UsersController],
  providers: [UsersRepository, UsersService],
  exports: [UsersService],
})
export class UsersModule {}

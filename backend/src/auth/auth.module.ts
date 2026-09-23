import { Module } from '@nestjs/common';

/**
 * Authentication and session issuance.
 *
 * Replaces Supabase GoTrue: signInWithPassword, signUp, signOut, getSession,
 * getUser, resetPasswordForEmail, updateUser, resend, plus the privileged
 * auth.admin.inviteUserByEmail / updateUserById used by admin invitations.
 *
 * Also takes over what GoTrue provided for free and this backend must now build:
 * refresh-token rotation, revocation and device sessions. The profiles.
 * must_change_password flag and clear_must_change_password() move here too.
 *
 * Frontend contract: src/hooks/use-auth.tsx must keep exporting the same
 * AuthContextValue shape. Preserving it is what makes the cutover a one-file
 * change rather than a 49-route change.
 *
 * Foundation phase: boundary only. No controllers or services yet — migration
 * rule 7 keeps Supabase serving this domain until a verified replacement exists.
 */
@Module({})
export class AuthModule {}

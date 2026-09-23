import { Module } from '@nestjs/common';

/**
 * Uploads and time-limited download URLs.
 *
 * Fronts StorageProvider for the avatars, tutor-documents and learning-resources
 * buckets.
 *
 * The hard part is not the transfer, it is the authorization. Supabase storage
 * policies currently join application tables — "Families read shared learning
 * files" matches storage.objects.name against learning_resources.storage_path —
 * and no S3-compatible provider can express that. This module must make that
 * decision in TypeScript before minting a signed URL, which is why the port is
 * built around signed URLs rather than direct object access.
 *
 * Foundation phase: boundary only. No controllers or services yet — migration
 * rule 7 keeps Supabase serving this domain until a verified replacement exists.
 */
@Module({})
export class FilesModule {}

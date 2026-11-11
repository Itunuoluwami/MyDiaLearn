import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';

import type { IntegrationsConfig } from '../config/configuration';
import { FilesController } from './files.controller';
import { FilesRepository } from './files.repository';
import { FilesService } from './files.service';

/**
 * Uploads and time-limited download URLs.
 *
 * Fronts StorageProvider for the tutor-documents and learning-resources
 * buckets. The hard part is not the transfer, it is the authorization:
 * Supabase storage policies join application tables — "Families read shared
 * learning files" matches storage.objects.name against
 * learning_resources.storage_path — so FilesRepository re-expresses each
 * policy against the owning row before FilesService signs a link.
 *
 * Uploads are held in memory up to STORAGE_MAX_UPLOAD_MB and refused above it.
 */
@Module({
  imports: [
    MulterModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        limits: {
          files: 1,
          fileSize:
            config.getOrThrow<IntegrationsConfig>('integrations').storageMaxUploadBytes,
        },
      }),
    }),
  ],
  controllers: [FilesController],
  providers: [FilesRepository, FilesService],
  // Agencies upload verification documents on behalf of the tutors they
  // manage, through this same service, so the storage rules stay in one place.
  exports: [FilesService],
})
export class FilesModule {}

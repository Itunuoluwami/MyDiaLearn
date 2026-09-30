import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';

import {
  CurrentUser,
  type AuthenticatedUser,
} from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { FilesService, type IncomingFile, type UploadedFileResponse } from './files.service';

const uuid = new ParseUUIDPipe({ version: '4' });

@Controller('files')
export class FilesController {
  constructor(private readonly files: FilesService) {}

  // --- Uploads: multipart/form-data with a single `file` field ---------------

  @Post('tutor-documents')
  @Roles('tutor')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  uploadTutorDocument(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: IncomingFile | undefined,
  ): Promise<UploadedFileResponse> {
    return this.files.upload(user.id, 'tutor-document', file);
  }

  @Post('learning-resources')
  @Roles('tutor')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  uploadLearningResource(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: IncomingFile | undefined,
  ): Promise<UploadedFileResponse> {
    return this.files.upload(user.id, 'learning-resource', file);
  }

  @Post('submissions')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  uploadSubmission(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: IncomingFile | undefined,
  ): Promise<UploadedFileResponse> {
    return this.files.upload(user.id, 'submission', file);
  }

  // --- Short-lived download links, after an authorization check ---------------

  @Get('tutor-documents/:id/url')
  tutorDocumentUrl(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', uuid) id: string,
  ): Promise<{ url: string }> {
    return this.files.tutorDocumentUrl(user.id, id);
  }

  @Get('learning-resources/:id/url')
  learningResourceUrl(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', uuid) id: string,
  ): Promise<{ url: string }> {
    return this.files.learningResourceUrl(user.id, id);
  }

  @Get('submissions/:assignmentId/url')
  submissionUrl(
    @CurrentUser() user: AuthenticatedUser,
    @Param('assignmentId', uuid) assignmentId: string,
  ): Promise<{ url: string }> {
    return this.files.submissionUrl(user.id, assignmentId);
  }

  /**
   * Serves a signed link. Public because it is opened in a new tab, which
   * carries no bearer token; the signature and expiry are the credential.
   */
  @Get('signed/:token')
  @Public()
  async download(@Param('token') token: string, @Res() response: Response): Promise<void> {
    const file = await this.files.resolve(token);
    const disposition = file.inline ? 'inline' : 'attachment';
    response.setHeader('Content-Type', file.contentType);
    response.setHeader(
      'Content-Disposition',
      `${disposition}; filename="${file.downloadName}"; filename*=UTF-8''${encodeURIComponent(file.downloadName)}`,
    );
    // Nothing served here may run script on the API's origin. PDFs are the
    // exception to `sandbox` only because Chrome refuses to render a PDF under
    // it; they keep helmet's policy, and nosniff stops a PDF label being
    // reinterpreted as anything else.
    if (file.contentType !== 'application/pdf') {
      response.setHeader(
        'Content-Security-Policy',
        "default-src 'none'; img-src 'self'; sandbox",
      );
    }
    response.setHeader('Cache-Control', 'private, no-store');
    // Opened from the frontend's origin in a new tab.
    response.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    response.sendFile(file.absolutePath, { dotfiles: 'deny' });
  }
}

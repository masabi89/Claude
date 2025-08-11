// api/src/files/services/s3.service.ts
import { Injectable } from ‘@nestjs/common’;
import { ConfigService } from ‘@nestjs/config’;
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from ‘@aws-sdk/client-s3’;
import { getSignedUrl } from ‘@aws-sdk/s3-request-presigner’;
import * as crypto from ‘crypto’;

@Injectable()
export class S3Service {
private s3Client: S3Client;
public readonly bucket: string;

constructor(private configService: ConfigService) {
this.bucket = this.configService.get<string>(‘AWS_S3_BUCKET’) || ‘promanage-files’;

```
this.s3Client = new S3Client({
  region: this.configService.get<string>('AWS_REGION', 'us-east-1'),
  credentials: {
    accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
    secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
  },
});
```

}

async generatePresignedUploadUrl(
key: string,
contentType: string,
maxSize: number,
expiresIn: number = 3600,
): Promise<string> {
const command = new PutObjectCommand({
Bucket: this.bucket,
Key: key,
ContentType: contentType,
ServerSideEncryption: ‘AES256’,
Metadata: {
‘upload-timestamp’: Date.now().toString(),
},
});

```
return getSignedUrl(this.s3Client, command, {
  expiresIn,
  signableHeaders: new Set(['host', 'content-type']),
});
```

}

async generatePresignedDownloadUrl(
key: string,
filename?: string,
expiresIn: number = 3600,
): Promise<string> {
const command = new GetObjectCommand({
Bucket: this.bucket,
Key: key,
ResponseContentDisposition: filename ? `attachment; filename="${filename}"` : undefined,
});

```
return getSignedUrl(this.s3Client, command, { expiresIn });
```

}

async fileExists(key: string): Promise<boolean> {
try {
await this.s3Client.send(new HeadObjectCommand({
Bucket: this.bucket,
Key: key,
}));
return true;
} catch (error) {
if (error.name === ‘NotFound’) {
return false;
}
throw error;
}
}

async getFileChecksum(key: string): Promise<string> {
try {
const response = await this.s3Client.send(new HeadObjectCommand({
Bucket: this.bucket,
Key: key,
}));

```
  // Return ETag (remove quotes if present)
  return response.ETag?.replace(/"/g, '') || '';
} catch (error) {
  throw new Error(`Failed to get file checksum: ${error.message}`);
}
```

}

async deleteFile(key: string): Promise<void> {
await this.s3Client.send(new DeleteObjectCommand({
Bucket: this.bucket,
Key: key,
}));
}

async getFileSize(key: string): Promise<number> {
try {
const response = await this.s3Client.send(new HeadObjectCommand({
Bucket: this.bucket,
Key: key,
}));
return response.ContentLength || 0;
} catch (error) {
throw new Error(`Failed to get file size: ${error.message}`);
}
}
}

// api/src/files/services/image-processing.service.ts
import { Injectable } from ‘@nestjs/common’;
import { S3Service } from ‘./s3.service’;
import { GetObjectCommand, PutObjectCommand } from ‘@aws-sdk/client-s3’;
import * as sharp from ‘sharp’;

export interface ImageInfo {
width: number;
height: number;
format: string;
size: number;
}

@Injectable()
export class ImageProcessingService {
constructor(private s3Service: S3Service) {}

async getImageInfo(key: string): Promise<ImageInfo> {
try {
// Get image from S3
const response = await this.s3Service[‘s3Client’].send(new GetObjectCommand({
Bucket: this.s3Service.bucket,
Key: key,
}));

```
  const buffer = await this.streamToBuffer(response.Body as any);
  const metadata = await sharp(buffer).metadata();

  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
    format: metadata.format || 'unknown',
    size: buffer.length,
  };
} catch (error) {
  throw new Error(`Failed to get image info: ${error.message}`);
}
```

}

async generateThumbnail(
sourceKey: string,
targetKey: string,
width: number = 300,
height: number = 300,
): Promise<void> {
try {
// Get source image from S3
const response = await this.s3Service[‘s3Client’].send(new GetObjectCommand({
Bucket: this.s3Service.bucket,
Key: sourceKey,
}));

```
  const sourceBuffer = await this.streamToBuffer(response.Body as any);

  // Generate thumbnail
  const thumbnailBuffer = await sharp(sourceBuffer)
    .resize(width, height, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality: 80 })
    .toBuffer();

  // Upload thumbnail to S3
  await this.s3Service['s3Client'].send(new PutObjectCommand({
    Bucket: this.s3Service.bucket,
    Key: targetKey,
    Body: thumbnailBuffer,
    ContentType: 'image/jpeg',
    ServerSideEncryption: 'AES256',
  }));
} catch (error) {
  throw new Error(`Failed to generate thumbnail: ${error.message}`);
}
```

}

private async streamToBuffer(stream: any): Promise<Buffer> {
const chunks: Buffer[] = [];
for await (const chunk of stream) {
chunks.push(chunk);
}
return Buffer.concat(chunks);
}
}

// api/src/files/controllers/file.controller.ts
import {
Controller,
Get,
Post,
Body,
Patch,
Param,
Delete,
Query,
UseGuards,
ParseUUIDPipe,
HttpStatus,
HttpCode,
UseInterceptors,
UploadedFile,
BadRequestException,
ParseIntPipe,
} from ‘@nestjs/common’;
import {
ApiTags,
ApiOperation,
ApiResponse,
ApiBearerAuth,
ApiParam,
ApiQuery,
ApiConsumes,
} from ‘@nestjs/swagger’;
import { FileInterceptor } from ‘@nestjs/platform-express’;
import { FileService, PaginatedFiles, UploadUrlResponse } from ‘../services/file.service’;
import { UploadFileDto } from ‘../dto/upload-file.dto’;
import { FileQueryDto } from ‘../dto/file-query.dto’;
import { File } from ‘../entities/file.entity’;
import { JwtAuthGuard } from ‘../../auth/guards/jwt-auth.guard’;
import { RolesGuard } from ‘../../auth/guards/roles.guard’;
import { TenantGuard } from ‘../../common/guards/tenant.guard’;
import { RateLimitGuard } from ‘../../common/guards/rate-limit.guard’;
import { CurrentUser } from ‘../../auth/decorators/current-user.decorator’;
import { TenantContext } from ‘../../common/decorators/tenant-context.decorator’;
import { AuditLog } from ‘../../common/decorators/audit-log.decorator’;

@ApiTags(‘Files’)
@ApiBearerAuth()
@Controller(‘files’)
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard, RateLimitGuard)
export class FileController {
constructor(private readonly fileService: FileService) {}

@Post(‘upload-url’)
@ApiOperation({ summary: ‘Generate presigned upload URL’ })
@ApiResponse({ status: 201, description: ‘Upload URL generated successfully’ })
@ApiResponse({ status: 400, description: ‘Bad request’ })
@AuditLog(‘file.generate_upload_url’)
async generateUploadUrl(
@Body() uploadDto: UploadFileDto & {
originalName: string;
mimeType: string;
size: number;
},
@CurrentUser(‘id’) userId: string,
@TenantContext(‘id’) tenantId: string,
): Promise<UploadUrlResponse> {
const { originalName, mimeType, size, …fileDto } = uploadDto;

```
if (!originalName || !mimeType || !size) {
  throw new BadRequestException('Missing required file information');
}

return this.fileService.generateUploadUrl(
  fileDto,
  originalName,
  mimeType,
  size,
  userId,
  tenantId,
);
```

}

@Post(’:id/confirm’)
@ApiOperation({ summary: ‘Confirm file upload completion’ })
@ApiResponse({ status: 200, description: ‘Upload confirmed successfully’, type: File })
@ApiResponse({ status: 404, description: ‘File not found’ })
@ApiParam({ name: ‘id’, description: ‘File ID’ })
@AuditLog(‘file.confirm_upload’)
async confirmUpload(
@Param(‘id’, ParseUUIDPipe) id: string,
@CurrentUser(‘id’) userId: string,
@TenantContext(‘id’) tenantId: string,
): Promise<File> {
return this.fileService.confirmUpload(id, userId, tenantId);
}

@Get()
@ApiOperation({ summary: ‘Get all files with filtering and pagination’ })
@ApiResponse({ status: 200, description: ‘Files retrieved successfully’ })
@ApiQuery({ name: ‘search’, required: false, description: ‘Search in filename and description’ })
@ApiQuery({ name: ‘type’, required: false, enum: [‘image’, ‘document’, ‘spreadsheet’, ‘presentation’, ‘video’, ‘audio’, ‘archive’, ‘other’], isArray: true })
@ApiQuery({ name: ‘status’, required: false, enum: [‘uploading’, ‘processing’, ‘ready’, ‘error’], isArray: true })
@ApiQuery({ name: ‘projectId’, required: false, description: ‘Filter by project ID’ })
@ApiQuery({ name: ‘taskId’, required: false, description: ‘Filter by task ID’ })
@ApiQuery({ name: ‘uploadedById’, required: false, description: ‘Filter by uploader’ })
@ApiQuery({ name: ‘tags’, required: false, description: ‘Filter by tags (comma-separated)’ })
@ApiQuery({ name: ‘isPublic’, required: false, type: Boolean, description: ‘Show only public files’ })
@ApiQuery({ name: ‘sortBy’, required: false, description: ‘Sort field’ })
@ApiQuery({ name: ‘sortOrder’, required: false, enum: [‘ASC’, ‘DESC’] })
@ApiQuery({ name: ‘page’, required: false, type: Number, description: ‘Page number’ })
@ApiQuery({ name: ‘limit’, required: false, type: Number, description: ‘Items per page’ })
async findAll(
@Query() query: FileQueryDto,
@CurrentUser(‘id’) userId: string,
@TenantContext(‘id’) tenantId: string,
): Promise<PaginatedFiles> {
return this.fileService.findAll(query, userId, tenantId);
}

@Get(‘stats’)
@ApiOperation({ summary: ‘Get file statistics’ })
@ApiResponse({ status: 200, description: ‘File statistics retrieved successfully’ })
@ApiQuery({ name: ‘projectId’, required: false, description: ‘Filter by project ID’ })
async getStats(
@Query(‘projectId’) projectId
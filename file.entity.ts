// api/src/files/entities/file.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index, CreateDateColumn, UpdateDateColumn } from ‘typeorm’;
import { User } from ‘../../users/entities/user.entity’;
import { Tenant } from ‘../../tenants/entities/tenant.entity’;
import { Project } from ‘../../projects/entities/project.entity’;
import { Task } from ‘../../tasks/entities/task.entity’;

export enum FileType {
IMAGE = ‘image’,
DOCUMENT = ‘document’,
SPREADSHEET = ‘spreadsheet’,
PRESENTATION = ‘presentation’,
VIDEO = ‘video’,
AUDIO = ‘audio’,
ARCHIVE = ‘archive’,
OTHER = ‘other’
}

export enum FileStatus {
UPLOADING = ‘uploading’,
PROCESSING = ‘processing’,
READY = ‘ready’,
ERROR = ‘error’,
DELETED = ‘deleted’
}

@Entity(‘files’)
@Index([‘tenantId’, ‘status’])
@Index([‘uploadedById’, ‘createdAt’])
@Index([‘projectId’, ‘createdAt’])
export class File {
@PrimaryGeneratedColumn(‘uuid’)
id: string;

@Column({ type: ‘varchar’, length: 255 })
filename: string;

@Column({ type: ‘varchar’, length: 255 })
originalName: string;

@Column({ type: ‘varchar’, length: 100 })
mimeType: string;

@Column({ type: ‘enum’, enum: FileType })
type: FileType;

@Column({ type: ‘bigint’ })
size: number;

@Column({ type: ‘varchar’, length: 500 })
url: string;

@Column({ type: ‘varchar’, length: 500, nullable: true })
thumbnailUrl?: string;

@Column({ type: ‘varchar’, length: 500, nullable: true })
previewUrl?: string;

@Column({ type: ‘enum’, enum: FileStatus, default: FileStatus.UPLOADING })
status: FileStatus;

@Column({ type: ‘varchar’, length: 255, nullable: true })
bucket?: string;

@Column({ type: ‘varchar’, length: 255, nullable: true })
key?: string;

@Column({ type: ‘varchar’, length: 64, nullable: true })
checksum?: string;

@Column({ type: ‘jsonb’, nullable: true })
metadata?: {
width?: number;
height?: number;
duration?: number;
pages?: number;
[key: string]: any;
};

@Column({ type: ‘text’, nullable: true })
description?: string;

@Column({ type: ‘text’, nullable: true })
tags?: string;

@Column({ type: ‘boolean’, default: false })
isPublic: boolean;

@Column({ type: ‘timestamp’, nullable: true })
expiresAt?: Date;

@Column({ type: ‘uuid’ })
@Index()
tenantId: string;

@Column({ type: ‘uuid’ })
@Index()
uploadedById: string;

@Column({ type: ‘uuid’, nullable: true })
@Index()
projectId?: string;

@Column({ type: ‘uuid’, nullable: true })
@Index()
taskId?: string;

@CreateDateColumn()
createdAt: Date;

@UpdateDateColumn()
updatedAt: Date;

// Relations
@ManyToOne(() => Tenant, { onDelete: ‘CASCADE’ })
@JoinColumn({ name: ‘tenantId’ })
tenant: Tenant;

@ManyToOne(() => User, { onDelete: ‘CASCADE’ })
@JoinColumn({ name: ‘uploadedById’ })
uploadedBy: User;

@ManyToOne(() => Project, { nullable: true, onDelete: ‘CASCADE’ })
@JoinColumn({ name: ‘projectId’ })
project?: Project;

@ManyToOne(() => Task, { nullable: true, onDelete: ‘CASCADE’ })
@JoinColumn({ name: ‘taskId’ })
task?: Task;

// Computed properties
get sizeFormatted(): string {
const units = [‘B’, ‘KB’, ‘MB’, ‘GB’, ‘TB’];
let size = this.size;
let unitIndex = 0;

```
while (size >= 1024 && unitIndex < units.length - 1) {
  size /= 1024;
  unitIndex++;
}

return `${size.toFixed(1)} ${units[unitIndex]}`;
```

}

get isImage(): boolean {
return this.type === FileType.IMAGE;
}

get isVideo(): boolean {
return this.type === FileType.VIDEO;
}

get isDocument(): boolean {
return [FileType.DOCUMENT, FileType.SPREADSHEET, FileType.PRESENTATION].includes(this.type);
}
}

// api/src/files/dto/upload-file.dto.ts
import { IsOptional, IsString, IsUUID, IsBoolean, MaxLength } from ‘class-validator’;
import { Transform } from ‘class-transformer’;
import { ApiPropertyOptional } from ‘@nestjs/swagger’;

export class UploadFileDto {
@ApiPropertyOptional({ description: ‘File description’ })
@IsOptional()
@IsString()
@MaxLength(1000)
description?: string;

@ApiPropertyOptional({ description: ‘File tags (comma-separated)’ })
@IsOptional()
@IsString()
@MaxLength(500)
tags?: string;

@ApiPropertyOptional({ description: ‘Project ID to associate file with’ })
@IsOptional()
@IsUUID()
projectId?: string;

@ApiPropertyOptional({ description: ‘Task ID to associate file with’ })
@IsOptional()
@IsUUID()
taskId?: string;

@ApiPropertyOptional({ description: ‘Make file publicly accessible’ })
@IsOptional()
@IsBoolean()
@Transform(({ value }) => value === ‘true’)
isPublic?: boolean;
}

// api/src/files/dto/file-query.dto.ts
import { IsOptional, IsEnum, IsString, IsUUID, IsNumberString, IsIn, IsBoolean } from ‘class-validator’;
import { Transform } from ‘class-transformer’;
import { ApiPropertyOptional } from ‘@nestjs/swagger’;
import { FileType, FileStatus } from ‘../entities/file.entity’;

export class FileQueryDto {
@ApiPropertyOptional({ description: ‘Search in filename and description’ })
@IsOptional()
@IsString()
@Transform(({ value }) => value?.trim())
search?: string;

@ApiPropertyOptional({ enum: FileType, isArray: true })
@IsOptional()
@Transform(({ value }) => Array.isArray(value) ? value : [value])
@IsEnum(FileType, { each: true })
type?: FileType[];

@ApiPropertyOptional({ enum: FileStatus, isArray: true })
@IsOptional()
@Transform(({ value }) => Array.isArray(value) ? value : [value])
@IsEnum(FileStatus, { each: true })
status?: FileStatus[];

@ApiPropertyOptional({ description: ‘Filter by project ID’ })
@IsOptional()
@IsUUID()
projectId?: string;

@ApiPropertyOptional({ description: ‘Filter by task ID’ })
@IsOptional()
@IsUUID()
taskId?: string;

@ApiPropertyOptional({ description: ‘Filter by uploader’ })
@IsOptional()
@IsUUID()
uploadedById?: string;

@ApiPropertyOptional({ description: ‘Filter by tags (comma-separated)’ })
@IsOptional()
@IsString()
tags?: string;

@ApiPropertyOptional({ description: ‘Show only public files’ })
@IsOptional()
@Transform(({ value }) => value === ‘true’)
@IsBoolean()
isPublic?: boolean;

@ApiPropertyOptional({ example: ‘createdAt’, description: ‘Sort field’ })
@IsOptional()
@IsString()
@IsIn([‘filename’, ‘createdAt’, ‘updatedAt’, ‘size’, ‘type’])
sortBy?: string;

@ApiPropertyOptional({ example: ‘DESC’, enum: [‘ASC’, ‘DESC’] })
@IsOptional()
@IsIn([‘ASC’, ‘DESC’])
sortOrder?: ‘ASC’ | ‘DESC’;

@ApiPropertyOptional({ example: ‘1’, description: ‘Page number’ })
@IsOptional()
@IsNumberString()
@Transform(({ value }) => parseInt(value) || 1)
page?: number;

@ApiPropertyOptional({ example: ‘20’, description: ‘Items per page’ })
@IsOptional()
@IsNumberString()
@Transform(({ value }) => Math.min(parseInt(value) || 20, 100))
limit?: number;
}

// api/src/files/services/file.service.ts
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from ‘@nestjs/common’;
import { InjectRepository } from ‘@nestjs/typeorm’;
import { Repository, SelectQueryBuilder } from ‘typeorm’;
import { ConfigService } from ‘@nestjs/config’;
import { File, FileType, FileStatus } from ‘../entities/file.entity’;
import { UploadFileDto } from ‘../dto/upload-file.dto’;
import { FileQueryDto } from ‘../dto/file-query.dto’;
import { S3Service } from ‘./s3.service’;
import { ImageProcessingService } from ‘./image-processing.service’;
import { ProjectService } from ‘../../projects/services/project.service’;
import { TaskService } from ‘../../tasks/services/task.service’;
import { AuditService } from ‘../../audit/audit.service’;
import { CacheService } from ‘../../cache/cache.service’;
import * as crypto from ‘crypto’;
import * as mime from ‘mime-types’;
import * as path from ‘path’;

export interface PaginatedFiles {
data: File[];
total: number;
page: number;
limit: number;
totalPages: number;
}

export interface UploadUrlResponse {
uploadUrl: string;
fileId: string;
fields?: Record<string, string>;
}

@Injectable()
export class FileService {
private readonly maxFileSize: number;
private readonly allowedMimeTypes: string[];

constructor(
@InjectRepository(File)
private readonly fileRepository: Repository<File>,
private readonly s3Service: S3Service,
private readonly imageProcessingService: ImageProcessingService,
private readonly projectService: ProjectService,
private readonly taskService: TaskService,
private readonly auditService: AuditService,
private readonly cacheService: CacheService,
private readonly configService: ConfigService,
) {
this.maxFileSize = this.configService.get<number>(‘FILE_MAX_SIZE’, 100 * 1024 * 1024); // 100MB
this.allowedMimeTypes = this.configService.get<string>(‘FILE_ALLOWED_TYPES’, ‘’).split(’,’).filter(Boolean);
}

async generateUploadUrl(
uploadDto: UploadFileDto,
originalName: string,
mimeType: string,
size: number,
userId: string,
tenantId: string,
): Promise<UploadUrlResponse> {
// Validate file
await this.validateFile(originalName, mimeType, size);

```
// Validate project/task access
if (uploadDto.projectId) {
  await this.projectService.findOne(uploadDto.projectId, userId, tenantId);
}
if (uploadDto.taskId) {
  await this.taskService.findOne(uploadDto.taskId, userId, tenantId);
}

// Generate unique filename
const ext = path.extname(originalName);
const filename = `${crypto.randomUUID()}${ext}`;
const key = `${tenantId}/files/${filename}`;

// Determine file type
const fileType = this.getFileType(mimeType);

// Create file record
const file = this.fileRepository.create({
  filename,
  originalName,
  mimeType,
  type: fileType,
  size,
  url: `https://${this.s3Service.bucket}.s3.amazonaws.com/${key}`,
  status: FileStatus.UPLOADING,
  bucket: this.s3Service.bucket,
  key,
  description: uploadDto.description,
  tags: uploadDto.tags,
  projectId: uploadDto.projectId,
  taskId: uploadDto.taskId,
  isPublic: uploadDto.isPublic || false,
  tenantId,
  uploadedById: userId,
});

const savedFile = await this.fileRepository.save(file);

// Generate presigned upload URL
const uploadUrl = await this.s3Service.generatePresignedUploadUrl(
  key,
  mimeType,
  this.maxFileSize,
);

// Audit log
await this.auditService.log({
  action: 'file.upload_initiated',
  resourceType: 'file',
  resourceId: savedFile.id,
  userId,
  tenantId,
  metadata: { filename: originalName, size },
});

return {
  uploadUrl,
  fileId: savedFile.id,
};
```

}

async confirmUpload(
fileId: string,
userId: string,
tenantId: string,
): Promise<File> {
const file = await this.fileRepository.findOne({
where: { id: fileId, tenantId },
});

```
if (!file) {
  throw new NotFoundException('File not found');
}

if (file.uploadedById !== userId) {
  throw new ForbiddenException('Access denied');
}

// Verify file exists in S3
const exists = await this.s3Service.fileExists(file.key);
if (!exists) {
  await this.fileRepository.update(fileId, { status: FileStatus.ERROR });
  throw new BadRequestException('File upload failed');
}

// Generate checksum
const checksum = await this.s3Service.getFileChecksum(file.key);

// Update file status
await this.fileRepository.update(fileId, {
  status: FileStatus.PROCESSING,
  checksum,
});

// Process file asynchronously
this.processFileAsync(fileId);

// Clear cache
await this.clearFileCache(tenantId);

// Audit log
await this.auditService.log({
  action: 'file.uploaded',
  resourceType: 'file',
  resourceId: fileId,
  userId,
  tenantId,
  metadata: { filename: file.originalName },
});

return this.findOne(fileId, userId, tenantId);
```

}

async findAll(
query: FileQueryDto,
userId: string,
tenantId: string,
): Promise<PaginatedFiles> {
const {
search,
type,
status,
projectId,
taskId,
uploadedById,
tags,
isPublic,
sortBy = ‘createdAt’,
sortOrder = ‘DESC’,
page = 1,
limit = 20,
} = query;

```
const cacheKey = `files:tenant:${tenantId}:${JSON.stringify(query)}`;
const cached = await this.cacheService.get(cacheKey);
if (cached) {
  return cached;
}

let queryBuilder = this.fileRepository
  .createQueryBuilder('file')
  .leftJoinAndSelect('file.uploadedBy', 'uploadedBy')
  .leftJoinAndSelect('file.project', 'project')
  .leftJoinAndSelect('file.task', 'task')
  .where('file.tenantId = :tenantId', { tenantId })
  .andWhere('file.status != :deletedStatus', { deletedStatus: FileStatus.DELETED });

// Apply access control - users can see files they uploaded or public files in accessible projects
const accessibleProjects = await this.getAccessibleProjects(userId, tenantId);
if (accessibleProjects.length > 0) {
  queryBuilder.andWhere(
    '(file.uploadedById = :userId OR file.isPublic = true OR ' +
    '(file.projectId IS NOT NULL AND file.projectId IN (:...projectIds)) OR ' +
    '(file.taskId IS NOT NULL AND EXISTS (SELECT 1 FROM tasks t WHERE t.id = file.taskId AND t.projectId IN (:...projectIds))))',
    { userId, projectIds: accessibleProjects }
  );
} else {
  queryBuilder.andWhere('(file.uploadedById = :userId OR file.isPublic = true)', { userId });
}

// Apply filters
queryBuilder = this.applyFilters(queryBuilder, {
  search,
  type,
  status,
  projectId,
  taskId,
  uploadedById,
  tags,
  isPublic,
});

// Apply sorting
queryBuilder.orderBy(`file.${sortBy}`, sortOrder);

// Apply pagination
const offset = (page - 1) * limit;
queryBuilder.skip(offset).take(limit);

const [files, total] = await queryBuilder.getManyAndCount();

const result = {
  data: files,
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
};

// Cache for 2 minutes
await this.cacheService.set(cacheKey, result, 120);

return result;
```

}

async findOne(id: string, userId: string, tenantId: string): Promise<File> {
const file = await this.fileRepository
.createQueryBuilder(‘file’)
.leftJoinAndSelect(‘file.uploadedBy’, ‘uploadedBy’)
.leftJoinAndSelect(‘file.project’, ‘project’)
.leftJoinAndSelect(‘file.task’, ‘task’)
.where(‘file.id = :id’, { id })
.andWhere(‘file.tenantId = :tenantId’, { tenantId })
.andWhere(‘file.status != :deletedStatus’, { deletedStatus: FileStatus.DELETED })
.getOne();

```
if (!file) {
  throw new NotFoundException('File not found');
}

// Check access permissions
await this.checkFileAccess(file, userId, 'read');

return file;
```

}

async update(
id: string,
updateData: Partial<UploadFileDto>,
userId: string,
tenantId: string,
): Promise<File> {
const file = await this.findOne(id, userId, tenantId);

```
// Check write permissions
await this.checkFileAccess(file, userId, 'write');

// Validate project/task access if changing
if (updateData.projectId) {
  await this.projectService.findOne(updateData.projectId, userId, tenantId);
}
if (updateData.taskId) {
  await this.taskService.findOne(updateData.taskId, userId, tenantId);
}

await this.fileRepository.update(id, {
  ...updateData,
  updatedAt: new Date(),
});

// Clear cache
await this.clearFileCache(tenantId);

// Audit log
await this.auditService.log({
  action: 'file.updated',
  resourceType: 'file',
  resourceId: id,
  userId,
  tenantId,
  metadata: { changes: updateData },
});

return this.findOne(id, userId, tenantId);
```

}

async remove(id: string, userId: string, tenantId: string): Promise<void> {
const file = await this.findOne(id, userId, tenantId);

```
// Check delete permissions
await this.checkFileAccess(file, userId, 'delete');

// Soft delete in database
await this.fileRepository.update(id, {
  status: FileStatus.DELETED,
  updatedAt: new Date(),
});

// Schedule S3 deletion (async)
this.deleteFromS3Async(file.key);

// Clear cache
await this.clearFileCache(tenantId);

// Audit log
await this.auditService.log({
  action: 'file.deleted',
  resourceType: 'file',
  resourceId: id,
  userId,
  tenantId,
  metadata: { filename: file.originalName },
});
```

}

async generateDownloadUrl(
id: string,
userId: string,
tenantId: string,
expiresIn: number = 3600,
): Promise<string> {
const file = await this.findOne(id, userId, tenantId);

```
if (file.status !== FileStatus.READY) {
  throw new BadRequestException('File is not ready for download');
}

// Generate presigned download URL
const downloadUrl = await this.s3Service.generatePresignedDownloadUrl(
  file.key,
  file.originalName,
  expiresIn,
);

// Audit log
await this.auditService.log({
  action: 'file.downloaded',
  resourceType: 'file',
  resourceId: id,
  userId,
  tenantId,
  metadata: { filename: file.originalName },
});

return downloadUrl;
```

}

async getFileStats(
userId: string,
tenantId: string,
projectId?: string,
): Promise<any> {
let queryBuilder = this.fileRepository
.createQueryBuilder(‘file’)
.where(‘file.tenantId = :tenantId’, { tenantId })
.andWhere(‘file.status != :deletedStatus’, { deletedStatus: FileStatus.DELETED });

```
if (projectId) {
  queryBuilder.andWhere('file.projectId = :projectId', { projectId });
}

// Apply access control
const accessibleProjects = await this.getAccessibleProjects(userId, tenantId);
if (accessibleProjects.length > 0) {
  queryBuilder.andWhere(
    '(file.uploadedById = :userId OR file.isPublic = true OR ' +
    '(file.projectId IS NOT NULL AND file.projectId IN (:...projectIds)))',
    { userId, projectIds: accessibleProjects }
  );
} else {
  queryBuilder.andWhere('(file.uploadedById = :userId OR file.isPublic = true)', { userId });
}

const stats = await queryBuilder
  .select([
    'COUNT(*) as totalFiles',
    'SUM(file.size) as totalSize',
    'COUNT(CASE WHEN file.type = \'image\' THEN 1 END) as imageFiles',
    'COUNT(CASE WHEN file.type = \'document\' THEN 1 END) as documentFiles',
    'COUNT(CASE WHEN file.type = \'video\' THEN 1 END) as videoFiles',
    'COUNT(CASE WHEN file.type = \'audio\' THEN 1 END) as audioFiles',
    'COUNT(CASE WHEN file.status = \'ready\' THEN 1 END) as readyFiles',
    'COUNT(CASE WHEN file.status = \'processing\' THEN 1 END) as processingFiles',
    'COUNT(CASE WHEN file.status = \'error\' THEN 1 END) as errorFiles',
  ])
  .getRawOne();

return {
  totalFiles: parseInt(stats.totalFiles) || 0,
  totalSize: parseInt(stats.totalSize) || 0,
  totalSizeFormatted: this.formatFileSize(parseInt(stats.totalSize) || 0),
  filesByType: {
    image: parseInt(stats.imageFiles) || 0,
    document: parseInt(stats.documentFiles) || 0,
    video: parseInt(stats.videoFiles) || 0,
    audio: parseInt(stats.audioFiles) || 0,
  },
  filesByStatus: {
    ready: parseInt(stats.readyFiles) || 0,
    processing: parseInt(stats.processingFiles) || 0,
    error: parseInt(stats.errorFiles) || 0,
  },
};
```

}

// Helper Methods
private async validateFile(
filename: string,
mimeType: string,
size: number,
): Promise<void> {
// Check file size
if (size > this.maxFileSize) {
throw new BadRequestException(`File size exceeds maximum allowed size of ${this.formatFileSize(this.maxFileSize)}`);
}

```
// Check mime type if restrictions are configured
if (this.allowedMimeTypes.length > 0 && !this.allowedMimeTypes.includes(mimeType)) {
  throw new BadRequestException('File type not allowed');
}

// Check for suspicious file extensions
const ext = path.extname(filename).toLowerCase();
const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com'];
if (dangerousExtensions.includes(ext)) {
  throw new BadRequestException('File type not allowed for security reasons');
}
```

}

private getFileType(mimeType: string): FileType {
if (mimeType.startsWith(‘image/’)) return FileType.IMAGE;
if (mimeType.startsWith(‘video/’)) return FileType.VIDEO;
if (mimeType.startsWith(‘audio/’)) return FileType.AUDIO;

```
const documentTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/html',
  'application/rtf',
];
if (documentTypes.includes(mimeType)) return FileType.DOCUMENT;

const spreadsheetTypes = [
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
];
if (spreadsheetTypes.includes(mimeType)) return FileType.SPREADSHEET;

const presentationTypes = [
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];
if (presentationTypes.includes(mimeType)) return FileType.PRESENTATION;

const archiveTypes = [
  'application/zip',
  'application/x-rar-compressed',
  'application/x-tar',
  'application/gzip',
];
if (archiveTypes.includes(mimeType)) return FileType.ARCHIVE;

return FileType.OTHER;
```

}

private async processFileAsync(fileId: string): Promise<void> {
try {
const file = await this.fileRepository.findOne({ where: { id: fileId } });
if (!file) return;

```
  const metadata: any = {};

  // Process images
  if (file.type === FileType.IMAGE) {
    const imageInfo = await this.imageProcessingService.getImageInfo(file.key);
    metadata.width = imageInfo.width;
    metadata.height = imageInfo.height;

    // Generate thumbnail
    const thumbnailKey = `${file.key.replace(/\.[^.]+$/, '')}_thumb.jpg`;
    await this.imageProcessingService.generateThumbnail(file.key, thumbnailKey);
    file.thumbnailUrl = `https://${this.s3Service.bucket}.s3.amazonaws.com/${thumbnailKey}`;
  }

  // Update file with metadata and ready status
  await this.fileRepository.update(fileId, {
    status: FileStatus.READY,
    metadata,
    thumbnailUrl: file.thumbnailUrl,
    updatedAt: new Date(),
  });

} catch (error) {
  console.error(`Error processing file ${fileId}:`, error);
  await this.fileRepository.update(fileId, {
    status: FileStatus.ERROR,
    updatedAt: new Date(),
  });
}
```

}

private async deleteFromS3Async(key: string): Promise<void> {
try {
await this.s3Service.deleteFile(key);

```
  // Also delete thumbnail if exists
  const thumbnailKey = `${key.replace(/\.[^.]+$/, '')}_thumb.jpg`;
  await this.s3Service.deleteFile(thumbnailKey);
} catch (error) {
  console.error(`Error deleting file from S3: ${key}`, error);
}
```

}

private async getAccessibleProjects(userId: string, tenantId: string): Promise<string[]> {
const cacheKey = `user:${userId}:accessible_projects`;
let projectIds = await this.cacheService.get(cacheKey);

```
if (!projectIds) {
  const projects = await this.projectService.findAll(
    { limit: 1000 },
    userId,
    tenantId,
  );
  projectIds = projects.data.map(p => p.id);
  await this.cacheService.set(cacheKey, projectIds, 300);
}

return projectIds;
```

}

private async checkFileAccess(
file: File,
userId: string,
action: ‘read’ | ‘write’ | ‘delete’,
): Promise<void> {
// Owner has all permissions
if (file.uploadedById === userId) {
return;
}

```
// Public files can be read by anyone
if (action === 'read' && file.isPublic) {
  return;
}

// Check project access if file is associated with a project
if (file.projectId) {
  try {
    await this.projectService.findOne(file.projectId, userId, file.tenantId);
    
    // Project members can read files, but only owners can write/delete
    if (action === 'read') {
      return;
    }
  } catch {
    // No project access
  }
}

// Check task access if file is associated with a task
if (file.taskId) {
  try {
    await this.taskService.findOne(file.taskId, userId, file.tenantId);
    
    // Task participants can read files, but only creators/assignees can write/delete
    if (action === 'read') {
      return;
    }
  } catch {
    // No task access
  }
}

throw new ForbiddenException('Access denied to this file');
```

}

private applyFilters(queryBuilder: SelectQueryBuilder<File>, filters: any) {
const {
search,
type,
status,
projectId,
taskId,
uploadedById,
tags,
isPublic,
} = filters;

```
if (search) {
  queryBuilder.andWhere(
    '(LOWER(file.filename) LIKE LOWER(:search) OR LOWER(file.originalName) LIKE LOWER(:search) OR LOWER(file.description) LIKE LOWER(:search))',
    { search: `%${search}%` }
  );
}

if (type && type.length > 0) {
  queryBuilder.andWhere('file.type IN (:...type)', { type });
}

if (status && status.length > 0) {
  queryBuilder.andWhere('file.status IN (:...status)', { status });
}

if (projectId) {
  queryBuilder.andWhere('file.projectId = :projectId', { projectId });
}

if (taskId) {
  queryBuilder.andWhere('file.taskId = :taskId', { taskId });
}

if (uploadedById) {
  queryBuilder.andWhere('file.uploadedById = :uploadedById', { uploadedById });
}

if (tags) {
  const tagArray = tags.split(',').map(tag => tag.trim());
  queryBuilder.andWhere(
    'file.tags IS NOT NULL AND (' +
    tagArray.map((_, index) => `file.tags LIKE :tag${index}`).join(' OR ') +
    ')',
    tagArray.reduce((params, tag, index) => {
      params[`tag${index}`] = `%${tag}%`;
      return params;
    }, {})
  );
}

if (isPublic !== undefined) {
  queryBuilder.andWhere('file.isPublic = :isPublic', { isPublic });
}

return queryBuilder;
```

}

private async clearFileCache(tenantId: string): Promise<void> {
const patterns = [
`files:tenant:${tenantId}*`,
`user:*:accessible_projects`,
];

```
for (const pattern of patterns) {
  await this.cacheService.delPattern(pattern);
}
```

}

private formatFileSize(bytes: number): string {
const units = [‘B’, ‘KB’, ‘MB’, ‘GB’, ‘TB’];
let size = bytes;
let unitIndex = 0;

```
while (size >= 1024 && unitIndex < units.length - 1) {
  size /= 1024;
  unitIndex++;
}

return `${size.toFixed(1)} ${units[unitIndex]}`;
```

}
}
// User and Authentication Types
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthUser extends User {
  tenantId: string;
  role: Role;
}

export interface JwtPayload {
  sub: string;
  email: string;
  tenantId: string;
  role: Role;
  iat: number;
  exp: number;
}

// Tenant and Organization Types
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: Plan;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrgUser {
  tenantId: string;
  userId: string;
  role: Role;
  joinedAt: Date;
}

// Project and Task Types
export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  startDate?: Date;
  endDate?: Date;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: Date;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  assignees?: TaskAssignee[];
  tags?: Tag[];
}

export interface TaskAssignee {
  taskId: string;
  userId: string;
  assignedAt: Date;
}

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  taskId: string;
  content: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
}

// File and Media Types
export interface File {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  entityType: EntityType;
  entityId: string;
  uploadedById: string;
  createdAt: Date;
}

// Custom Fields
export interface CustomField {
  id: string;
  projectId: string;
  name: string;
  type: CustomFieldType;
  options?: any;
  required: boolean;
  createdAt: Date;
}

// Saved Views
export interface SavedView {
  id: string;
  name: string;
  filters: any;
  columns: any;
  sorting?: any;
  userId: string;
  isPublic: boolean;
  createdAt: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Real-time Event Types
export interface RealtimeEvent {
  event: string;
  data: any;
  ts: number;
}

export interface TypingEvent {
  entityType: 'task' | 'project';
  entityId: string;
  by: string;
}

// Enums
export enum Plan {
  TRIAL = 'TRIAL',
  BASIC = 'BASIC',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ORG_ADMIN = 'ORG_ADMIN',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  TEAM_MEMBER = 'TEAM_MEMBER',
  CLIENT = 'CLIENT',
}

export enum ProjectRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  TRIAL = 'TRIAL',
  PAST_DUE = 'PAST_DUE',
  CANCELED = 'CANCELED',
}

export enum ProjectStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  DONE = 'DONE',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum EntityType {
  PROJECT = 'PROJECT',
  TASK = 'TASK',
}

export enum CustomFieldType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
  SELECT = 'SELECT',
  MULTI_SELECT = 'MULTI_SELECT',
  BOOLEAN = 'BOOLEAN',
}


import { Role, Plan } from '../types';

// Permission checking utilities
export const hasPermission = (userRole: Role, requiredRole: Role): boolean => {
  const roleHierarchy = {
    [Role.SUPER_ADMIN]: 5,
    [Role.ORG_ADMIN]: 4,
    [Role.PROJECT_MANAGER]: 3,
    [Role.TEAM_MEMBER]: 2,
    [Role.CLIENT]: 1,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

export const canManageTenants = (role: Role): boolean => {
  return role === Role.SUPER_ADMIN;
};

export const canManageOrganization = (role: Role): boolean => {
  return hasPermission(role, Role.ORG_ADMIN);
};

export const canManageProjects = (role: Role): boolean => {
  return hasPermission(role, Role.PROJECT_MANAGER);
};

export const canViewAuditLogs = (role: Role): boolean => {
  return hasPermission(role, Role.ORG_ADMIN);
};

// Plan feature checking utilities
export const getPlanFeatures = (plan: Plan) => {
  const features = {
    [Plan.TRIAL]: {
      maxProjects: 3,
      maxUsers: 5,
      maxStorageGB: 1,
      hasAI: false,
      hasIntegrations: false,
      hasAdvancedReports: false,
      hasPrioritySupport: false,
    },
    [Plan.BASIC]: {
      maxProjects: 10,
      maxUsers: 25,
      maxStorageGB: 10,
      hasAI: false,
      hasIntegrations: true,
      hasAdvancedReports: false,
      hasPrioritySupport: false,
    },
    [Plan.PRO]: {
      maxProjects: 50,
      maxUsers: 100,
      maxStorageGB: 100,
      hasAI: true,
      hasIntegrations: true,
      hasAdvancedReports: true,
      hasPrioritySupport: false,
    },
    [Plan.ENTERPRISE]: {
      maxProjects: -1, // unlimited
      maxUsers: -1, // unlimited
      maxStorageGB: -1, // unlimited
      hasAI: true,
      hasIntegrations: true,
      hasAdvancedReports: true,
      hasPrioritySupport: true,
    },
  };

  return features[plan];
};

export const canUseFeature = (plan: Plan, feature: keyof ReturnType<typeof getPlanFeatures>): boolean => {
  const planFeatures = getPlanFeatures(plan);
  return Boolean(planFeatures[feature]);
};

// Utility functions
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// Date utilities
export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const isOverdue = (dueDate: Date | string): boolean => {
  return new Date(dueDate) < new Date();
};

export const getDaysUntilDue = (dueDate: Date | string): number => {
  const due = new Date(dueDate);
  const now = new Date();
  const diffTime = due.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Color utilities
export const getContrastColor = (hexColor: string): string => {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#FFFFFF';
};

export const lightenColor = (hexColor: string, percent: number): string => {
  const num = parseInt(hexColor.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
};


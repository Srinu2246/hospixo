import { z } from 'zod';

// ============================================================================
// 1. User Role Table / Modal Schema
// ============================================================================

export const userRoleFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  role: z.string().min(1, 'Please select a role'),
  branch: z.string().min(1, 'Please select a branch'),
  status: z.enum(['active', 'invited', 'disabled', 'inactive']),
  company: z.string().optional(),
});

export type UserRoleFormValues = z.infer<typeof userRoleFormSchema>;

// ============================================================================
// 2. Create User Multi-Form Flow Schema
// ============================================================================

export const createUserMultiformSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phoneNumber: z.string().min(6, 'Please enter a valid phone number'),
  email: z.string().email('Please enter a valid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  company: z.string().min(1, 'Please select a company'),
  branch: z.string().min(1, 'Please select a branch'),
  role: z.string().min(1, 'Please select a role'),
  sendInviteImmediately: z.boolean(),
  personalMessage: z.string(),
});

export type CreateUserMultiformValues = z.infer<typeof createUserMultiformSchema>;

// ============================================================================
// 3. Custom Role Template Schema
// ============================================================================

export const customTemplateSchema = z.object({
  templateName: z.string().min(1, 'Template name is required'),
  description: z.string().optional(),
  preset: z.enum(['full_read', 'standard_manager', 'view_only', 'custom']),
});

export type CustomTemplateFormValues = z.infer<typeof customTemplateSchema>;

// ============================================================================
// 4. Staff Profile Schema
// ============================================================================

export const staffProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  phoneNumber: z.string().min(6, 'Please enter a valid phone number'),
  countryCode: z.string(),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().optional(),
  userStatus: z.boolean(),
  roleName: z.string().min(1, 'Role name is required'),
  roleDescription: z.string().optional(),
});

export type StaffProfileFormValues = z.infer<typeof staffProfileSchema>;

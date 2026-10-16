import { z } from 'zod';

const branchMenuAssignmentDtoSchema = z.object({
  id: z.union([z.string(), z.number()]),
  branch_id: z.union([z.string(), z.number()]),
  menu_id: z.union([z.string(), z.number()]),
  menu_name: z.string().optional(),
  menu_code: z.string().optional(),
  menu_type: z.string().optional(),
  display_order: z.number().optional(),
  is_default: z.boolean().optional(),
  status: z.string().optional(),
});

const branchMenuAssignmentListPayloadSchema = z.union([
  z.array(branchMenuAssignmentDtoSchema),
  z.object({
    success: z.boolean().optional(),
    data: z.array(branchMenuAssignmentDtoSchema),
    message: z.string().optional(),
  }),
]);

export const branchMenuAssignmentSchema = z.object({
  id: z.string(),
  branchId: z.string(),
  menuId: z.string(),
  menuName: z.string().optional(),
  menuCode: z.string().optional(),
  menuType: z.string().optional(),
  displayOrder: z.number(),
  isDefault: z.boolean(),
  status: z.enum(['Active', 'Inactive']).or(z.string()),
});

export const branchMenuAssignmentListSchema = z.array(branchMenuAssignmentSchema);

export type BranchMenuAssignment = z.infer<typeof branchMenuAssignmentSchema>;

function mapBranchMenuAssignmentDto(
  raw: z.infer<typeof branchMenuAssignmentDtoSchema>,
): BranchMenuAssignment {
  const statusRaw = String(raw.status ?? 'active');
  return {
    id: String(raw.id),
    branchId: String(raw.branch_id),
    menuId: String(raw.menu_id),
    menuName: raw.menu_name,
    menuCode: raw.menu_code,
    menuType: raw.menu_type,
    displayOrder: raw.display_order ?? 0,
    isDefault: raw.is_default ?? false,
    status: statusRaw.toLowerCase() === 'active' ? 'Active' : 'Inactive',
  };
}

export function parseBranchMenuAssignmentList(payload: unknown): BranchMenuAssignment[] {
  const parsed = branchMenuAssignmentListPayloadSchema.parse(payload);
  const list = Array.isArray(parsed) ? parsed : parsed.data;
  return branchMenuAssignmentListSchema.parse(list.map(mapBranchMenuAssignmentDto));
}

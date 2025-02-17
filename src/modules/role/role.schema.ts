import {
  object,
  string,
  number,
  optional,
  array,
  minLength,
  pipe,
} from 'valibot';
import * as v from 'valibot';

export const assignPermissionSchema = object({
  roleId: number(),
  permissionIds: pipe(
    array(number()),
    minLength(1, 'At least one permission ID is required'),
  ),
});

export const createRoleSchema = object({
  name: pipe(
    string(),
    minLength(3, 'Role name must be at least 3 characters long'),
  ),
  desc: optional(
    pipe(
      string(),
      minLength(3, 'Role description must be at least 3 characters long'),
    ),
  ),
});

export type AssignPermissionDataType = v.InferOutput<
  typeof assignPermissionSchema
>;
export type CreateRoleDataType = v.InferOutput<typeof createRoleSchema>;

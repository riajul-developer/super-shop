import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma.service';
import { AssignPermissionDataType, CreateRoleDataType } from './role.schema';
import {
  badErrorResponse,
  createdResponse,
  notFoundResponse,
  successResponse,
} from 'src/common/utils/response.util';
import { paginateData } from 'src/common/utils/pagination.util';

@Injectable()
export class RoleService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new role
  async createRole(roleData: CreateRoleDataType) {
    const existingRole = await this.prisma.role.findUnique({
      where: { name: roleData.name },
    });

    if (existingRole) {
      badErrorResponse('', [
        {
          field: 'name',
          message: 'This role name is already in use',
        },
      ]);
    }

    const role = await this.prisma.role.create({
      data: {
        name: roleData.name,
        desc: roleData.desc,
      },
    });
    return createdResponse('Role created successfully', role);
  }

  // Assign permissions to a role
  async assignPermissions(assignPermissionData: AssignPermissionDataType) {
    const { roleId, permissionIds } = assignPermissionData;

    const role = await this.prisma.role.findUnique({ where: { id: roleId } });

    if (!role) {
      badErrorResponse('', [
        {
          field: 'roleId',
          message: 'This role not found',
        },
      ]);
    }

    const validPermissions = await this.prisma.permission.findMany({
      where: { id: { in: permissionIds } },
      select: { id: true },
    });

    const validPermissionIds = validPermissions.map((p) => p.id);
    const invalidPermissions = permissionIds.filter(
      (id) => !validPermissionIds.includes(id),
    );

    if (invalidPermissions.length > 0) {
      badErrorResponse('', [
        {
          field: 'permissionIds',
          message: `Invalid permission IDs: ${invalidPermissions.join(', ')}`,
        },
      ]);
    }

    const existingRolePermissions = await this.prisma.rolePermission.findMany({
      where: {
        roleId: roleId,
        permissionId: { in: validPermissionIds },
      },
      select: { permissionId: true },
    });

    const existingPermissionIds = existingRolePermissions.map(
      (rp) => rp.permissionId,
    );
    const newPermissionsToAdd = validPermissionIds.filter(
      (id) => !existingPermissionIds.includes(id),
    );

    if (newPermissionsToAdd.length === 0) {
      return createdResponse(
        'All permissions are already assigned to this role',
      );
    }

    await this.prisma.rolePermission.createMany({
      data: newPermissionsToAdd.map((permissionId) => ({
        roleId: roleId,
        permissionId: permissionId,
      })),
    });

    return createdResponse('Permissions assigned successfully');
  }

  async getAllRoles(page: number = 1, limit: number = 10, baseUrl: string) {
    const skip = (page - 1) * limit;
  
    const total = await this.prisma.role.count();
  
    const roles = await this.prisma.role.findMany({
      take: limit,
      skip,
    });
  
    if (!roles.length) {
      notFoundResponse('No roles found');
    }
  
    const pagination = paginateData(page, limit, total, baseUrl);
  
    return successResponse('Roles retrieved successfully', {
      roles,
      pagination
    });
  }
  
  async getRoleById(roleId: number) {
    const role = await this.prisma.role.findUnique({
      where: {
        id: Number(roleId),
      },
      include: {
        rolePermission: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role) {
      notFoundResponse('Role not found')
    }
    
    const responseData = {
      id: role.id,
      name: role.name,
      desc: role.desc,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
      permissions: role.rolePermission.map((item) => ({
        id: item.permission.id,
        name: item.permission.name,
        description: item.permission.desc,
        createdAt: item.permission.createdAt,
        updatedAt: item.permission.updatedAt,
      })),
    };

    return successResponse('Role retrieved successfully', responseData);
  }
}

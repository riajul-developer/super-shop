import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/config/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { AssignPermissionDto } from './dto/assign-permission.dto';
import { AssignPermissionDataType, CreateRoleDataType } from './role.schema';
import { Prisma } from '@prisma/client';
import {
  badErrorResponse,
  createdResponse,
  serverErrorResponse,
} from 'src/common/utils/response.util';

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
      ]) 
    }

    try {
      const role = await this.prisma.role.create({
        data: {
          name: roleData.name,
          desc: roleData.desc,
        },
      });
      return createdResponse('Role created successfully', role);
    } catch (error) {
      serverErrorResponse();
    }
    
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
      ]) 
    }
  
    const validPermissions = await this.prisma.permission.findMany({
      where: { id: { in: permissionIds } },
      select: { id: true },
    });
  
    const validPermissionIds = validPermissions.map((p) => p.id);
    const invalidPermissions = permissionIds.filter(
      (id) => !validPermissionIds.includes(id)
    );
  
    if (invalidPermissions.length > 0) {
      badErrorResponse('', [
        {
          field: 'permissionIds',
          message: `Invalid permission IDs: ${invalidPermissions.join(', ')}`,
        },
      ]) 
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
      (id) => !existingPermissionIds.includes(id)
    );
  
    if (newPermissionsToAdd.length === 0) {
      return createdResponse(
        'All permissions are already assigned to this role'
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
  

  // Get all roles
  async getAllRoles() {
    return this.prisma.role.findMany({
      include: { rolePermission: true },
    });
  }
}

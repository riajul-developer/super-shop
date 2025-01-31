import { Controller, Post, Body, Get } from '@nestjs/common';
import { RoleService } from './role.service';
import {
  AssignPermissionDataType,
  assignPermissionSchema,
  CreateRoleDataType,
  createRoleSchema,
} from './role.schema';
import ValibotValidationPipe from 'src/common/pipes/valibot.validation.pipe';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  createRole(
    @Body(new ValibotValidationPipe(createRoleSchema))
    body: CreateRoleDataType,
  ) {
    return this.roleService.createRole(body);
  }

  @Post('assign-permissions')
  assignPermissions(
    @Body(new ValibotValidationPipe(assignPermissionSchema))
    assignPermissionData: AssignPermissionDataType,
  ) {
    return this.roleService.assignPermissions(assignPermissionData);
  }

  @Get()
  getAllRoles() {
    return this.roleService.getAllRoles();
  }
}

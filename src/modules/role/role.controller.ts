import { Controller, Post, Body, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { RoleService } from './role.service';
import {
  AssignPermissionDataType,
  assignPermissionSchema,
  CreateRoleDataType,
  createRoleSchema,
} from './role.schema';
import ValibotValidationPipe from 'src/common/pipes/valibot.validation.pipe';
import { FastifyRequest } from 'fastify';
import BaseUrl from 'src/common/utils/base-url.util';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

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
  @UseGuards(JwtAuthGuard)
  async getRoles(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Req() req: FastifyRequest,
  ) {
    const baseUrl = BaseUrl(req, '/roles');

    return this.roleService.getAllRoles(
      Number(page) || 1,
      Number(limit) || 10,
      baseUrl,
    );
  }

  @Get(':id')
  getRoleById(@Param('id') id: number) {
    return this.roleService.getRoleById(id);
  }
}

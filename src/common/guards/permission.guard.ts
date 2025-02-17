import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { unauthorizedResponse } from '../utils/response.util';

@Injectable()
export class PermissionGuardClass implements CanActivate {
  private requiredPermission: string;

  constructor(requiredPermission: string) {
    this.requiredPermission = requiredPermission;
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.permissions) {
      unauthorizedResponse();
    }

    return user.permissions.includes(this.requiredPermission);
  }
}

export default function PermissionGuard(permission: string) {
  return new PermissionGuardClass(permission);
}

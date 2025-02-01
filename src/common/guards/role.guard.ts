import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { unauthorizedResponse } from '../utils/response.util';

@Injectable()
export class RoleGuardClass implements CanActivate {
  private requiredRole: string;

  constructor(requiredRole: string) {
    this.requiredRole = requiredRole;
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role) {
      unauthorizedResponse();
    }

    return user.role === this.requiredRole;
  }
}


export default function RoleGuard(role: string) {
  return new RoleGuardClass(role);
}

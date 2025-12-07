import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common';
import {Reflector} from '@nestjs/core';
import {POLICY_KEY} from './policy.decorator';
import {getPolicyMatrix} from './policy.config';

@Injectable()
export class PolicyGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const permission = this.reflector.getAllAndOverride<string>(POLICY_KEY, [
      context.getHandler(),
      context.getClass()
    ]);
    if (!permission) return true;
    const req = context.switchToHttp().getRequest<any>();
    const user = req.user;
    if (!user) return false;
    const matrix = getPolicyMatrix();
    const allowedRoles = matrix[permission] || [];
    return allowedRoles.includes(user.role);
  }
}



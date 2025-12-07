import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common';
import {Reflector} from '@nestjs/core';
import {ROLES_KEY} from './roles.decorator';
import {PrismaService} from '../../services/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector, private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ]);
    if (!required || required.length === 0) return true;
    const req = context.switchToHttp().getRequest<any>();
    const user = req.user;
    if (!user) return false;
    if (required.includes(user.role)) return true;
    // allow institution admins when route has :id
    const params = req.params || {};
    const institutionId = params.id || params.institutionId;
    if (institutionId) {
      const membership = await this.prisma.membership.findFirst({
        where: {userId: user.id, institutionId, role: 'INSTITUTION_ADMIN', status: 'ACTIVE'}
      });
      if (membership) return true;
      const inst = await this.prisma.institution.findUnique({where: {id: institutionId}, select: {ownerUserId: true}});
      if (inst?.ownerUserId === user.id) return true;
    }
    return false;
  }
}

@Injectable()
export class InstitutionAdminGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<any>();
    const user = req.user;
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    const params = req.params || {};
    const institutionId = params.id || params.institutionId;
    if (!institutionId) return false;
    const membership = await this.prisma.membership.findFirst({
      where: {userId: user.id, institutionId, role: 'INSTITUTION_ADMIN', status: 'ACTIVE'}
    });
    if (membership) return true;
    const inst = await this.prisma.institution.findUnique({where: {id: institutionId}, select: {ownerUserId: true}});
    return inst?.ownerUserId === user.id;
  }
}


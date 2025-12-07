import {Body, Controller, Get, Param, Patch, Post, UseGuards} from '@nestjs/common';
import {MembershipsService} from './memberships.service';
import {Role, MembershipStatus} from '@prisma/client';
import {JwtAuthGuard} from '../auth/jwt.guard';
import {InstitutionAdminGuard} from '../auth/roles.guard';
import {Policy} from '../auth/policy.decorator';
import {PolicyGuard} from '../auth/policy.guard';

@Controller()
export class MembershipsController {
  constructor(private svc: MembershipsService) {}

  @UseGuards(JwtAuthGuard, InstitutionAdminGuard, PolicyGuard)
  @Policy('memberships:manage')
  @Post('institutions/:id/invite')
  invite(@Param('id') id: string, @Body() body: {email: string; role: Role}) {
    return this.svc.invite(id, body.email, body.role);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('memberships/:id/accept')
  accept(@Param('id') id: string) {
    return this.svc.accept(id);
  }

  @UseGuards(JwtAuthGuard, InstitutionAdminGuard, PolicyGuard)
  @Policy('memberships:manage')
  @Patch('memberships/:id')
  update(@Param('id') id: string, @Body() body: {role?: Role; status?: MembershipStatus}) {
    return this.svc.update(id, {role: body.role, status: body.status});
  }

  @UseGuards(JwtAuthGuard, InstitutionAdminGuard, PolicyGuard)
  @Policy('memberships:manage')
  @Get('institutions/:id/memberships')
  list(@Param('id') id: string) {
    return this.svc.listByInstitution(id);
  }
}


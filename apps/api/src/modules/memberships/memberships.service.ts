import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {PrismaService} from '../../services/prisma.service';
import {Role, MembershipStatus} from '@prisma/client';
import {AuditService} from '../audit/audit.service';

@Injectable()
export class MembershipsService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  async invite(institutionId: string, userEmail: string, role: Role) {
    const user = await this.prisma.user.findUnique({where: {email: userEmail}});
    if (!user) throw new NotFoundException('User not found');
    const inst = await this.prisma.institution.findUnique({where: {id: institutionId}});
    if (!inst) throw new NotFoundException('Institution not found');
    const existing = await this.prisma.membership.findFirst({where: {institutionId, userId: user.id}});
    if (existing) throw new BadRequestException('Membership already exists');
    const ms = await this.prisma.membership.create({
      data: {
        institutionId,
        userId: user.id,
        role,
        status: MembershipStatus.PENDING
      }
    });
    await this.audit.log({action: 'membership.invite', targetType: 'membership', targetId: ms.id, metadata: {institutionId, userEmail, role}});
    return ms;
  }

  async accept(membershipId: string) {
    const ms = await this.prisma.membership.update({
      where: {id: membershipId},
      data: {status: MembershipStatus.ACTIVE}
    });
    await this.audit.log({action: 'membership.accept', targetType: 'membership', targetId: membershipId});
    return ms;
  }

  async update(membershipId: string, data: {role?: Role; status?: MembershipStatus}) {
    const ms = await this.prisma.membership.update({
      where: {id: membershipId},
      data
    });
    await this.audit.log({action: 'membership.update', targetType: 'membership', targetId: membershipId, metadata: data});
    return ms;
  }

  async listByInstitution(institutionId: string) {
    return this.prisma.membership.findMany({
      where: {institutionId},
      include: {user: true}
    });
  }
}


import {Injectable, NotFoundException} from '@nestjs/common';
import {PrismaService} from '../../services/prisma.service';
import {AuditService} from '../audit/audit.service';

@Injectable()
export class InstitutionsService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  async list() {
    return this.prisma.institution.findMany({
      orderBy: {createdAt: 'desc'}
    });
  }

  async get(id: string) {
    const inst = await this.prisma.institution.findUnique({where: {id}});
    if (!inst) throw new NotFoundException('Institution not found');
    return inst;
  }

  async create(input: {name: string; type: string; domain?: string; createdById?: string}) {
    const inst = await this.prisma.institution.create({
      data: {name: input.name, type: input.type as any, ownerUserId: input.createdById}
    });
    await this.audit.log({
      actorUserId: input.createdById,
      action: 'institution.create',
      targetType: 'institution',
      targetId: inst.id,
      metadata: {domain: input.domain}
    });
    return inst;
  }

  async verify(id: string, body: {verified: boolean; evidenceUrl?: string; note?: string}, actorUserId?: string) {
    const inst = await this.prisma.institution.update({
      where: {id},
      data: {verified: !!body.verified}
    });
    await this.audit.log({
      actorUserId,
      action: body.verified ? 'institution.verify' : 'institution.reject',
      targetType: 'institution',
      targetId: id,
      metadata: {evidenceUrl: body.evidenceUrl, note: body.note}
    });
    return inst;
  }

  // Org units
  async listUnits(institutionId: string) {
    return this.prisma.orgUnit.findMany({
      where: {institutionId},
      orderBy: {createdAt: 'asc'},
      select: {id: true, name: true, parentId: true, ownerUserId: true}
    });
  }

  async createUnit(institutionId: string, name: string, parentId?: string) {
    return this.prisma.orgUnit.create({
      data: {institutionId, name, parentId: parentId || undefined}
    });
  }

  async updateUnit(unitId: string, data: {name?: string; parentId?: string | null}) {
    return this.prisma.orgUnit.update({
      where: {id: unitId},
      data: {name: data.name, parentId: data.parentId === null ? null : data.parentId}
    });
  }

  async setUnitOwner(unitId: string, ownerEmail: string) {
    const user = await this.prisma.user.findUnique({where: {email: ownerEmail}});
    return this.prisma.orgUnit.update({
      where: {id: unitId},
      data: {ownerUserId: user?.id}
    });
  }

  async setInstitutionOwner(institutionId: string, ownerEmail: string, actorUserId?: string) {
    const user = await this.prisma.user.findUnique({where: {email: ownerEmail}});
    const updated = await this.prisma.institution.update({
      where: {id: institutionId},
      data: {ownerUserId: user?.id}
    });
    await this.audit.log({
      actorUserId,
      action: 'institution.owner.transfer',
      targetType: 'institution',
      targetId: institutionId,
      metadata: {ownerEmail}
    });
    return updated;
  }
}


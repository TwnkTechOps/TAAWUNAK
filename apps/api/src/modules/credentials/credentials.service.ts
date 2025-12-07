import {Injectable} from '@nestjs/common';
import {PrismaService} from '../../services/prisma.service';
import {AuditService} from '../audit/audit.service';

@Injectable()
export class CredentialsService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  async list(userId: string) {
    return this.prisma.credential.findMany({where: {userId}, orderBy: {createdAt: 'desc'}});
  }

  async create(userId: string, input: {type: 'ORCID' | 'ID_DOC' | 'CERT'; s3Key?: string}) {
    const cred = await this.prisma.credential.create({
      data: {userId, type: input.type, s3Key: input.s3Key}
    });
    await this.audit.log({actorUserId: userId, action: 'CREDENTIAL_CREATE', targetType: 'Credential', targetId: cred.id});
    return cred;
  }

  async remove(userId: string, id: string) {
    await this.prisma.credential.delete({where: {id}});
    await this.audit.log({actorUserId: userId, action: 'CREDENTIAL_DELETE', targetType: 'Credential', targetId: id});
    return {ok: true};
  }

  async listAll() {
    return this.prisma.credential.findMany({orderBy: {createdAt: 'desc'}, include: {user: {select: {email: true, fullName: true}}}});
  }

  async setStatus(id: string, status: 'PENDING'|'VERIFIED'|'REJECTED') {
    const cred = await this.prisma.credential.update({where: {id}, data: {status}});
    await this.audit.log({action: 'CREDENTIAL_STATUS', targetType: 'Credential', targetId: id, metadata: {status}});
    return cred;
  }
}



import {Injectable} from '@nestjs/common';
import {Prisma} from '@prisma/client';
import {PrismaService} from '../../services/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getById(id: string) {
    return this.prisma.user.findUnique({where: {id}});
  }

  async updateMe(id: string, data: {fullName?: string; locale?: string; timeZone?: string}) {
    return this.prisma.user.update({
      where: {id},
      data: {
        fullName: data.fullName,
        // store locale/timeZone as free-form json until explicit columns added
      }
    });
  }

  async adminList(q?: string) {
    const where = q
      ? {
          OR: [
            {email: {contains: q, mode: Prisma.QueryMode.insensitive}},
            {fullName: {contains: q, mode: Prisma.QueryMode.insensitive}}
          ]
        }
      : {};
    return this.prisma.user.findMany({
      where,
      orderBy: {createdAt: 'desc'},
      select: {id: true, email: true, fullName: true, role: true, mfaEnabled: true, createdAt: true}
    });
  }

  async adminUpdate(id: string, data: {role?: string}) {
    return this.prisma.user.update({
      where: {id},
      data: {
        role: (data.role as any) || undefined
      },
      select: {id: true, email: true, fullName: true, role: true, mfaEnabled: true}
    });
  }

  async resetMfa(id: string) {
    return this.prisma.user.update({
      where: {id},
      data: {mfaEnabled: false, mfaSecret: null},
      select: {id: true, email: true, fullName: true, role: true, mfaEnabled: true}
    });
  }

  async setSuspended(id: string, suspended: boolean) {
    return this.prisma.user.update({
      where: {id},
      data: {suspended},
      select: {id: true, email: true, fullName: true, role: true, suspended: true}
    });
  }

  async revokeSessions(id: string) {
    const updated = await this.prisma.user.update({
      where: {id},
      data: {tokenVersion: {increment: 1}}
    });
    return {id: updated.id, tokenVersion: updated.tokenVersion};
  }

  async delete(id: string) {
    // First, check if user exists
    const user = await this.prisma.user.findUnique({
      where: {id},
      select: {id: true, email: true, role: true}
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Prevent deleting the last admin
    if (user.role === 'ADMIN') {
      const adminCount = await this.prisma.user.count({
        where: {role: 'ADMIN'}
      });
      if (adminCount <= 1) {
        throw new Error('Cannot delete the last admin user');
      }
    }
    
    // Check for blocking relationships (ON DELETE RESTRICT)
    const [projectCount, documentCount, reviewCount, paperCount] = await Promise.all([
      this.prisma.project.count({where: {ownerId: id}}),
      this.prisma.document.count({where: {createdById: id}}),
      this.prisma.review.count({where: {reviewerId: id}}),
      this.prisma.paper.count({where: {createdById: id}}),
    ]);
    
    if (projectCount > 0 || documentCount > 0 || reviewCount > 0 || paperCount > 0) {
      throw new Error(
        `Cannot delete user: User has related records that prevent deletion. ` +
        `Projects: ${projectCount}, Documents: ${documentCount}, Reviews: ${reviewCount}, Papers: ${paperCount}. ` +
        `Please remove or transfer these records first.`
      );
    }

    // Delete related records first
    // Delete in parallel for better performance
    // Using type assertion to access models (Prisma client should have these)
    const prisma = this.prisma as any;
    await Promise.allSettled([
      prisma.token?.deleteMany({where: {userId: id}}).catch(() => null),
      prisma.device?.deleteMany({where: {userId: id}}).catch(() => null),
      prisma.membership?.deleteMany({where: {userId: id}}).catch(() => null),
      prisma.credential?.deleteMany({where: {userId: id}}).catch(() => null),
      prisma.auditEvent?.deleteMany({where: {actorUserId: id}}).catch(() => null),
    ]);
    
    // Finally, delete the user
    await this.prisma.user.delete({
      where: {id}
    });
    
    return {id, deleted: true, email: user.email};
  }
}

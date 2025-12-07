import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';

@Injectable()
export class CommunitiesService {
  constructor(private prisma: PrismaService) {}

  // ==================== Community Channels ====================

  async createChannel(
    createdById: string,
    name: string,
    description?: string,
    category: string = 'GENERAL',
    isPublic: boolean = true
  ) {
    const channel = await this.prisma.communityChannel.create({
      data: {
        name,
        description,
        category,
        isPublic,
        createdById,
        members: {
          create: {
            userId: createdById,
            role: 'OWNER'
          }
        }
      },
      include: {
        createdBy: {
          select: { id: true, email: true, fullName: true, role: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, email: true, fullName: true, role: true }
            }
          }
        },
        _count: {
          select: { posts: true }
        }
      }
    });

    return channel;
  }

  async getChannels(
    userId?: string,
    category?: string,
    isPublic?: boolean,
    search?: string
  ) {
    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (isPublic !== undefined) {
      where.isPublic = isPublic;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // If not public, only show channels user is member of or created
    if (!isPublic && userId) {
      where.OR = [
        { isPublic: true },
        { createdById: userId },
        {
          members: {
            some: {
              userId,
              leftAt: null
            }
          }
        }
      ];
    }

    const channels = await this.prisma.communityChannel.findMany({
      where,
      include: {
        createdBy: {
          select: { id: true, email: true, fullName: true, role: true }
        },
        _count: {
          select: { members: true, posts: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return channels;
  }

  async getChannel(channelId: string, userId?: string) {
    const channel = await this.prisma.communityChannel.findUnique({
      where: { id: channelId },
      include: {
        createdBy: {
          select: { id: true, email: true, fullName: true, role: true }
        },
        members: {
          where: { leftAt: null },
          include: {
            user: {
              select: { id: true, email: true, fullName: true, role: true }
            }
          }
        },
        _count: {
          select: { posts: true }
        }
      }
    });

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    // Check access for private channels
    if (!channel.isPublic) {
      const isMember = channel.members.some(m => m.userId === userId);
      const isCreator = channel.createdById === userId;
      if (!isMember && !isCreator) {
        throw new ForbiddenException('Access denied to this channel');
      }
    }

    return channel;
  }

  async joinChannel(channelId: string, userId: string) {
    const channel = await this.getChannel(channelId, userId);

    if (!channel.isPublic) {
      throw new ForbiddenException('Cannot join private channel');
    }

    // Check if already a member
    const existing = await this.prisma.channelMember.findUnique({
      where: {
        channelId_userId: {
          channelId,
          userId
        }
      }
    });

    if (existing && !existing.leftAt) {
      throw new BadRequestException('Already a member of this channel');
    }

    if (existing && existing.leftAt) {
      // Re-join
      return this.prisma.channelMember.update({
        where: { id: existing.id },
        data: {
          userId,
          role: 'MEMBER',
          leftAt: null
        },
        include: {
          user: {
            select: { id: true, email: true, fullName: true, role: true }
          }
        }
      });
    }

    return this.prisma.channelMember.create({
      data: {
        channelId,
        userId,
        role: 'MEMBER'
      },
      include: {
        user: {
          select: { id: true, email: true, fullName: true, role: true }
        }
      }
    });
  }

  async leaveChannel(channelId: string, userId: string) {
    const member = await this.prisma.channelMember.findUnique({
      where: {
        channelId_userId: {
          channelId,
          userId
        }
      }
    });

    if (!member || member.leftAt) {
      throw new NotFoundException('Not a member of this channel');
    }

    if (member.role === 'OWNER') {
      throw new BadRequestException('Channel owner cannot leave channel');
    }

    return this.prisma.channelMember.update({
      where: { id: member.id },
      data: {
        leftAt: new Date()
      }
    });
  }

  async updateMemberRole(
    channelId: string,
    userId: string,
    updatedById: string,
    role: 'MEMBER' | 'MODERATOR'
  ) {
    const channel = await this.getChannel(channelId, updatedById);

    const updaterMember = channel.members.find(m => m.userId === updatedById);
    if (!updaterMember || (updaterMember.role !== 'OWNER' && updaterMember.role !== 'MODERATOR')) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const targetMember = channel.members.find(m => m.userId === userId);
    if (!targetMember) {
      throw new NotFoundException('User is not a member');
    }

    if (targetMember.role === 'OWNER') {
      throw new BadRequestException('Cannot change owner role');
    }

    return this.prisma.channelMember.update({
      where: {
        channelId_userId: {
          channelId,
          userId
        }
      },
      data: { role }
    });
  }

  // ==================== Channel Posts ====================

  async createChannelPost(
    channelId: string,
    userId: string,
    content: string
  ) {
    // Verify membership
    const member = await this.prisma.channelMember.findFirst({
      where: {
        channelId,
        userId,
        leftAt: null
      }
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this channel');
    }

    const post = await this.prisma.channelPost.create({
      data: {
        channelId,
        userId,
        content
      },
      include: {
        user: {
          select: { id: true, email: true, fullName: true, role: true }
        },
        channel: {
          select: { id: true, name: true }
        },
        attachments: true,
        reactions: {
          include: {
            user: {
              select: { id: true, fullName: true }
            }
          }
        }
      }
    });

    // Update channel updatedAt
    await this.prisma.communityChannel.update({
      where: { id: channelId },
      data: { updatedAt: new Date() }
    });

    return post;
  }

  async getChannelPosts(
    channelId: string,
    userId: string,
    limit: number = 50,
    cursor?: string
  ) {
    // Verify access
    await this.getChannel(channelId, userId);

    const posts = await this.prisma.channelPost.findMany({
      where: { channelId },
      include: {
        user: {
          select: { id: true, email: true, fullName: true, role: true }
        },
        attachments: true,
        reactions: {
          include: {
            user: {
              select: { id: true, fullName: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1
      })
    });

    return posts;
  }

  async pinPost(channelId: string, postId: string, userId: string) {
    const channel = await this.getChannel(channelId, userId);

    const member = channel.members.find(m => m.userId === userId);
    if (!member || (member.role !== 'OWNER' && member.role !== 'MODERATOR')) {
      throw new ForbiddenException('Only moderators can pin posts');
    }

    return this.prisma.channelPost.update({
      where: { id: postId },
      data: { isPinned: true }
    });
  }

  async deletePost(channelId: string, postId: string, userId: string) {
    const channel = await this.getChannel(channelId, userId);
    const post = await this.prisma.channelPost.findUnique({
      where: { id: postId }
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const member = channel.members.find(m => m.userId === userId);
    const canDelete = 
      post.userId === userId ||
      (member && (member.role === 'OWNER' || member.role === 'MODERATOR'));

    if (!canDelete) {
      throw new ForbiddenException('Cannot delete this post');
    }

    await this.prisma.channelPost.delete({
      where: { id: postId }
    });

    return { success: true };
  }
}


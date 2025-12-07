import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';

@Injectable()
export class ForumsService {
  constructor(private prisma: PrismaService) {}

  // ==================== Forums ====================

  async createForum(createdById: string, title: string, description?: string, category?: string, isPublic: boolean = true, tags?: string[]) {
    const forum = await this.prisma.discussionForum.create({
      data: {
        title,
        description,
        category,
        isPublic,
        tags: tags || [],
        createdById
      },
      include: {
        createdBy: {
          select: { id: true, email: true, fullName: true, role: true }
        },
        _count: {
          select: { posts: true }
        }
      }
    });

    return forum;
  }

  async getForums(userId?: string, category?: string, isPublic?: boolean, search?: string) {
    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (isPublic !== undefined) {
      where.isPublic = isPublic;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // If not public, only show forums user created or has access to
    if (!isPublic && userId) {
      where.OR = [
        { isPublic: true },
        { createdById: userId }
      ];
    }

    const forums = await this.prisma.discussionForum.findMany({
      where,
      include: {
        createdBy: {
          select: { id: true, email: true, fullName: true, role: true }
        },
        _count: {
          select: { posts: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return forums;
  }

  async getForum(forumId: string, userId?: string) {
    const forum = await this.prisma.discussionForum.findUnique({
      where: { id: forumId },
      include: {
        createdBy: {
          select: { id: true, email: true, fullName: true, role: true }
        },
        _count: {
          select: { posts: true }
        }
      }
    });

    if (!forum) {
      throw new NotFoundException('Forum not found');
    }

    // Check access for private forums
    if (!forum.isPublic && forum.createdById !== userId) {
      throw new ForbiddenException('Access denied to this forum');
    }

    return forum;
  }

  // ==================== Posts ====================

  async createPost(forumId: string, userId: string, title: string, content: string, tags?: string[]) {
    // Verify forum access
    await this.getForum(forumId, userId);

    const post = await this.prisma.discussionPost.create({
      data: {
        forumId,
        userId,
        title,
        content,
        tags: tags || []
      },
      include: {
        user: {
          select: { id: true, email: true, fullName: true, role: true }
        },
        forum: {
          select: { id: true, title: true }
        },
        _count: {
          select: { replies: true }
        }
      }
    });

    // Update forum updatedAt
    await this.prisma.discussionForum.update({
      where: { id: forumId },
      data: { updatedAt: new Date() }
    });

    return post;
  }

  async getPosts(forumId: string, userId?: string, limit: number = 20, cursor?: string, sortBy: 'newest' | 'popular' | 'trending' = 'newest') {
    // Verify forum access
    await this.getForum(forumId, userId);

    const orderBy: any = {};
    if (sortBy === 'newest') {
      orderBy.createdAt = 'desc';
    } else if (sortBy === 'popular') {
      orderBy.upvotes = 'desc';
    } else if (sortBy === 'trending') {
      // Trending = recent posts with high upvotes
      orderBy.createdAt = 'desc';
    }

    const posts = await this.prisma.discussionPost.findMany({
      where: {
        forumId,
        isLocked: false
      },
      include: {
        user: {
          select: { id: true, email: true, fullName: true, role: true }
        },
        _count: {
          select: { replies: true, reactions: true }
        }
      },
      orderBy,
      take: limit,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1
      })
    });

    // Sort trending posts by score (upvotes / time decay)
    if (sortBy === 'trending') {
      const now = Date.now();
      posts.sort((a, b) => {
        const scoreA = a.upvotes / Math.max(1, (now - a.createdAt.getTime()) / (1000 * 60 * 60)); // Per hour
        const scoreB = b.upvotes / Math.max(1, (now - b.createdAt.getTime()) / (1000 * 60 * 60));
        return scoreB - scoreA;
      });
    }

    return posts;
  }

  async getPost(postId: string, userId?: string) {
    const post = await this.prisma.discussionPost.findUnique({
      where: { id: postId },
      include: {
        user: {
          select: { id: true, email: true, fullName: true, role: true }
        },
        forum: {
          select: { id: true, title: true, isPublic: true }
        },
        replies: {
          include: {
            user: {
              select: { id: true, email: true, fullName: true, role: true }
            },
            _count: {
              select: { reactions: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        attachments: true,
        reactions: {
          include: {
            user: {
              select: { id: true, fullName: true }
            }
          }
        },
        _count: {
          select: { replies: true, reactions: true }
        }
      }
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Verify forum access
    if (!post.forum.isPublic && post.forum.id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Increment view count
    await this.prisma.discussionPost.update({
      where: { id: postId },
      data: { views: { increment: 1 } }
    });

    return post;
  }

  async voteOnPost(postId: string, userId: string, vote: 'up' | 'down') {
    const post = await this.prisma.discussionPost.findUnique({
      where: { id: postId }
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Simple voting - in production, you'd want a separate Vote table
    if (vote === 'up') {
      return this.prisma.discussionPost.update({
        where: { id: postId },
        data: { upvotes: { increment: 1 } }
      });
    } else {
      return this.prisma.discussionPost.update({
        where: { id: postId },
        data: { downvotes: { increment: 1 } }
      });
    }
  }

  async pinPost(postId: string, userId: string, forumId: string) {
    const forum = await this.getForum(forumId, userId);
    
    if (forum.createdById !== userId) {
      throw new ForbiddenException('Only forum creator can pin posts');
    }

    return this.prisma.discussionPost.update({
      where: { id: postId },
      data: { isPinned: true }
    });
  }

  async lockPost(postId: string, userId: string, forumId: string) {
    const forum = await this.getForum(forumId, userId);
    
    if (forum.createdById !== userId) {
      throw new ForbiddenException('Only forum creator can lock posts');
    }

    return this.prisma.discussionPost.update({
      where: { id: postId },
      data: { isLocked: true }
    });
  }

  // ==================== Replies ====================

  async createReply(postId: string, userId: string, content: string, parentId?: string) {
    const post = await this.prisma.discussionPost.findUnique({
      where: { id: postId }
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.isLocked) {
      throw new BadRequestException('Post is locked');
    }

    const reply = await this.prisma.discussionReply.create({
      data: {
        postId,
        userId,
        content,
        parentId
      },
      include: {
        user: {
          select: { id: true, email: true, fullName: true, role: true }
        },
        post: {
          select: { id: true, title: true }
        },
        attachments: true,
        reactions: {
          include: {
            user: {
              select: { id: true, fullName: true }
            }
          }
        },
        _count: {
          select: { reactions: true }
        }
      }
    });

    // Update post updatedAt
    await this.prisma.discussionPost.update({
      where: { id: postId },
      data: { updatedAt: new Date() }
    });

    return reply;
  }

  async getReplies(postId: string, limit: number = 50, cursor?: string) {
    const replies = await this.prisma.discussionReply.findMany({
      where: { postId },
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
        },
        _count: {
          select: { reactions: true }
        }
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1
      })
    });

    return replies;
  }

  async voteOnReply(replyId: string, userId: string, vote: 'up' | 'down') {
    const reply = await this.prisma.discussionReply.findUnique({
      where: { id: replyId }
    });

    if (!reply) {
      throw new NotFoundException('Reply not found');
    }

    if (vote === 'up') {
      return this.prisma.discussionReply.update({
        where: { id: replyId },
        data: { upvotes: { increment: 1 } }
      });
    } else {
      return this.prisma.discussionReply.update({
        where: { id: replyId },
        data: { downvotes: { increment: 1 } }
      });
    }
  }
}


import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';

@Injectable()
export class KnowledgeService {
  constructor(private prisma: PrismaService) {}

  // ==================== Knowledge Articles ====================

  async createArticle(
    authorId: string,
    title: string,
    content: string,
    excerpt?: string,
    category?: string,
    tags?: string[]
  ) {
    const article = await this.prisma.knowledgeArticle.create({
      data: {
        title,
        content,
        excerpt,
        category,
        tags: tags || [],
        authorId,
        isPublished: false
      },
      include: {
        author: {
          select: { id: true, email: true, fullName: true, role: true }
        },
        _count: {
          select: { reactions: true }
        }
      }
    });

    return article;
  }

  async getArticles(
    userId?: string,
    category?: string,
    isPublished?: boolean,
    search?: string,
    authorId?: string
  ) {
    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (isPublished !== undefined) {
      where.isPublished = isPublished;
    } else {
      // Default: only show published articles unless user is author
      if (!authorId || authorId !== userId) {
        where.isPublished = true;
      }
    }

    if (authorId) {
      where.authorId = authorId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } }
      ];
    }

    const articles = await this.prisma.knowledgeArticle.findMany({
      where,
      include: {
        author: {
          select: { id: true, email: true, fullName: true, role: true }
        },
        _count: {
          select: { reactions: true }
        }
      },
      orderBy: { publishedAt: 'desc' }
    });

    return articles;
  }

  async getArticle(articleId: string, userId?: string) {
    const article = await this.prisma.knowledgeArticle.findUnique({
      where: { id: articleId },
      include: {
        author: {
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
      }
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // Check if user can view unpublished article
    if (!article.isPublished && article.authorId !== userId) {
      throw new ForbiddenException('Article is not published');
    }

    // Increment view count
    await this.prisma.knowledgeArticle.update({
      where: { id: articleId },
      data: { viewCount: { increment: 1 } }
    });

    return article;
  }

  async updateArticle(
    articleId: string,
    userId: string,
    updates: {
      title?: string;
      content?: string;
      excerpt?: string;
      category?: string;
      tags?: string[];
    }
  ) {
    const article = await this.prisma.knowledgeArticle.findUnique({
      where: { id: articleId }
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (article.authorId !== userId) {
      throw new ForbiddenException('Only author can update article');
    }

    return this.prisma.knowledgeArticle.update({
      where: { id: articleId },
      data: {
        ...updates,
        version: { increment: 1 }
      },
      include: {
        author: {
          select: { id: true, email: true, fullName: true, role: true }
        }
      }
    });
  }

  async publishArticle(articleId: string, userId: string) {
    const article = await this.prisma.knowledgeArticle.findUnique({
      where: { id: articleId }
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (article.authorId !== userId) {
      throw new ForbiddenException('Only author can publish article');
    }

    return this.prisma.knowledgeArticle.update({
      where: { id: articleId },
      data: {
        isPublished: true,
        publishedAt: new Date()
      }
    });
  }

  async unpublishArticle(articleId: string, userId: string) {
    const article = await this.prisma.knowledgeArticle.findUnique({
      where: { id: articleId }
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (article.authorId !== userId) {
      throw new ForbiddenException('Only author can unpublish article');
    }

    return this.prisma.knowledgeArticle.update({
      where: { id: articleId },
      data: {
        isPublished: false
      }
    });
  }

  async publishToExternalPlatform(
    articleId: string,
    userId: string,
    platforms: string[]
  ) {
    const article = await this.prisma.knowledgeArticle.findUnique({
      where: { id: articleId }
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (article.authorId !== userId) {
      throw new ForbiddenException('Only author can publish to external platforms');
    }

    if (!article.isPublished) {
      throw new ForbiddenException('Article must be published first');
    }

    // Update publishedTo array
    const currentPlatforms = article.publishedTo || [];
    const newPlatforms = [...new Set([...currentPlatforms, ...platforms])];

    return this.prisma.knowledgeArticle.update({
      where: { id: articleId },
      data: {
        publishedTo: newPlatforms
      }
    });
  }

  async deleteArticle(articleId: string, userId: string) {
    const article = await this.prisma.knowledgeArticle.findUnique({
      where: { id: articleId }
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (article.authorId !== userId) {
      throw new ForbiddenException('Only author can delete article');
    }

    await this.prisma.knowledgeArticle.delete({
      where: { id: articleId }
    });

    return { success: true };
  }
}


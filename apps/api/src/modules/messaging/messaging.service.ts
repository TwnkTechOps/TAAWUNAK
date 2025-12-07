import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';
import { EncryptionService } from '../../services/encryption.service';

@Injectable()
export class MessagingService {
  constructor(
    private prisma: PrismaService,
    private encryption: EncryptionService
  ) {}

  // ==================== Direct Messaging ====================

  async sendDirectMessage(senderId: string, receiverId: string, content: string, encrypted: boolean = true) {
    // Check if receiver has blocked sender
    const isBlocked = await this.prisma.userBlock.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId: receiverId,
          blockedId: senderId
        }
      }
    });

    if (isBlocked) {
      throw new ForbiddenException('Cannot send message: user has blocked you');
    }

    // Encrypt content if needed
    const messageContent = encrypted ? await this.encryption.encrypt(content) : content;

    const message = await this.prisma.directMessage.create({
      data: {
        senderId,
        receiverId,
        content: messageContent,
        encrypted,
        delivered: false
      },
      include: {
        sender: {
          select: { id: true, email: true, fullName: true, role: true }
        },
        receiver: {
          select: { id: true, email: true, fullName: true, role: true }
        }
      }
    });

    return message;
  }

  async getDirectMessages(userId: string, otherUserId: string, limit: number = 50, cursor?: string) {
    const messages = await this.prisma.directMessage.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId }
        ]
      },
      include: {
        sender: {
          select: { id: true, email: true, fullName: true, role: true }
        },
        receiver: {
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

    // Decrypt messages if needed
    const decryptedMessages = await Promise.all(
      messages.map(async (msg) => {
        if (msg.encrypted) {
          try {
            msg.content = await this.encryption.decrypt(msg.content);
          } catch (error) {
            // If decryption fails, return encrypted content
            console.error('Decryption error:', error);
          }
        }
        return msg;
      })
    );

    return decryptedMessages.reverse(); // Return in chronological order
  }

  async markMessageAsRead(messageId: string, userId: string) {
    const message = await this.prisma.directMessage.findUnique({
      where: { id: messageId }
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.receiverId !== userId) {
      throw new ForbiddenException('Cannot mark this message as read');
    }

    return this.prisma.directMessage.update({
      where: { id: messageId },
      data: {
        read: true,
        readAt: new Date()
      }
    });
  }

  async markMessageAsDelivered(messageId: string, userId: string) {
    const message = await this.prisma.directMessage.findUnique({
      where: { id: messageId }
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.receiverId !== userId) {
      throw new ForbiddenException('Cannot mark this message as delivered');
    }

    return this.prisma.directMessage.update({
      where: { id: messageId },
      data: {
        delivered: true,
        deliveredAt: new Date()
      }
    });
  }

  async getConversations(userId: string) {
    // Get all unique conversations for this user
    const sentMessages = await this.prisma.directMessage.findMany({
      where: { senderId: userId },
      select: { receiverId: true, createdAt: true, content: true, read: true },
      orderBy: { createdAt: 'desc' }
    });

    const receivedMessages = await this.prisma.directMessage.findMany({
      where: { receiverId: userId },
      select: { senderId: true, createdAt: true, content: true, read: true },
      orderBy: { createdAt: 'desc' }
    });

    // Group by user and get latest message
    const conversationsMap = new Map<string, any>();

    sentMessages.forEach(msg => {
      const otherUserId = msg.receiverId;
      if (!conversationsMap.has(otherUserId) || 
          conversationsMap.get(otherUserId).createdAt < msg.createdAt) {
        conversationsMap.set(otherUserId, {
          userId: otherUserId,
          lastMessage: msg.content,
          lastMessageAt: msg.createdAt,
          unreadCount: 0
        });
      }
    });

    receivedMessages.forEach(msg => {
      const otherUserId = msg.senderId;
      const existing = conversationsMap.get(otherUserId);
      if (!existing || existing.lastMessageAt < msg.createdAt) {
        conversationsMap.set(otherUserId, {
          userId: otherUserId,
          lastMessage: msg.content,
          lastMessageAt: msg.createdAt,
          unreadCount: existing?.unreadCount || 0
        });
      }
      if (!msg.read) {
        const conv = conversationsMap.get(otherUserId);
        if (conv) {
          conv.unreadCount = (conv.unreadCount || 0) + 1;
        }
      }
    });

    // Get user details for each conversation
    const userIds = Array.from(conversationsMap.keys());
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, email: true, fullName: true, role: true }
    });

    const conversations = Array.from(conversationsMap.values()).map(conv => {
      const user = users.find(u => u.id === conv.userId);
      return {
        ...conv,
        user
      };
    });

    return conversations.sort((a, b) => 
      b.lastMessageAt.getTime() - a.lastMessageAt.getTime()
    );
  }

  // ==================== Group Chat ====================

  async createGroupChat(createdById: string, name: string, description?: string, isPrivate: boolean = false) {
    const groupChat = await this.prisma.groupChat.create({
      data: {
        name,
        description,
        isPrivate,
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
          select: { id: true, email: true, fullName: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, email: true, fullName: true, role: true }
            }
          }
        }
      }
    });

    return groupChat;
  }

  async getGroupChats(userId: string) {
    const groupChats = await this.prisma.groupChat.findMany({
      where: {
        members: {
          some: {
            userId,
            leftAt: null
          }
        }
      },
      include: {
        createdBy: {
          select: { id: true, email: true, fullName: true }
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
          select: { messages: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return groupChats;
  }

  async getGroupChat(groupChatId: string, userId: string) {
    const groupChat = await this.prisma.groupChat.findFirst({
      where: {
        id: groupChatId,
        members: {
          some: {
            userId,
            leftAt: null
          }
        }
      },
      include: {
        createdBy: {
          select: { id: true, email: true, fullName: true }
        },
        members: {
          where: { leftAt: null },
          include: {
            user: {
              select: { id: true, email: true, fullName: true, role: true }
            }
          }
        }
      }
    });

    if (!groupChat) {
      throw new NotFoundException('Group chat not found or access denied');
    }

    return groupChat;
  }

  async addGroupChatMember(groupChatId: string, userId: string, addedById: string, role: 'MEMBER' | 'ADMIN' = 'MEMBER') {
    const groupChat = await this.getGroupChat(groupChatId, addedById);
    
    // Check if adder has permission
    const adderMember = groupChat.members.find(m => m.userId === addedById);
    if (!adderMember || (adderMember.role !== 'OWNER' && adderMember.role !== 'ADMIN')) {
      throw new ForbiddenException('Insufficient permissions to add members');
    }

    // Check if user is already a member
    const existingMember = await this.prisma.groupChatMember.findUnique({
      where: {
        groupChatId_userId: {
          groupChatId,
          userId
        }
      }
    });

    if (existingMember && !existingMember.leftAt) {
      throw new BadRequestException('User is already a member');
    }

    if (existingMember && existingMember.leftAt) {
      // Re-add user
      return this.prisma.groupChatMember.update({
        where: { id: existingMember.id },
        data: {
          userId,
          role,
          leftAt: null
        },
        include: {
          user: {
            select: { id: true, email: true, fullName: true, role: true }
          }
        }
      });
    }

    return this.prisma.groupChatMember.create({
      data: {
        groupChatId,
        userId,
        role
      },
      include: {
        user: {
          select: { id: true, email: true, fullName: true, role: true }
        }
      }
    });
  }

  async removeGroupChatMember(groupChatId: string, userId: string, removedById: string) {
    const groupChat = await this.getGroupChat(groupChatId, removedById);
    
    // Check permissions
    const removerMember = groupChat.members.find(m => m.userId === removedById);
    const targetMember = groupChat.members.find(m => m.userId === userId);

    if (!targetMember) {
      throw new NotFoundException('User is not a member of this group');
    }

    // Only owner can remove admins, owner and admins can remove members
    if (targetMember.role === 'OWNER') {
      throw new ForbiddenException('Cannot remove group owner');
    }

    if (targetMember.role === 'ADMIN' && removerMember?.role !== 'OWNER') {
      throw new ForbiddenException('Only owner can remove admins');
    }

    if (removerMember?.role !== 'OWNER' && removerMember?.role !== 'ADMIN' && userId !== removedById) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return this.prisma.groupChatMember.update({
      where: {
        groupChatId_userId: {
          groupChatId,
          userId
        }
      },
      data: {
        leftAt: new Date()
      }
    });
  }

  async sendGroupMessage(groupChatId: string, userId: string, content: string, encrypted: boolean = true) {
    // Verify user is a member
    const member = await this.prisma.groupChatMember.findFirst({
      where: {
        groupChatId,
        userId,
        leftAt: null
      }
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this group');
    }

    // Encrypt if needed
    const messageContent = encrypted ? await this.encryption.encrypt(content) : content;

    const message = await this.prisma.groupChatMessage.create({
      data: {
        groupChatId,
        userId,
        content: messageContent,
        encrypted
      },
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
      }
    });

    // Update group chat updatedAt
    await this.prisma.groupChat.update({
      where: { id: groupChatId },
      data: { updatedAt: new Date() }
    });

    return message;
  }

  async getGroupMessages(groupChatId: string, userId: string, limit: number = 50, cursor?: string) {
    // Verify access
    await this.getGroupChat(groupChatId, userId);

    const messages = await this.prisma.groupChatMessage.findMany({
      where: { groupChatId },
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

    // Decrypt messages
    const decryptedMessages = await Promise.all(
      messages.map(async (msg) => {
        if (msg.encrypted) {
          try {
            msg.content = await this.encryption.decrypt(msg.content);
          } catch (error) {
            console.error('Decryption error:', error);
          }
        }
        return msg;
      })
    );

    return decryptedMessages.reverse();
  }
}


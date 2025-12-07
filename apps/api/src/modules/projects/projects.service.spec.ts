import {Test, TestingModule} from '@nestjs/testing';
import {ProjectsService} from './projects.service';
import {PrismaService} from '../../services/prisma.service';
import {NotFoundException, ForbiddenException} from '@nestjs/common';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let prisma: jest.Mocked<PrismaService>;

  const mockPrisma = {
    project: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    projectParticipant: {
      create: jest.fn(),
      findUnique: jest.fn(),
      deleteMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    projectTemplate: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should return all projects for ADMIN', async () => {
      const mockProjects = [
        {id: '1', title: 'Project 1', institution: {name: 'Inst 1'}, owner: {id: 'u1', email: 'owner@test.com', fullName: 'Owner'}},
      ];
      mockPrisma.project.findMany.mockResolvedValue(mockProjects);

      const result = await service.list('user1', 'ADMIN');

      expect(result).toEqual(mockProjects);
      expect(mockPrisma.project.findMany).toHaveBeenCalledWith({
        include: expect.objectContaining({
          institution: true,
          owner: expect.any(Object),
          participants: expect.any(Object),
          _count: expect.any(Object),
        }),
        orderBy: {createdAt: 'desc'},
      });
    });

    it('should return institution projects for INSTITUTION_ADMIN', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({institutionId: 'inst1'});
      const mockProjects = [{id: '1', title: 'Project 1'}];
      mockPrisma.project.findMany.mockResolvedValue(mockProjects);

      const result = await service.list('user1', 'INSTITUTION_ADMIN');

      expect(result).toEqual(mockProjects);
      expect(mockPrisma.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {institutionId: 'inst1'},
        })
      );
    });

    it('should return user projects for regular users', async () => {
      const mockProjects = [{id: '1', title: 'Project 1'}];
      mockPrisma.project.findMany.mockResolvedValue(mockProjects);

      const result = await service.list('user1', 'RESEARCHER');

      expect(result).toEqual(mockProjects);
      expect(mockPrisma.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              {ownerId: 'user1'},
              {participants: expect.any(Object)},
            ]),
          }),
        })
      );
    });
  });

  describe('getById', () => {
    it('should return project if found and user has access', async () => {
      const mockProject = {
        id: '1',
        title: 'Project 1',
        ownerId: 'user1',
        institutionId: 'inst1',
        participants: [],
      };
      mockPrisma.project.findUnique.mockResolvedValue(mockProject);

      const result = await service.getById('1', 'user1', 'RESEARCHER');

      expect(result).toEqual(mockProject);
    });

    it('should throw NotFoundException if project not found', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(null);

      await expect(service.getById('1', 'user1', 'RESEARCHER')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user has no access', async () => {
      const mockProject = {
        id: '1',
        title: 'Project 1',
        ownerId: 'other-user',
        institutionId: 'inst1',
        participants: [],
      };
      mockPrisma.project.findUnique.mockResolvedValue(mockProject);

      await expect(service.getById('1', 'user1', 'RESEARCHER')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('create', () => {
    it('should create project and add owner as participant', async () => {
      const mockProject = {
        id: '1',
        title: 'New Project',
        ownerId: 'user1',
        institutionId: 'inst1',
      };
      mockPrisma.project.create.mockResolvedValue(mockProject);
      mockPrisma.projectParticipant.create.mockResolvedValue({} as any);
      mockPrisma.project.findUnique.mockResolvedValue({
        ...mockProject,
        participants: [],
        milestones: [],
        documents: [],
        _count: {milestones: 0, documents: 0, participants: 0, proposals: 0},
      } as any);

      const result = await service.create({
        title: 'New Project',
        summary: 'Summary',
        institutionId: 'inst1',
        ownerId: 'user1',
      });

      expect(mockPrisma.project.create).toHaveBeenCalled();
      expect(mockPrisma.projectParticipant.create).toHaveBeenCalledWith({
        data: {
          projectId: '1',
          userId: 'user1',
          role: 'OWNER',
          status: 'ACTIVE',
        },
      });
      expect(result).toBeDefined();
    });
  });

  describe('addParticipant', () => {
    it('should add participant if user is project owner', async () => {
      const mockProject = {
        id: '1',
        ownerId: 'user1',
        institutionId: 'inst1',
        participants: [],
      };
      mockPrisma.project.findUnique.mockResolvedValue(mockProject as any);
      mockPrisma.projectParticipant.findUnique.mockResolvedValue(null);
      mockPrisma.projectParticipant.create.mockResolvedValue({
        id: 'p1',
        projectId: '1',
        userId: 'user2',
        role: 'COLLABORATOR',
        user: {id: 'user2', email: 'user2@test.com', fullName: 'User 2'},
      } as any);

      const result = await service.addParticipant('1', 'user1', 'user2', 'COLLABORATOR', 'RESEARCHER');

      expect(mockPrisma.projectParticipant.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw ForbiddenException if user is not owner', async () => {
      const mockProject = {
        id: '1',
        ownerId: 'other-user',
        institutionId: 'inst1',
        participants: [{userId: 'user1', role: 'VIEWER'}],
      };
      mockPrisma.project.findUnique.mockResolvedValue(mockProject as any);

      await expect(
        service.addParticipant('1', 'user1', 'user2', 'COLLABORATOR', 'RESEARCHER')
      ).rejects.toThrow(ForbiddenException);
    });
  });
});


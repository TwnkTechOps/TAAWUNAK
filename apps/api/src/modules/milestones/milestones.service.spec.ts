import {Test, TestingModule} from '@nestjs/testing';
import {MilestonesService} from './milestones.service';
import {PrismaService} from '../../services/prisma.service';
import {NotFoundException, ForbiddenException} from '@nestjs/common';

describe('MilestonesService', () => {
  let service: MilestonesService;
  let prisma: jest.Mocked<PrismaService>;

  const mockPrisma = {
    milestone: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    task: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    project: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MilestonesService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<MilestonesService>(MilestonesService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should return milestones for a project', async () => {
      const mockProject = {
        id: '1',
        ownerId: 'user1',
        institutionId: 'inst1',
        participants: [],
      };
      mockPrisma.project.findUnique.mockResolvedValue(mockProject as any);
      const mockMilestones = [
        {id: 'm1', title: 'Milestone 1', tasks: []},
      ];
      mockPrisma.milestone.findMany.mockResolvedValue(mockMilestones);

      const result = await service.list('1', 'user1', 'RESEARCHER');

      expect(result).toEqual(mockMilestones);
      expect(mockPrisma.milestone.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {projectId: '1'},
        })
      );
    });

    it('should throw ForbiddenException if user has no access', async () => {
      const mockProject = {
        id: '1',
        ownerId: 'other-user',
        institutionId: 'inst1',
        participants: [],
      };
      mockPrisma.project.findUnique.mockResolvedValue(mockProject as any);

      await expect(service.list('1', 'user1', 'RESEARCHER')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('create', () => {
    it('should create milestone if user has write access', async () => {
      const mockProject = {
        id: '1',
        ownerId: 'user1',
        institutionId: 'inst1',
        participants: [],
      };
      mockPrisma.project.findUnique.mockResolvedValue(mockProject as any);
      const mockMilestone = {id: 'm1', title: 'New Milestone', tasks: []};
      mockPrisma.milestone.create.mockResolvedValue(mockMilestone);

      const result = await service.create('1', {title: 'New Milestone'}, 'user1', 'RESEARCHER');

      expect(result).toEqual(mockMilestone);
      expect(mockPrisma.milestone.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          projectId: '1',
          title: 'New Milestone',
        }),
        include: {tasks: true},
      });
    });
  });

  describe('createTask', () => {
    it('should create task for a milestone', async () => {
      const mockMilestone = {
        id: 'm1',
        projectId: '1',
        project: {
          id: '1',
          ownerId: 'user1',
          institutionId: 'inst1',
          participants: [],
        },
      };
      mockPrisma.milestone.findUnique.mockResolvedValue(mockMilestone as any);
      mockPrisma.project.findUnique.mockResolvedValue(mockMilestone.project as any);
      const mockTask = {
        id: 't1',
        title: 'New Task',
        milestoneId: 'm1',
        assignee: null,
      };
      mockPrisma.task.create.mockResolvedValue(mockTask as any);

      const result = await service.createTask('m1', {title: 'New Task'}, 'user1', 'RESEARCHER');

      expect(result).toEqual(mockTask);
      expect(mockPrisma.task.create).toHaveBeenCalled();
    });
  });
});


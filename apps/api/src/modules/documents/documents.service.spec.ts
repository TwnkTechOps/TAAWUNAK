import {Test, TestingModule} from '@nestjs/testing';
import {DocumentsService} from './documents.service';
import {PrismaService} from '../../services/prisma.service';
import {FilesService} from '../files/files.service';
import {NotFoundException, ForbiddenException} from '@nestjs/common';

describe('DocumentsService', () => {
  let service: DocumentsService;
  let prisma: jest.Mocked<PrismaService>;
  let filesService: jest.Mocked<FilesService>;

  const mockPrisma = {
    document: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    documentVersion: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    project: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };

  const mockFilesService = {
    presignPut: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: FilesService,
          useValue: mockFilesService,
        },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
    prisma = module.get(PrismaService);
    filesService = module.get(FilesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should return documents for a project', async () => {
      const mockProject = {
        id: '1',
        ownerId: 'user1',
        institutionId: 'inst1',
        participants: [],
      };
      mockPrisma.project.findUnique.mockResolvedValue(mockProject as any);
      const mockDocuments = [
        {id: 'd1', name: 'Document 1', versions: []},
      ];
      mockPrisma.document.findMany.mockResolvedValue(mockDocuments);

      const result = await service.list('1', 'user1', 'RESEARCHER');

      expect(result).toEqual(mockDocuments);
      expect(mockPrisma.document.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {projectId: '1'},
        })
      );
    });
  });

  describe('create', () => {
    it('should create document and initial version', async () => {
      const mockProject = {
        id: '1',
        ownerId: 'user1',
        institutionId: 'inst1',
        participants: [],
      };
      mockPrisma.project.findUnique.mockResolvedValue(mockProject as any);
      const mockDocument = {
        id: 'd1',
        name: 'Document 1',
        s3Key: 'key1',
        projectId: '1',
      };
      mockPrisma.document.create.mockResolvedValue(mockDocument as any);
      mockPrisma.documentVersion.create.mockResolvedValue({} as any);
      mockPrisma.document.findUnique.mockResolvedValue({
        ...mockDocument,
        project: mockProject,
        createdBy: {id: 'user1', email: 'user1@test.com', fullName: 'User 1'},
        versions: [],
      } as any);

      const result = await service.create('1', {
        name: 'Document 1',
        s3Key: 'key1',
        contentType: 'application/pdf',
      }, 'user1', 'RESEARCHER');

      expect(mockPrisma.document.create).toHaveBeenCalled();
      expect(mockPrisma.documentVersion.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          documentId: 'd1',
          version: 1,
          changeNote: 'Initial version',
        }),
      });
      expect(result).toBeDefined();
    });
  });

  describe('createVersion', () => {
    it('should create new version of document', async () => {
      const mockDocument = {
        id: 'd1',
        projectId: '1',
        project: {
          id: '1',
          ownerId: 'user1',
          institutionId: 'inst1',
          participants: [],
        },
      };
      mockPrisma.document.findUnique.mockResolvedValue(mockDocument as any);
      mockPrisma.project.findUnique.mockResolvedValue(mockDocument.project as any);
      mockPrisma.documentVersion.findFirst.mockResolvedValue({version: 1} as any);
      const mockVersion = {id: 'v1', version: 2, documentId: 'd1'};
      mockPrisma.documentVersion.create.mockResolvedValue(mockVersion as any);

      const result = await service.createVersion('d1', {s3Key: 'key2'}, 'user1', 'RESEARCHER');

      expect(result).toEqual(mockVersion);
      expect(mockPrisma.documentVersion.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          documentId: 'd1',
          version: 2,
        }),
      });
    });
  });
});


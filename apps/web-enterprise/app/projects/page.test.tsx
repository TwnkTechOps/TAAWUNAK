import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen, waitFor} from '@testing-library/react';
import ProjectsPage from './page';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

// Mock useAuth hook
vi.mock('lib/auth/useAuth', () => ({
  useAuth: () => ({
    user: {id: 'user1', email: 'test@test.com', role: 'RESEARCHER'},
    loading: false,
  }),
}));

// Mock fetch
global.fetch = vi.fn();

describe('ProjectsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render projects page with header', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<ProjectsPage />);

    await waitFor(() => {
      expect(screen.getByText('Projects')).toBeInTheDocument();
    });
  });

  it('should display stats cards', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {id: '1', title: 'Project 1', status: 'ACTIVE', institution: {name: 'Inst 1'}, owner: {id: 'u1', email: 'o@test.com', fullName: 'Owner'}, participants: [], _count: {milestones: 0, documents: 0, participants: 0}},
      ],
    });

    render(<ProjectsPage />);

    await waitFor(() => {
      expect(screen.getByText('Total Projects')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
    });
  });

  it('should display projects in table', async () => {
    const mockProjects = [
      {
        id: '1',
        title: 'Test Project',
        summary: 'Test summary',
        status: 'ACTIVE',
        institution: {id: 'i1', name: 'Test Institution'},
        owner: {id: 'u1', email: 'owner@test.com', fullName: 'Owner'},
        participants: [],
        _count: {milestones: 0, documents: 0, participants: 0},
        createdAt: new Date().toISOString(),
      },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProjects,
    });

    render(<ProjectsPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });
  });

  it('should handle loading state', () => {
    (global.fetch as any).mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<ProjectsPage />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should handle error state', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    render(<ProjectsPage />);

    await waitFor(() => {
      // Component should handle error gracefully
      expect(screen.getByText('Projects')).toBeInTheDocument();
    });
  });
});


import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen, waitFor, fireEvent} from '@testing-library/react';
import NewProjectPage from './page';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useParams: () => ({id: '1'}),
}));

// Mock useAuth hook
vi.mock('lib/auth/useAuth', () => ({
  useAuth: () => ({
    user: {id: 'user1', email: 'test@test.com', role: 'RESEARCHER', institutionId: 'inst1'},
    loading: false,
  }),
}));

// Mock fetch
global.fetch = vi.fn();

describe('NewProjectPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => [],
    });
  });

  it('should render new project form', async () => {
    render(<NewProjectPage />);

    await waitFor(() => {
      expect(screen.getByText('Create New Project')).toBeInTheDocument();
      expect(screen.getByLabelText(/Project Title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Summary/i)).toBeInTheDocument();
    });
  });

  it('should validate required fields', async () => {
    render(<NewProjectPage />);

    await waitFor(() => {
      const submitButton = screen.getByText('Create Project');
      fireEvent.click(submitButton);
    });

    // Form validation should prevent submission
    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  it('should submit form with valid data', async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{id: 'inst1', name: 'Test Institution'}],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({id: 'proj1', title: 'New Project'}),
      });

    render(<NewProjectPage />);

    await waitFor(() => {
      const titleInput = screen.getByLabelText(/Project Title/i);
      const summaryInput = screen.getByLabelText(/Summary/i);

      fireEvent.change(titleInput, {target: {value: 'Test Project'}});
      fireEvent.change(summaryInput, {target: {value: 'Test summary'}});
    });

    await waitFor(() => {
      const submitButton = screen.getByText('Create Project');
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/projects'),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });
});


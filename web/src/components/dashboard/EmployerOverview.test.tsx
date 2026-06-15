import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EmployerOverview } from './EmployerOverview';

const fetchEmployerOverview = vi.fn();

vi.mock('@/lib/employer-overview-api', () => ({
  fetchEmployerOverview: (...args: unknown[]) => fetchEmployerOverview(...args),
}));

describe('EmployerOverview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading placeholders before data arrives', () => {
    fetchEmployerOverview.mockReturnValue(new Promise(() => undefined));

    const { container } = render(<EmployerOverview />);

    expect(screen.getByText('Employer overview')).toBeInTheDocument();
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
    expect(screen.getAllByText('…').length).toBeGreaterThan(0);
  });

  it('renders stats from the API response', async () => {
    fetchEmployerOverview.mockResolvedValue({
      stats: {
        publishedPostings: 3,
        draftPostings: 1,
        totalApplications: 12,
        awaitingReview: 4,
        inPipeline: 2,
      },
      recentPostings: [
        {
          id: 'job-1',
          title: 'Senior Backend Engineer',
          status: 'PUBLISHED',
          applicantCount: 5,
          location: 'Berlin',
          updatedAt: new Date().toISOString(),
        },
      ],
      recentApplications: [
        {
          id: 'app-1',
          title: 'Senior Backend Engineer',
          status: 'APPLIED',
          appliedAt: new Date().toISOString(),
          applicant: { name: 'Alex Morgan', email: 'alex.morgan@demo.huntflow.app' },
        },
      ],
    });

    render(<EmployerOverview />);

    expect(await screen.findByText('1 draft')).toBeInTheDocument();
    expect(screen.getByText('Alex Morgan')).toBeInTheDocument();
    expect(screen.getAllByText('Senior Backend Engineer').length).toBeGreaterThan(0);
  });

  it('shows empty state when there are no postings', async () => {
    fetchEmployerOverview.mockResolvedValue({
      stats: {
        publishedPostings: 0,
        draftPostings: 0,
        totalApplications: 0,
        awaitingReview: 0,
        inPipeline: 0,
      },
      recentPostings: [],
      recentApplications: [],
    });

    render(<EmployerOverview />);

    expect(await screen.findByText('No postings yet')).toBeInTheDocument();
    expect(screen.getByText('No applications yet')).toBeInTheDocument();
  });
});

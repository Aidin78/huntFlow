import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EmployerNotificationSettings } from './EmployerNotificationSettings';

const fetchEmployerNotificationPreferences = vi.fn();
const updateEmployerNotificationPreferences = vi.fn();

vi.mock('@/lib/employer-settings-api', () => ({
  fetchEmployerNotificationPreferences: (...args: unknown[]) =>
    fetchEmployerNotificationPreferences(...args),
  updateEmployerNotificationPreferences: (...args: unknown[]) =>
    updateEmployerNotificationPreferences(...args),
}));

const basePrefs = {
  notifyNewApplication: true,
  notifyNewMessage: true,
  notifyInterviewReminder: false,
  notifyWeeklySummary: false,
  updatedAt: new Date().toISOString(),
};

describe('EmployerNotificationSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchEmployerNotificationPreferences.mockResolvedValue(basePrefs);
    updateEmployerNotificationPreferences.mockResolvedValue({
      ...basePrefs,
      notifyNewApplication: false,
    });
  });

  it('loads and displays notification preferences', async () => {
    render(<EmployerNotificationSettings />);

    const switches = await screen.findAllByRole('switch');
    expect(switches[0]).toHaveAttribute('aria-checked', 'true');
    expect(switches[1]).toHaveAttribute('aria-checked', 'true');
  });

  it('calls PATCH when a toggle is changed', async () => {
    const user = userEvent.setup();
    render(<EmployerNotificationSettings />);

    const toggle = (await screen.findAllByRole('switch'))[0]!;
    await user.click(toggle);

    await waitFor(() => {
      expect(updateEmployerNotificationPreferences).toHaveBeenCalledWith({
        notifyNewApplication: false,
      });
    });
    expect(toggle).toHaveAttribute('aria-checked', 'false');
  });

  it('shows an error when saving fails', async () => {
    updateEmployerNotificationPreferences.mockResolvedValue({
      error: { message: 'Could not save preference' },
    });

    const user = userEvent.setup();
    render(<EmployerNotificationSettings />);

    await user.click((await screen.findAllByRole('switch'))[0]!);

    expect(await screen.findByText('Could not save preference')).toBeInTheDocument();
    expect((await screen.findAllByRole('switch'))[0]).toHaveAttribute('aria-checked', 'true');
  });
});

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { NotificationBell } from './NotificationBell';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

const fetchNotifications = vi.fn();
const markNotificationRead = vi.fn();
const markAllNotificationsRead = vi.fn();

vi.mock('@/lib/notifications-api', () => ({
  fetchNotifications: (...args: unknown[]) => fetchNotifications(...args),
  markNotificationRead: (...args: unknown[]) => markNotificationRead(...args),
  markAllNotificationsRead: (...args: unknown[]) => markAllNotificationsRead(...args),
}));

describe('NotificationBell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    markNotificationRead.mockResolvedValue({ ok: true });
    markAllNotificationsRead.mockResolvedValue({ ok: true });
  });

  it('shows badge when unreadCount > 0', async () => {
    fetchNotifications.mockResolvedValue({
      items: [
        {
          id: 'n1',
          type: 'NEW_APPLICATION',
          title: 'New application',
          body: 'Alex applied',
          createdAt: new Date().toISOString(),
          readAt: null,
          jobApplicationId: 'app-1',
          href: '/dashboard/employer/applications/app-1',
          actor: null,
        },
      ],
      unreadCount: 2,
      nextCursor: null,
      hasMore: false,
    });

    render(<NotificationBell />);

    expect(await screen.findByLabelText(/Notifications, 2 unread/i)).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows empty state when there are no notifications', async () => {
    fetchNotifications.mockResolvedValue({
      items: [],
      unreadCount: 0,
      nextCursor: null,
      hasMore: false,
    });

    const user = userEvent.setup();
    render(<NotificationBell />);

    await user.click(await screen.findByLabelText(/^Notifications$/i));
    expect(await screen.findByText('No notifications yet')).toBeInTheDocument();
  });

  it('marks notification read and navigates when an item is clicked', async () => {
    fetchNotifications.mockResolvedValue({
      items: [
        {
          id: 'n1',
          type: 'MESSAGE',
          title: 'New message',
          body: 'Hello',
          createdAt: new Date().toISOString(),
          readAt: null,
          jobApplicationId: 'app-1',
          href: '/dashboard/employer/applications/app-1',
          actor: null,
        },
      ],
      unreadCount: 1,
      nextCursor: null,
      hasMore: false,
    });

    const user = userEvent.setup();
    render(<NotificationBell />);

    await user.click(await screen.findByLabelText(/Notifications, 1 unread/i));
    await user.click(screen.getByText('New message'));

    await waitFor(() => {
      expect(markNotificationRead).toHaveBeenCalledWith('n1');
    });
    expect(push).toHaveBeenCalledWith('/dashboard/employer/applications/app-1');
  });
});

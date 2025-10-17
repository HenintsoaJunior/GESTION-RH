"use client";

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '@/config/api-config';

const NOTIFICATIONS_LAST_THREE_UNREAD_KEY = ['notifications', 'last-three-unread'] as const;
const NOTIFICATIONS_UNREAD_COUNT_KEY = ['notifications', 'unread-count'] as const;
const NOTIFICATIONS_BY_USER_KEY = ['notifications', 'by-user'] as const;
const NOTIFICATIONS_UNREAD_COUNT_BY_MENU_KEY = ['notifications', 'unread-count-by-menu'] as const;

interface NotificationData {
  notificationId: string;
  userId: string;
  status: string;
  sentAt: string | null;
  readAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  notification: {
    title: string;
    message: string;
    type: string;
  };
  user: {
    name: string;
    email: string;
  };
}

interface UnreadNotificationCount {
  unreadCount: number;
}

interface UnreadCountByMenu {
  [key: string]: number;
}

export const formatNotificationData = (notificationRecipient: any): NotificationData | null => {
  if (!notificationRecipient) return null;

  return {
    notificationId: notificationRecipient.notificationId || "Non spécifié",
    userId: notificationRecipient.userId || "Non spécifié",
    status: notificationRecipient.status || "pending",
    sentAt: notificationRecipient.sentAt || null,
    readAt: notificationRecipient.readAt || null,
    createdAt: notificationRecipient.createdAt || null,
    updatedAt: notificationRecipient.updatedAt || null,
    notification: {
      title: notificationRecipient.notification?.title || "Non spécifié",
      message: notificationRecipient.notification?.message || "Non spécifié",
      type: notificationRecipient.notification?.type || "info"
    },
    user: {
      name: notificationRecipient.user?.name || "Non spécifié",
      email: notificationRecipient.user?.email || "Non spécifié"
    }
  };
};

// ---------------------------------------------------------------------

export const useLastThreeUnreadNotifications = (userId?: string) => {
  return useQuery<NotificationData[], Error>({
    queryKey: [...NOTIFICATIONS_LAST_THREE_UNREAD_KEY, userId],
    queryFn: async () => {
      const response = await axios.get(`${BASE_URL}/api/notifications/by-user/${userId}/last-three-unread`, {
        headers: {
          accept: '*/*',
        },
      });
      const data = response.data;
      if (!Array.isArray(data)) return [];
      const formattedData = data
        .map(formatNotificationData)
        .filter((item): item is NotificationData => item !== null);
      return formattedData;
    },
    enabled: !!userId,
  });
};

// ---------------------------------------------------------------------

export const useUnreadNotificationCount = (userId?: string) => {
  return useQuery<UnreadNotificationCount, Error>({
    queryKey: [...NOTIFICATIONS_UNREAD_COUNT_KEY, userId],
    queryFn: async () => {
      const response = await axios.get(`${BASE_URL}/api/notifications/by-user/${userId}/unread-count`, {
        headers: {
          accept: '*/*',
        },
      });
      return {
        unreadCount: response.data?.unreadCount ?? 0
      };
    },
    enabled: !!userId,
  });
};

// ---------------------------------------------------------------------

export const useNotificationsByUser = (userId?: string) => {
  return useQuery<NotificationData[], Error>({
    queryKey: [...NOTIFICATIONS_BY_USER_KEY, userId],
    queryFn: async () => {
      const response = await axios.get(`${BASE_URL}/api/notifications/by-user/${userId}`, {
        headers: {
          accept: '*/*',
        },
      });
      const data = response.data;
      if (!Array.isArray(data)) return [];
      const formattedData = data
        .map(formatNotificationData)
        .filter((item): item is NotificationData => item !== null);
      return formattedData;
    },
    enabled: !!userId,
  });
};

// ---------------------------------------------------------------------

export const useUnreadNotificationCountByMenu = (userId?: string, relatedMenu?: string | null) => {
  return useQuery<UnreadCountByMenu, Error>({
    queryKey: [...NOTIFICATIONS_UNREAD_COUNT_BY_MENU_KEY, userId, relatedMenu],
    queryFn: async () => {
      const url = relatedMenu
        ? `/api/notifications/by-user/${userId}/unread-count-by-menu?relatedMenu=${encodeURIComponent(relatedMenu)}`
        : `/api/notifications/by-user/${userId}/unread-count-by-menu`;
      const response = await axios.get(`${BASE_URL}${url}`, {
        headers: {
          accept: '*/*',
        },
      });
      return response.data && typeof response.data === 'object' ? response.data : {};
    },
    enabled: !!userId,
  });
};
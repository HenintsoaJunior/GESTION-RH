import { useCallback } from "react";
import { apiGet } from "utils/apiUtils";
import { handleValidationError } from "utils/validation";

const userData = JSON.parse(localStorage.getItem("user"));
const userId = userData?.userId;

export const formatNotificationData = (notificationRecipient) => {
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

export const GetLastThreeUnreadNotifications = () => {
  return useCallback(async (userIdParam) => {
    if (!userIdParam && !userId) {
      throw new Error("User ID is required. Please ensure you are logged in.");
    }

    try {
      const effectiveUserId = userIdParam || userId;
      const response = await apiGet(`/api/notifications/by-user/${effectiveUserId}/last-three-unread`);
      
      const data = Array.isArray(response) ? response : [];
      
      const formattedData = data.map((notificationRecipient) => 
        formatNotificationData(notificationRecipient)
      );
      
      return formattedData;
    } catch (error) {
      handleValidationError(error);
      throw error;
    }
  }, [userId]);
};

export const GetUnreadNotificationCount = () => {
  return useCallback(async (userIdParam) => {
    if (!userIdParam && !userId) {
      throw new Error("User ID is required. Please ensure you are logged in.");
    }

    try {
      const effectiveUserId = userIdParam || userId;
      const response = await apiGet(`/api/notifications/by-user/${effectiveUserId}/unread-count`);
      
      return {
        unreadCount: response?.unreadCount ?? 0
      };
    } catch (error) {
      handleValidationError(error);
      throw error;
    }
  }, [userId]);
};


export const GetNotificationsByUser = () => {
  return useCallback(async (userIdParam) => {
    if (!userIdParam && !userId) {
      throw new Error("User ID is required. Please ensure you are logged in.");
    }

    try {
      const effectiveUserId = userIdParam || userId;
      const response = await apiGet(`/api/notifications/by-user/${effectiveUserId}`);
      
      const data = Array.isArray(response) ? response : [];
      
      const formattedData = data.map((notificationRecipient) => 
        formatNotificationData(notificationRecipient)
      );
      
      return formattedData;
    } catch (error) {
      handleValidationError(error);
      throw error;
    }
  }, [userId]);
};


export const GetUnreadNotificationCountByMenu = () => {
  return useCallback(async (userIdParam, relatedMenu = null) => {
    if (!userIdParam && !userId) {
      throw new Error("User ID is required. Please ensure you are logged in.");
    }

    try {
      const effectiveUserId = userIdParam || userId;
      const url = relatedMenu
        ? `/api/notifications/by-user/${effectiveUserId}/unread-count-by-menu?relatedMenu=${encodeURIComponent(relatedMenu)}`
        : `/api/notifications/by-user/${effectiveUserId}/unread-count-by-menu`;
      const response = await apiGet(url);
      
      return response && typeof response === 'object' ? response : {};
    } catch (error) {
      handleValidationError(error);
      throw error;
    }
  }, [userId]);
};
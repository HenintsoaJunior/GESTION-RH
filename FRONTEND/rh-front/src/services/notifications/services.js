import { useCallback } from "react";
import { apiGet } from "utils/apiUtils";
import { handleValidationError } from "utils/validation";


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

// ---------------------------------------------------------------------

export const GetLastThreeUnreadNotifications = () => {
    // Le hook renvoie une fonction qui exige le 'userId' en paramètre.
    return useCallback(async (userId) => {
        if (!userId) {
            throw new Error("User ID is required.");
        }

        try {
            const response = await apiGet(`/api/notifications/by-user/${userId}/last-three-unread`);
            
            const data = Array.isArray(response) ? response : [];
            
            // Simplification de la map
            const formattedData = data.map(formatNotificationData);
            
            return formattedData;
        } catch (error) {
            handleValidationError(error);
            throw error;
        }
    }, []); // Dépendance 'userId' supprimée, tableau vide.
};

// ---------------------------------------------------------------------

export const GetUnreadNotificationCount = () => {
    return useCallback(async (userId) => {
        if (!userId) {
            throw new Error("User ID is required.");
        }

        try {
            const response = await apiGet(`/api/notifications/by-user/${userId}/unread-count`);
            
            return {
                unreadCount: response?.unreadCount ?? 0
            };
        } catch (error) {
            handleValidationError(error);
            throw error;
        }
    }, []); // Tableau de dépendances vide.
};

// ---------------------------------------------------------------------

export const GetNotificationsByUser = () => {
    return useCallback(async (userId) => {
        if (!userId) {
            throw new Error("User ID is required.");
        }

        try {
            const response = await apiGet(`/api/notifications/by-user/${userId}`);
            
            const data = Array.isArray(response) ? response : [];
            
            const formattedData = data.map(formatNotificationData);
            
            return formattedData;
        } catch (error) {
            handleValidationError(error);
            throw error;
        }
    }, []); // Tableau de dépendances vide.
};

// ---------------------------------------------------------------------

export const GetUnreadNotificationCountByMenu = () => {
    return useCallback(async (userId, relatedMenu = null) => {
        if (!userId) {
            throw new Error("User ID is required.");
        }

        try {
            const url = relatedMenu
                ? `/api/notifications/by-user/${userId}/unread-count-by-menu?relatedMenu=${encodeURIComponent(relatedMenu)}`
                : `/api/notifications/by-user/${userId}/unread-count-by-menu`;
            const response = await apiGet(url);
            
            return response && typeof response === 'object' ? response : {};
        } catch (error) {
            handleValidationError(error);
            throw error;
        }
    }, []); // Tableau de dépendances vide.
};
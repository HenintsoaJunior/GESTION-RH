import { apiGet, apiPost, apiPut, apiDelete } from "utils/apiUtils";
import { handleValidationError } from "utils/validation";
import { useCallback } from "react";

// Format comment data to ensure consistent structure
/**
 * @param {any} comment - Raw comment data from API
 * @returns {Object|null} - Formatted comment object or null if invalid
 */
export const formatCommentData = (comment) => {
  if (!comment || !comment.comment) return null;
  return {
    commentId: comment.commentId || "Non spécifié",
    content: comment.comment.commentText || "Non spécifié",
    createdAt: comment.comment.createdAt || new Date().toISOString(),
    missionId: comment.missionId || "Non spécifié",
    creator: {
      userId: comment.comment.user?.userId || "Non spécifié",
      name: comment.comment.user?.name || "Non spécifié",
      email: comment.comment.user?.email || "Non spécifié",
      position: comment.comment.user?.position || "Non spécifié",
      department: comment.comment.user?.department || "Non spécifié",
    },
  };
};

// Hook to create a new comment
/**
 * @returns {Function} - Function to create a comment
 */
export const CreateComment = () => {
  return useCallback(async (commentData) => {
    if (!commentData) {
      throw new Error("Comment data is required");
    }
    // Structure the data to match the API request format
    const payload = {
      missionId: commentData.missionId,
      userId: commentData.userId,
      commentText: commentData.commentText,
      createdAt: commentData.createdAt || new Date().toISOString(),
    };
    try {
      const response = await apiPost("/api/Comments/mission", payload);
      return {
        commentId: response.commentId || "Non spécifié",
      };
    } catch (error) {
      handleValidationError(error);
      throw error;
    }
  }, []);
};

// Hook to get comments by recruitment request ID
/**
 * @returns {Function} - Function to fetch comments by recruitment request ID
 */
export const GetCommentsByMission = () => {
  return useCallback(async (missionId) => {
    if (!missionId) {
      throw new Error("Mission ID is required");
    }
    try {
      const response = await apiGet(`/api/Comments/by-mission/${missionId}`);
      const data = Array.isArray(response) ? response : [];
      const formattedData = data
        .map((comment) => formatCommentData(comment))
        .filter((comment) => comment !== null);
      return formattedData;
    } catch (error) {
      handleValidationError(error);
      throw error;
    }
  }, []);
};

// Hook to update a comment
/**
 * @returns {Function} - Function to update a comment
 */
export const UpdateComment = () => {
  return useCallback(async (commentId, commentData) => {
    if (!commentId) {
      throw new Error("Comment ID is required");
    }
    if (!commentData) {
      throw new Error("Comment data is required");
    }
    // Structure the data to match the API request format
    const payload = {
      missionId: commentData.missionId,
      userId: commentData.userId,
      commentText: commentData.commentText,
      createdAt: commentData.createdAt || new Date().toISOString(),
    };
    try {
      const response = await apiPut(`/api/Comments/${commentId}`, payload);
      if (!response) {
        throw new Error("Réponse API invalide");
      }
      return {
        success: true,
        message:
          response.data.message ||
          response.data.Message ||
          "Commentaire mis à jour avec succès",
      };
    } catch (error) {
      throw handleValidationError(error);
    }
  }, []);
};

// Hook to delete a comment
/**
 * @returns {Function} - Function to delete a comment
 */
export const DeleteComment = () => {
  return useCallback(async (commentId, missionId, userId) => {
    try {
      const response = await apiDelete(
        `/api/Comments/${commentId}/mission/${missionId}?userId=${userId}`
      );

      if (!response || !response.data) {
        throw new Error("Invalid API response: No data received");
      }

      const { message, data } = response.data;

      const responseMessage = message || "Comment deleted successfully";

      return {
        success: true,
        message: responseMessage,
        data: {
          commentId: data?.commentId || commentId,
          missionId: data?.missionId || missionId,
        },
      };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete comment";
      throw new Error(errorMessage);
    }
  }, []);
};
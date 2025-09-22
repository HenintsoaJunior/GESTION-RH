import { apiGet, apiPost, apiPut, apiDelete } from "utils/apiUtils";
import { handleValidationError } from "utils/validation";
import { useCallback } from "react";

// Interface for comment data structure
interface CommentData {
  recruitmentRequestId: string;
  userId: string;
  commentText: string;
  createdAt: string;
}

// Interface for formatted comment response
interface FormattedComment {
  commentId: string;
  content: string;
  createdAt: string;
  recruitmentRequestId: string;
  creator: {
    userId: string;
    name: string;
    email: string;
    position: string;
    department: string;
  };
}

// Format comment data to ensure consistent structure
export const formatCommentData = (comment: any): FormattedComment | null => {
  if (!comment || !comment.comment) return null;
  return {
    commentId: comment.commentId || "Non spécifié",
    content: comment.comment.commentText || "Non spécifié",
    createdAt: comment.comment.createdAt || new Date().toISOString(),
    recruitmentRequestId: comment.recruitmentRequestId || "Non spécifié",
    creator: {
      userId: comment.comment.user?.userId || "Non spécifié",
      name: comment.comment.user?.name || "Non spécifié",
      email: comment.comment.user?.email || "Non spécifié",
      position: comment.comment.user?.position || "Non spécifié",
      department: comment.comment.user?.department || "Non spécifié"
    }
  };
};

// Hook to create a new comment
export const useCreateComment = () => {
  return useCallback(async (commentData: CommentData) => {
    if (!commentData) {
      throw new Error("Comment data is required");
    }
    // Structure the data to match the API request format
    const payload = {
      recruitmentRequestId: commentData.recruitmentRequestId,
      userId: commentData.userId,
      commentText: commentData.commentText,
      createdAt: commentData.createdAt || new Date().toISOString()
    };
    try {
      const response = await apiPost("/api/Comments/recruitment-request", payload);
      return {
        commentId: response.commentId || "Non spécifié"
      };
    } catch (error) {
      handleValidationError(error);
      throw error;
    }
  }, []);
};

// Hook to get comments by recruitment request ID
export const useGetCommentsByRecruitmentRequest = () => {
  return useCallback(async (recruitmentRequestId: string) => {
    if (!recruitmentRequestId) {
      throw new Error("Recruitment Request ID is required");
    }
    try {
      const response = await apiGet(`/api/Comments/by-recruitment-request/${recruitmentRequestId}`);
      const data = Array.isArray(response) ? response : [];
      const formattedData = data.map((comment: any) => formatCommentData(comment)).filter((comment: any) => comment !== null);
      return formattedData;
    } catch (error) {
      handleValidationError(error);
      throw error;
    }
  }, []);
};

export const useUpdateComment = () => {
  return useCallback(async (commentId, commentData) => {
    if (!commentId) {
      throw new Error("Comment ID is required");
    }
    if (!commentData) {
      throw new Error("Comment data is required");
    }
    // Structure the data to match the API request format
    const payload = {
      recruitmentRequestId: commentData.recruitmentRequestId,
      userId: commentData.userId,
      commentText: commentData.commentText,
      createdAt: commentData.createdAt || new Date().toISOString()
    };
    try {
      const response = await apiPut(`/api/Comments/${commentId}`, payload);
      if (!response) {
        throw new Error("Réponse API invalide");
      }
      return { 
        success: true, 
        message: response.data.message || response.data.Message || "Commentaire mis à jour avec succès"
      };
    } catch (error) {
      throw handleValidationError(error);
    }
  }, []);
};

export const useDeleteComment = () => {
  return useCallback(async (commentId, recruitmentRequestId, userId) => {
    try {
      const response = await apiDelete(
        `/api/Comments/${commentId}/recruitment-request/${recruitmentRequestId}?userId=${userId}`
      );

      if (!response || !response.data) {
        throw new Error('Invalid API response: No data received');
      }

      const { message, data } = response.data;

      const responseMessage = message || 'Comment deleted successfully';


      return {
        success: true,
        message: responseMessage,
        data: {
          commentId: data?.commentId || commentId,
          recruitmentRequestId: data?.recruitmentRequestId || recruitmentRequestId,
        },
      };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to delete comment';
      throw new Error(errorMessage);
    }
  }, []);
};
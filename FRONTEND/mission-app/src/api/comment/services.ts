import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import api from '@/utils/axios-config';

const COMMENTS_BY_MISSION_KEY = ['commentsByMission'] as const;

export interface CommentForm {
  missionId: string;
  userId: string;
  commentText: string;
  createdAt: string;
}

interface Role {
  roleId: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string | null;
}

interface UserRole {
  userId: string;
  roleId: string;
  role: Role;
  createdAt: string;
  updatedAt: string | null;
}

export interface User {
  userId: string;
  matricule: string;
  email: string;
  name: string;
  position: string;
  department: string;
  superiorId: string;
  superiorName: string;
  status: string | null;
  signature: string | null;
  userType: number;
  refreshToken: string;
  refreshTokenExpiry: string;
  userRoles: UserRole[];
  userHabilitations: any[]; // Assuming this field exists based on response
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  commentId: string;
  commentText: string;
  userId: string;
  user: User;
  missionComments: any[];
  createdAt: string;
  updatedAt: string | null;
}

export interface CommentMission {
  missionId: string;
  commentId: string;
  mission: null;
  comment: Comment;
}

interface ApiResponse<T> {
  data: T | null;
  status: number;
  message: string;
}

type CommentsByMissionResponse = ApiResponse<CommentMission[]>;
type CreateCommentResponse = ApiResponse<{ commentId: string }>;
type UpdateCommentResponse = ApiResponse<{ message: string; data: boolean }>;
type DeleteCommentResponse = ApiResponse<{ message: string; data: { commentId: string; missionId: string } }>;

export interface UpdateCommentParams {
  commentId: string;
  comment: CommentForm;
}

export interface DeleteCommentParams {
  commentId: string;
  missionId: string;
  userId: string;
}

export const useCommentsByMission = (missionId: string | undefined) => {
  const queryKey = [...COMMENTS_BY_MISSION_KEY, missionId] as const;

  return useQuery<CommentsByMissionResponse, Error>({
    queryKey,
    queryFn: async () => {
      if (!missionId) {
        throw new Error('missionId is required for fetching comments');
      }
      try {
        const response = await api.get(`/api/Comments/by-mission/${missionId}`);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
    enabled: !!missionId,
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateCommentResponse, Error, CommentForm>({
    mutationFn: async (comment: CommentForm) => {
      try {
        const response = await api.post('/api/Comments/mission', comment);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...COMMENTS_BY_MISSION_KEY, variables.missionId] });
    },
  });
};

export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation<UpdateCommentResponse, Error, UpdateCommentParams>({
    mutationFn: async ({ commentId, comment }: UpdateCommentParams) => {
      try {
        const response = await api.put(`/api/Comments/${commentId}`, comment);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...COMMENTS_BY_MISSION_KEY, variables.comment.missionId] });
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation<DeleteCommentResponse, Error, DeleteCommentParams>({
    mutationFn: async ({ commentId, missionId, userId }: DeleteCommentParams) => {
      try {
        const response = await api.delete(`/api/Comments/${commentId}/mission/${missionId}?userId=${userId}`);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...COMMENTS_BY_MISSION_KEY, variables.missionId] });
    },
  });
};
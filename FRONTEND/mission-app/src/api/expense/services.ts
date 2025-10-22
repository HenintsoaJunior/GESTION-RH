import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import api from '@/utils/axios-config';

const EXPENSE_REPORT_KEY = ['expense-report', 'total-notreimbursed'] as const;

interface TotalNotReimbursed {
  totalNotReimbursedAmount: number;
}

interface ApiResponse<T> {
  data: T | null;
  status: number;
  message: string;
}

type TotalNotReimbursedResponse = ApiResponse<TotalNotReimbursed>;

export const useTotalNotReimbursed = () => {
  return useQuery<TotalNotReimbursedResponse, Error>({
    queryKey: EXPENSE_REPORT_KEY,
    queryFn: async () => {
      try {
        const response = await api.get('/api/ExpenseReport/total-notreimbursed');
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
  });
};
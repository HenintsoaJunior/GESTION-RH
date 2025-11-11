import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import axios from 'axios';
import api from '@/utils/axios-config';

const PREVISION_KEY = ['prevision'] as const;
const PREVISION_MONTH_KEY = ['prevision-month'] as const;

interface PrevisionPrice {
  previsionId: string;
  amount: number;
  departureDate: string;
}

interface ApiResponse<T> {
  data: T | null;
  status: number;
  message: string;
}

type PrevisionPriceResponse = ApiResponse<PrevisionPrice[]>;

export const usePrevision = () => {
  return useQuery<PrevisionPriceResponse, Error>({
    queryKey: PREVISION_KEY,
    queryFn: async () => {
      try {
        const response = await api.get('/api/Prevision');
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

export const usePrevisionForMonth = () => {
  const { data: allPrevisionData, isLoading, error } = useQuery<PrevisionPriceResponse, Error>({
    queryKey: PREVISION_MONTH_KEY,
    queryFn: async () => {
      try {
        const response = await api.get('/api/Prevision');
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
  });

  const filteredData = useMemo(() => {
    if (!allPrevisionData?.data) {
      return null;
    }

    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const monthStr = month.toString().padStart(2, '0');
    const monthPrefix = `${year}-${monthStr}-`;

    const previsionForMonth = allPrevisionData.data.filter(
      (item) => item.departureDate.startsWith(monthPrefix)
    );

    return {
      ...allPrevisionData,
      data: previsionForMonth,
    } as ApiResponse<PrevisionPrice[]>;
  }, [allPrevisionData]);

  return {
    data: filteredData,
    isLoading,
    error,
  };
};
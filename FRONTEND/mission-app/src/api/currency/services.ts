import { API_DEVISE } from '@/config/api-config';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const CURRENCIES_KEY = ['currencies'] as const;

export interface CurrencyRates {
  base: string;
  rates: Record<string, number>;
}

export const useCurrencies = () => {
  return useQuery<CurrencyRates, Error>({
    queryKey: CURRENCIES_KEY,
    queryFn: async () => {
      try {
        const response = await axios.get(`${API_DEVISE}`);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(`Failed to fetch currencies: ${error.message}`);
        }
        throw error;
      }
    },
  });
};


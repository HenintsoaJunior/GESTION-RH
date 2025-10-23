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

export const useConvertToMGA = (amount: number, fromCurrency: string) => {
  const { data: rates, isLoading, error } = useCurrencies();

  if (isLoading) {
    return { convertedAmount: 0, isLoading: true, error: null };
  }

  if (error || !rates || !rates.rates[fromCurrency] || !rates.rates['MGA']) {
    return { 
      convertedAmount: 0, 
      isLoading: false, 
      error: error ? (error as Error).message : 'Devise non supportée' 
    };
  }

  if (fromCurrency.toUpperCase() === 'MGA') {
    return { convertedAmount: amount, isLoading: false, error: null };
  }

  const usdAmount = amount / rates.rates[fromCurrency];
  const mgaAmount = usdAmount * rates.rates['MGA'];

  return { convertedAmount: mgaAmount, isLoading: false, error: null };
};
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '@/config/api-config';

export const MENU_HIERARCHY_KEY = ['menuHierarchy'] as const;

interface Menu {
  menuKey: string;
  label?: string | null;
  link: string;
  icon: string;
  section?: string;
  position: number;
}

interface MenuItem {
  hierarchyId: number;
  menu: Menu;
  children?: MenuItem[];
}

type MenuResponse = MenuItem[];

export const useMenuHierarchy = (userId?: string) => {
  return useQuery<MenuResponse, Error>({
    queryKey: [...MENU_HIERARCHY_KEY, userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error('User ID is required');
      }
      const response = await axios.get(`${BASE_URL}/api/Menu/hierarchy?UserId=${encodeURIComponent(userId)}`, {
        headers: {
          accept: '*/*',
        },
      });
      return response.data;
    },
    enabled: !!userId,
  });
};
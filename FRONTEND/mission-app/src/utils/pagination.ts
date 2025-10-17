export const getPaginationRange = (currentPage: number, totalPages: number, maxButtons: number = 5): number[] => {
  const half = Math.floor(maxButtons / 2);
  let start = Math.max(1, currentPage - half);
  const end = Math.min(totalPages, start + maxButtons - 1);

  if (end - start + 1 < maxButtons) {
    start = Math.max(1, end - maxButtons + 1);
  }

  const pages: number[] = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
};

interface PaginationInfo {
  startEntry: number;
  endEntry: number;
  totalEntries: number;
}

export const getPaginationInfo = (currentPage: number, pageSize: number, totalEntries: number): PaginationInfo => {
  const startEntry = Math.min((currentPage - 1) * pageSize + 1, totalEntries);
  const endEntry = Math.min(currentPage * pageSize, totalEntries);
  return {
    startEntry,
    endEntry,
    totalEntries,
  };
};
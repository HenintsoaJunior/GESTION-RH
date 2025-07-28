export const getPaginationRange = (currentPage, totalPages, maxButtons = 5) => {
  const half = Math.floor(maxButtons / 2);
  let start = Math.max(1, currentPage - half);
  let end = Math.min(totalPages, start + maxButtons - 1);

  if (end - start + 1 < maxButtons) {
    start = Math.max(1, end - maxButtons + 1);
  }

  const pages = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
};

export const getPaginationInfo = (currentPage, pageSize, totalEntries) => {
  const startEntry = Math.min((currentPage - 1) * pageSize + 1, totalEntries);
  const endEntry = Math.min(currentPage * pageSize, totalEntries);
  return {
    startEntry,
    endEntry,
    totalEntries,
  };
};
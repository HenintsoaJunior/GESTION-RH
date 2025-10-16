export const formatNumber = (num: number): string => {
  if (isNaN(num) || num === null || num === undefined) {
    return '';
  }
  return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
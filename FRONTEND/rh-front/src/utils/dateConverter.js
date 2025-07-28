// utils/generalisation.js
export const formatDate = (dateInput) => {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (isNaN(date)) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`; // e.g., 25/07/2025
};

// Optional: Function to convert to YYYY-MM-DD for <input type="date">
export const toInputDateFormat = (dateInput) => {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (isNaN(date)) return "";
  return date.toISOString().split("T")[0]; // e.g., 2025-07-25
};
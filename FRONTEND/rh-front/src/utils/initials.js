// Fonction pour obtenir les initiales d'un nom
export const getInitials = (name) => {
  const cleanName = name.replace(/\s*\([^)]+\)\s*/g, "").trim();
  const nameParts = cleanName.split(/\s+/);
  const firstInitial = nameParts[0] ? nameParts[0][0] : "J";
  const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1][0] : "D";
  return `${firstInitial}${lastInitial}`.toUpperCase();
};

export const formatDate = (dateInput) => {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (isNaN(date)) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`; // e.g., 25/07/2025
};

// Nouvelle fonction pour formater la date et l'heure avec un décalage de +3 heures
export const formatDateTime = (dateInput) => {
  if (!dateInput) return "";
  // Extraire directement les parties de la chaîne ISO
  const match = dateInput.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!match) return "";
  const [, year, month, day, hours, minutes] = match;
  // Convertir les heures en nombre et ajouter 3 heures
  let adjustedHours = parseInt(hours) + 3;
  let adjustedDay = parseInt(day);
  let adjustedMonth = parseInt(month);
  let adjustedYear = parseInt(year);
  
  // Gérer le cas où l'addition des heures dépasse 24
  if (adjustedHours >= 24) {
    adjustedHours -= 24;
    adjustedDay += 1;
    // Vérifier si le jour dépasse le nombre de jours dans le mois
    const daysInMonth = new Date(adjustedYear, adjustedMonth, 0).getDate();
    if (adjustedDay > daysInMonth) {
      adjustedDay = 1;
      adjustedMonth += 1;
      if (adjustedMonth > 12) {
        adjustedMonth = 1;
        adjustedYear += 1;
      }
    }
  }
  
  // Formater les valeurs avec un padding de zéros
  const formattedDay = String(adjustedDay).padStart(2, "0");
  const formattedMonth = String(adjustedMonth).padStart(2, "0");
  const formattedHours = String(adjustedHours).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");
  
  return `${formattedDay}/${formattedMonth}/${adjustedYear} ${formattedHours}:${formattedMinutes}`; // e.g., 02/09/2025 00:55
};

// Optional: Function to convert to YYYY-MM-DD for <input type="date">
export const toInputDateFormat = (dateInput) => {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (isNaN(date)) return "";
  return date.toISOString().split("T")[0]; // e.g., 2025-07-25
};
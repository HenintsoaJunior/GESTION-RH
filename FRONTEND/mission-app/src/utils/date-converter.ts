/**
 * Formate une chaîne de date ou un objet Date en format JJ/MM/AAAA.
 * @param dateInput La date à formater (peut être une chaîne ou un objet Date).
 * @returns La date formatée (ex: "25/07/2025") ou une chaîne vide.
 */
export const formatDate = (dateInput: string | Date | null | undefined): string => {
  if (!dateInput) return "";

  // S'assurer que l'entrée est traitée comme une date valide
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // getMonth() est basé sur 0
  const year = date.getFullYear();

  return `${day}/${month}/${year}`; // e.g., 25/07/2025
};

//-------------------------------------------------

/**
 * Formate une chaîne de date ISO (ex: YYYY-MM-DDTHH:mm:ss.sssZ) en format JJ/MM/AAAA HH:mm
 * avec un décalage de +3 heures.
 * Cette implémentation suppose que dateInput est une chaîne ISO valide (début YYYY-MM-DDTHH:mm).
 * Pour une gestion robuste des fuseaux horaires et des calculs de dates, l'utilisation
 * d'une bibliothèque comme 'date-fns' ou 'luxon' est fortement recommandée.
 * @param dateInput La chaîne de date ISO à formater et à décaler.
 * @returns La date et l'heure formatées avec un décalage de +3h (ex: "02/09/2025 00:55") ou une chaîne vide.
 */
export const formatDateTime = (dateInput: string | null | undefined): string => {
  if (!dateInput) return "";

  // Extraire directement les parties de la chaîne ISO (ex: 2025-09-01T21:55)
  const match = dateInput.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!match) return "";

  // Utiliser une assertion '!' car on a vérifié l'existence du match
  const [, year, month, day, hours, minutes] = match;

  // Convertir les heures, jours, mois, années en nombres
  let adjustedHours: number = parseInt(hours, 10) + 3; // +3 heures de décalage
  let adjustedDay: number = parseInt(day, 10);
  let adjustedMonth: number = parseInt(month, 10);
  let adjustedYear: number = parseInt(year, 10);

  // Gérer le cas où l'addition des heures dépasse 24
  if (adjustedHours >= 24) {
    adjustedHours -= 24;
    adjustedDay += 1;

    // Vérifier si le jour dépasse le nombre de jours dans le mois
    // Note: Le mois dans le constructeur Date doit être de 0 à 11.
    // 'adjustedMonth' est de 1 à 12, donc on utilise 'adjustedMonth', et '0' pour le jour
    // pour obtenir le dernier jour du mois PRÉCÉDENT.
    // Pour obtenir le nombre de jours dans 'adjustedMonth', on utilise (adjustedMonth) et le jour 0.
    const daysInMonth: number = new Date(adjustedYear, adjustedMonth, 0).getDate();

    if (adjustedDay > daysInMonth) {
      adjustedDay = 1;
      adjustedMonth += 1;

      // Gérer le changement d'année
      if (adjustedMonth > 12) {
        adjustedMonth = 1;
        adjustedYear += 1;
      }
    }
  }

  // Formater les valeurs avec un padding de zéros
  const formattedDay: string = String(adjustedDay).padStart(2, "0");
  const formattedMonth: string = String(adjustedMonth).padStart(2, "0");
  const formattedHours: string = String(adjustedHours).padStart(2, "0");
  const formattedMinutes: string = String(minutes).padStart(2, "0");

  return `${formattedDay}/${formattedMonth}/${adjustedYear} ${formattedHours}:${formattedMinutes}`; // e.g., 02/09/2025 00:55
};

//-------------------------------------------------

/**
 * Convertit une chaîne de date ou un objet Date en format AAAA-MM-JJ.
 * Utile pour l'attribut 'value' des éléments <input type="date"> HTML.
 * @param dateInput La date à convertir.
 * @returns La date au format "AAAA-MM-JJ" (ex: "2025-07-25") ou une chaîne vide.
 */
export const toInputDateFormat = (dateInput: string | Date | null | undefined): string => {
  if (!dateInput) return "";

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "";

  // toISOString() renvoie "AAAA-MM-JJTHH:mm:ss.sssZ"
  // On prend juste la partie date (avant le 'T')
  return date.toISOString().split("T")[0]; // e.g., 2025-07-25
};
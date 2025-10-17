export const getStatusBadgeClass = (status: string) => {
  const normalized = status.trim().toLowerCase();
  switch (normalized) {
    case "en cours":
    case "in progress":
      return "status-progress";
    case "planifié":
    case "planned":
      return "status-pending";
    case "terminé":
    case "completed":
      return "status-approved";
    default:
      return "status-pending";
  }
};

export const englishToFrench: Record<string, string> = {
  "in progress": "En cours",
  "completed": "Terminé",
  "planned": "Planifié",
};

export const frenchToEnglish: Record<string, string> = {
  "En cours": "In Progress",
  "Terminé": "Completed",
  "Planifié": "Planned",
};
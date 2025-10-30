export const getStatusBadgeClass = (status: string) => {
  const normalized = status.trim().toLowerCase();
  switch (normalized) {
    case "Mission en courss de validation":
    case "pending approval":
      return "status-waiting";
    case "en cours":
    case "en cours d'exécution":
    case "in progress":
      return "status-progress";
    case "planifié":
    case "planned":
      return "status-pending";
    case "terminé":
    case "completed":
      return "status-approved";
    case "paiement en cours":
    case "payment in progress":
      return "status-progress";
    case "indemnité payée":
    case "indemnity paid":
      return "status-approved";
    case "note de frais payée":
    case "expense note paid":
      return "status-approved";
    default:
      return "status-pending";
  }
};

export const englishToFrench: Record<string, string> = {
  "pending approval": "Mission en cours de validation",
  "in progress": "En cours d'exécution",
  "completed": "Terminé",
  "planned": "Planifié",
  "payment in progress": "Paiement en cours",
  "indemnity paid": "Indemnité payée",
  "expense note paid": "Note de frais payée",
};

export const frenchToEnglish: Record<string, string> = {
  "À valider": "Pending approval",
  "En cours d'exécution": "In Progress",
  "Terminé": "Completed",
  "Planifié": "Planned",
  "Paiement en cours": "Payment in progress",
  "Indemnité payée": "Indemnity paid",
  "Note de frais payée": "Expense note paid",
};
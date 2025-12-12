export const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('fr-MG', {
        style: 'currency',
        currency: 'MGA',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

export const formatDate = (dateString?: string | null): string => {
    if (!dateString) return "Date non spécifiée";
    return new Date(dateString).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

export const getDaysUntilDue = (dueDate?: string | null): number => {
    if (!dueDate) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const formatEmployeeName = (fullName: string): string => {
    return fullName || "Non spécifié";
};
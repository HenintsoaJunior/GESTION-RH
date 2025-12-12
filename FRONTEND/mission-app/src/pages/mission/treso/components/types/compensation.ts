// Types pour les filtres
export interface Filter {
    employeeId: string;
    employeeName: string;
    employeeMatricule: string;
    status: string;
    validationDateFrom?: string;
    validationDateTo?: string;
    requestDateFrom?: string;
    requestDateTo?: string;
}

export interface AppliedFilters extends Filter {
    missionType: string;
    paymentDateFrom?: string;
    paymentDateTo?: string;
}

export interface BeneficiarySuggestion {
    id: string;
    name: string;
    displayName: string;
    acronym: string;
    matricule?: string;
    invertedName?: string; 
}

export interface Suggestions {
    beneficiary: BeneficiarySuggestion[];
}

// Types pour l'état de chargement
export interface LoadingState {
    compensations: boolean;
    employees: boolean;
    stats: boolean;
}

// Type pour la compensation formatée
export interface FormattedCompensation {
    id: string;
    missionId: string;
    employeeId: string;
    employeeName: string;
    employeeCode: string;
    missionName: string;
    missionType: string;
    transportType: string;
    lieuName: string;
    departureDate: string;
    returnDate: string;
    duration: number;
    totalAmount: number;
    status: string;
    paymentDate: string | null;
    createdAt: string;
    updatedAt: string | null;
    isValidated: boolean | null;
    allocatedFund: number;
}

// Props pour les composants
export interface CompensationFiltersProps {
    isHidden: boolean;
    setIsHidden: React.Dispatch<React.SetStateAction<boolean>>;
    filters: Filter;
    setFilters: React.Dispatch<React.SetStateAction<Filter>>;
    suggestions: Suggestions;
    isLoading: LoadingState;
    handleFilterSubmit: () => void;
    handleResetFilters: () => void;
}

export interface CompensationMissionCardsProps {
    compensations: FormattedCompensation[];
    isLoading: LoadingState;
    handleRowClick: (compensationId: string) => void;
    handleAction?: (compensationId: string, employeeId: string, action: 'pay') => Promise<void>;
    formatDate: (dateString?: string | null) => string;
    getDaysUntilDue: (dueDate?: string | null) => number;
    currentPage: number;
    pageSize: number;
    totalEntries: number;
    handlePageChange: (newPage: number) => void;
    handlePageSizeChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    appliedFilters: AppliedFilters;
}
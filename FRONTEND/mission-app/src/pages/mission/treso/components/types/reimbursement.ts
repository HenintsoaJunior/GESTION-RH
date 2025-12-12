export interface Filter {
    status: string;
    missionType: string;
    employeeSearch: string;
    employeeCode: string;
    paymentDateMin: string;
    paymentDateMax: string;
    fictionalFilter: string;
}

export interface LoadingState {
    remboursements: boolean;
    employees: boolean;
}

export interface FormattedRemboursement {
    missionId: string;
    employeeId: string;
    employeeName: string;
    employeeCode: string;
    missionName: string;
    missionType: string;
    lieuName: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    updatedAt: string | null;
    isValidated: boolean | null;
    allocatedFund: number;
}

export interface AlertState {
    message: string;
    type: "success" | "error" | "warning" | "info";
    isOpen: boolean;
}

export interface ReimbursementModalData {
    missionId: string;
    employeeId: string;
}
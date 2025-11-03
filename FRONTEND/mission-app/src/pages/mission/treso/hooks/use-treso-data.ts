/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { useCompensationsByStatus, useTotalNotPaid, type Compensation } from "@/api/compensation/national/services";

interface Alert {
  isOpen: boolean;
  type: string;
  message: string;
}

interface LoadingState {
  compensations: boolean;
  stats: boolean;
}

interface FormattedCompensation {
  assignationId: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  missionId: string;
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

interface Stats {
  total: number;
  pending: number;
  paid: number;
  unpaid: number;
  totalAmount: number;
}

const useTresoData = (status: string = 'unpaid') => {
  const [compensations, setCompensations] = useState<FormattedCompensation[]>([]);
  const [isLoading, setIsLoading] = useState<LoadingState>({
    compensations: true,
    stats: true,
  });
  const [alert, setAlert] = useState<Alert>({ isOpen: false, type: "info", message: "" });
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, paid: 0, unpaid: 0, totalAmount: 0 });
  const [selectedAssignationId, setSelectedAssignationId] = useState<string | null>(null);
  const [showDetailsCompensation, setShowDetailsCompensation] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalEntries, setTotalEntries] = useState(0);

  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = userData?.userId || "";

  const { data: compensationsResponse, isLoading: compensationsLoading } = useCompensationsByStatus(status);
  const { data: totalNotPaidResponse, isLoading: totalLoading } = useTotalNotPaid();

  useEffect(() => {
    setIsLoading((prev) => ({ ...prev, compensations: compensationsLoading }));
    if (compensationsResponse) {
      if (!compensationsResponse.data || !Array.isArray(compensationsResponse.data)) {
        console.warn("La réponse ne contient pas un tableau de résultats:", compensationsResponse);
        setCompensations([]);
        setTotalEntries(0);
        setStats({ total: 0, pending: 0, paid: 0, unpaid: 0, totalAmount: 0 });
        setAlert({
          isOpen: true,
          type: "error",
          message: "La réponse de l'API ne contient pas de résultats valides.",
        });
        return;
      }

      // Group by assignationId
      const grouped = compensationsResponse.data.reduce((acc: { [key: string]: any }, { assignation, compensations: comps }) => {
        const key = assignation.assignationId;
        const employee = assignation.employee || {};
        const mission = assignation.mission || {};
        const transport = assignation.transport || {};
        const lieu = mission.lieu || {};

        const compStatus = comps[0]?.status || status;

        if (!acc[key]) {
          acc[key] = {
            assignationId: assignation.assignationId || "N/A",
            employeeId: assignation.employeeId || "N/A",
            employeeName: `${employee.lastName || "Inconnu"} ${employee.firstName || ""}`.trim(),
            employeeCode: employee.employeeCode || "N/A",
            missionId: assignation.missionId || "N/A",
            missionName: mission.name || "Mission sans nom",
            missionType: mission.missionType || "Non spécifié",
            transportType: transport.type || "Non spécifié",
            lieuName: lieu.nom || "Non spécifié",
            departureDate: assignation.departureDate || "Non spécifié",
            returnDate: assignation.returnDate || "Non spécifié",
            duration: assignation.duration || 0,
            totalAmount: 0,
            status: compStatus,
            paymentDate: null,
            createdAt: assignation.createdAt || new Date().toISOString(),
            updatedAt: assignation.updatedAt || null,
            isValidated: assignation.isValidated,
            allocatedFund: assignation.allocatedFund || 0,
          };
        }

        let minPaymentDate: string | null = acc[key].paymentDate;
        let totalSum = acc[key].totalAmount;

        comps.forEach((compensation: Compensation) => {
          const compTotal = (
            (compensation.transportAmount || 0) +
            (compensation.breakfastAmount || 0) +
            (compensation.lunchAmount || 0) +
            (compensation.dinnerAmount || 0) +
            (compensation.accommodationAmount || 0)
          );

          totalSum += compTotal;

          if (compensation.paymentDate) {
            const compDate = new Date(compensation.paymentDate).getTime();
            const currentMin = minPaymentDate ? new Date(minPaymentDate).getTime() : Infinity;
            if (compDate < currentMin) {
              minPaymentDate = compensation.paymentDate;
            }
          }
        });

        acc[key].totalAmount = totalSum;
        acc[key].paymentDate = minPaymentDate;

        return acc;
      }, {});

      const formattedCompensations: FormattedCompensation[] = Object.values(grouped);

      const total = formattedCompensations.length;
      const pending = formattedCompensations.filter(c => c.status === "pending").length;
      const paid = formattedCompensations.filter(c => c.status === "paid").length;
      const unpaid = formattedCompensations.filter(c => c.status === "unpaid").length;

      setCompensations(formattedCompensations);
      setTotalEntries(total);
      setStats({ total, pending, paid, unpaid, totalAmount: stats.totalAmount });
    }
  }, [compensationsResponse, compensationsLoading, stats.totalAmount, status]);

  useEffect(() => {
    setIsLoading((prev) => ({ ...prev, stats: totalLoading }));
    if (totalNotPaidResponse) {
      setStats((prev) => ({ ...prev, totalAmount: totalNotPaidResponse.data?.totalNotPaidAmount || 0 }));
    }
  }, [totalNotPaidResponse, totalLoading]);

  useEffect(() => {
    if (!userId) {
      console.warn("No userId found, skipping compensation fetch");
      setAlert({
        isOpen: true,
        type: "error",
        message: "Utilisateur non connecté. Veuillez vous connecter pour voir les compensations.",
      });
      setIsLoading({ compensations: false, stats: false });
      setCompensations([]);
      setTotalEntries(0);
      setStats({ total: 0, pending: 0, paid: 0, unpaid: 0, totalAmount: 0 });
    }
  }, [userId]);

  const formatDate = useCallback((dateString?: string | null): string => {
    if (!dateString) return "Date non spécifiée";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }, []);

  const getDaysUntilDue = useCallback((dueDate?: string | null): number => {
    if (!dueDate) return 0;
    const today = new Date("2025-10-24T00:00:00");
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, []);

  const getTotalAmountByStatus = useCallback((status: string): number => {
    return compensations
      .filter((c) => c.status === status)
      .reduce((sum, c) => sum + c.totalAmount, 0);
  }, [compensations]);

  const handleCardClick = useCallback((assignationId: string) => {
    if (assignationId) {
      setSelectedAssignationId(assignationId);
      setShowDetailsCompensation(true);
      setAlert({ isOpen: false, type: "info", message: "" });
    } else {
      console.warn("Invalid assignationId clicked:", assignationId);
      setAlert({
        isOpen: true,
        type: "error",
        message: "ID d'assignation invalide.",
      });
    }
  }, [setAlert]);

  const handlePageChange = useCallback((newPage: number) => {
    const maxPage = Math.ceil(totalEntries / pageSize);
    if (newPage >= 1 && newPage <= maxPage) {
      setCurrentPage(newPage);
    }
  }, [totalEntries, pageSize]);

  const handlePageSizeChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = Number(event.target.value);
    if (newPageSize > 0 && Number.isInteger(newPageSize)) {
      setPageSize(newPageSize);
      setCurrentPage(1);
    }
  }, []);

  return {
    compensations,
    isLoading,
    alert,
    setAlert,
    stats,
    selectedAssignationId,
    showDetailsCompensation,
    setShowDetailsCompensation,
    currentPage,
    pageSize,
    totalEntries,
    handlePageChange,
    handlePageSizeChange,
    handleCardClick,
    formatDate,
    getDaysUntilDue,
    getTotalAmountByStatus,
  };
};

export default useTresoData;
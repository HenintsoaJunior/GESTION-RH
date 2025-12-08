"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from "lucide-react";
import { useCompensationsByStatus, useUpdateStatus } from "@/api/mission/compensation(indemnité)/services";
import type { Compensation } from "@/api/mission/compensation(indemnité)/services";
import AlertComponent from "@/components/alert";
import { useGetAllEmployeesSimple, type Employee } from "@/api/collaborator/services";
import CompensationFilters from "./compensation-filters";
import CompensationMissionCards from "./compensation-mission-cards";
import type {
    Filter,
    AppliedFilters,
    Suggestions,
    LoadingState,
    FormattedCompensation,
} from "./types";

const CompensationMission: React.FC = () => {
    const navigate = useNavigate();

    // États pour les filtres
    const [filters, setFilters] = useState<Filter>({
        employeeId: "",
        employeeName: "",
        employeeMatricule: "",
        status: "",
        validationDateFrom: "",
        validationDateTo: "",
        requestDateFrom: "",
        requestDateTo: "",
    });

    const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>({
        employeeId: "",
        employeeName: "",
        status: "",
        missionType: "",
        employeeMatricule: "",
        validationDateFrom: "",
        validationDateTo: "",
        requestDateFrom: "",
        requestDateTo: "",
    });

    const [suggestions, setSuggestions] = useState<Suggestions>({
        beneficiary: [],
    });

    const [isHidden, setIsHidden] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [compensations, setCompensations] = useState<FormattedCompensation[]>([]);
    const [totalEntries, setTotalEntries] = useState(0);
    const [isLoading, setIsLoading] = useState<LoadingState>({
        compensations: true,
        employees: false,
        stats: false,
    });

    const [alert, setAlert] = useState<{
        message: string;
        type: "success" | "error" | "warning" | "info";
        isOpen: boolean;
    }>({ message: "", type: "info", isOpen: false });

    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = userData?.userId || "";
    
    const apiFilters = useMemo(() => ({
        employeeId: appliedFilters.employeeId || undefined,
        employeeMatricule: appliedFilters.employeeMatricule || undefined,
        status: appliedFilters.status || undefined,
        requestDateFrom: appliedFilters.requestDateFrom || undefined,
        requestDateTo: appliedFilters.requestDateTo || undefined,
        validationDateFrom: appliedFilters.validationDateFrom || undefined,
        validationDateTo: appliedFilters.validationDateTo || undefined,
    }), [
        appliedFilters.employeeId,
        appliedFilters.employeeMatricule,
        appliedFilters.status,
        appliedFilters.requestDateFrom,
        appliedFilters.requestDateTo,
        appliedFilters.validationDateFrom,
        appliedFilters.validationDateTo,
    ]);

    const { data: compensationsResponse, isLoading: compensationsLoading } = 
        useCompensationsByStatus(currentPage, pageSize, apiFilters);
    
    const { mutate: updateStatus } = useUpdateStatus();
    const { data: employeesData, isLoading: employeesLoading } = useGetAllEmployeesSimple();

    useEffect(() => {
        setIsLoading((prev) => ({ ...prev, employees: employeesLoading }));

        if (employeesData) {
            let employeesArray: Employee[] = [];
            
            if (employeesData.data && Array.isArray(employeesData.data)) {
                employeesArray = employeesData.data as Employee[];
            } else if (Array.isArray(employeesData)) {
                employeesArray = employeesData as Employee[];
            }

            if (employeesArray.length > 0) {
                const newSuggestions = employeesArray.map((emp) => {
                    let matricule = "";
                    const matriculeProps = ['matricule', 'employeeCode', 'code', 'registrationNumber', 'badgeNumber', 'employeeId'];
                    
                    for (const prop of matriculeProps) {
                        if (emp[prop as keyof Employee]) {
                            matricule = String(emp[prop as keyof Employee]);
                            break;
                        }
                    }
                    
                    const fullName = `${emp.firstName || ""} ${emp.lastName || "Inconnu"}`.trim();
                    // Créer aussi le nom inversé pour la comparaison
                    const invertedName = `${emp.lastName || "Inconnu"} ${emp.firstName || ""}`.trim();
                    
                    const suggestion = {
                        id: emp.employeeId || matricule || "N/A",
                        name: fullName,
                        invertedName: invertedName, // Ajout du nom inversé
                        displayName: matricule ? `${fullName} (${matricule})` : fullName,
                        acronym: emp.direction?.acronym || emp.department?.departmentName || "N/A",
                        matricule: matricule,
                    };
                    
                    return suggestion;
                });
                setSuggestions({
                    beneficiary: newSuggestions,
                });
            }
        }
    }, [employeesData, employeesLoading]);

    useEffect(() => {
        
        if (compensationsResponse && userId) {
            
            if (!compensationsResponse.data?.items || !Array.isArray(compensationsResponse.data.items)) {
                setCompensations([]);
                setTotalEntries(0);
                return;
            }

            const formattedCompensations: FormattedCompensation[] = compensationsResponse.data.items.map((item) => {
                const { mission, compensations: comps } = item;
                const employee = mission.employee || {};
                const lieu = mission.lieu || {};
                const compStatus = comps[0]?.status || "unpaid";

                
                let totalAmount = 0;
                let minPaymentDate: string | null = null;

                comps.forEach((compensation: Compensation) => {
                    const compTotal = (
                        (compensation.transportAmount || 0) +
                        (compensation.breakfastAmount || 0) +
                        (compensation.lunchAmount || 0) +
                        (compensation.dinnerAmount || 0) +
                        (compensation.accommodationAmount || 0) +
                        (compensation.communicationAmount || 0) +
                        (compensation.visaAmount || 0) +
                        (compensation.medicalExpensesAmount || 0) +
                        (compensation.taxesAmount || 0)
                    );
                    totalAmount += compTotal;
        
                    if (compensation.paymentDate) {
                        const compDate = new Date(compensation.paymentDate).getTime();
                        const currentMin = minPaymentDate ? new Date(minPaymentDate).getTime() : Infinity;
                        if (compDate < currentMin) {
                            minPaymentDate = compensation.paymentDate;
                        }
                    }
                });

                const missionTypeValue = mission.missionType || 1;
                const missionTypeString = missionTypeValue === 1 ? "National" : "International";

                const formattedComp = {
                    id: mission.missionId || "N/A",
                    missionId: mission.missionId || "N/A",
                    employeeId: mission.employeeId || "N/A",
                    employeeName: `${employee.lastName || "Inconnu"} ${employee.firstName || ""}`.trim(),
                    employeeCode: employee.employeeCode || "N/A",
                    missionName: mission.name || "Mission sans nom",
                    missionType: missionTypeString,
                    transportType: mission.transport?.type || "N/A",
                    lieuName: lieu.nom || "Non spécifié",
                    departureDate: mission.departureDate || "Non spécifié",
                    returnDate: mission.returnDate || "Non spécifié",
                    duration: mission.duration || 0,
                    totalAmount: totalAmount,
                    status: compStatus,
                    paymentDate: minPaymentDate,
                    createdAt: mission.createdAt || new Date().toISOString(),
                    updatedAt: mission.updatedAt || null,
                    isValidated: !!mission.isValidated,
                    allocatedFund: mission.allocatedFund || 0,
                };
                
                return formattedComp;
            });

            
            setCompensations(formattedCompensations);
            setTotalEntries(compensationsResponse.data.totalCount || 0);
        } else {
            console.log('❌ compensationsResponse ou userId manquant');
        }
    }, [compensationsResponse, userId]);

    useEffect(() => {
        setIsLoading((prev) => ({
            ...prev,
            compensations: compensationsLoading,
        }));
    }, [compensationsLoading]);

    // Fonction pour normaliser les noms pour la comparaison
    const normalizeNameForComparison = useCallback((name: string): string[] => {
        if (!name) return [''];
        
        // Enlever le matricule entre parenthèses
        const nameWithoutMatricule = name.replace(/\(.*\)/, '').trim();
        
        // Mettre en minuscule et normaliser les espaces
        const normalized = nameWithoutMatricule.toLowerCase().replace(/\s+/g, ' ');
        
        // Séparer les mots
        const words = normalized.split(' ');
        
        // Générer toutes les combinaisons possibles d'ordre des mots
        const combinations: string[] = [normalized];
        
        if (words.length >= 2) {
            // Inverser l'ordre : "prénom nom" -> "nom prénom"
            combinations.push(`${words[words.length - 1]} ${words.slice(0, -1).join(' ')}`);
            
            // Première version : premier mot à la fin
            combinations.push(`${words.slice(1).join(' ')} ${words[0]}`);
            
            // Pour les noms composés : essayer différentes combinaisons
            if (words.length > 2) {
                // Prendre le dernier mot comme nom de famille, le reste comme prénom
                combinations.push(`${words[words.length - 1]} ${words.slice(0, words.length - 1).join(' ')}`);
                
                // Prendre le premier mot comme nom de famille, le reste comme prénom
                combinations.push(`${words[0]} ${words.slice(1).join(' ')}`);
            }
        }
        
        // Retirer les doublons
        return Array.from(new Set(combinations.filter(c => c.trim() !== '')));
    }, []);

    const handleFilterSubmit = () => {
        
        let updatedFilters: AppliedFilters = { 
            ...appliedFilters,
            employeeId: filters.employeeId,
            employeeName: filters.employeeName,
            employeeMatricule: filters.employeeMatricule,
            status: filters.status,
            validationDateFrom: filters.validationDateFrom,
            validationDateTo: filters.validationDateTo,
            requestDateFrom: filters.requestDateFrom,
            requestDateTo: filters.requestDateTo,
        };
        
        if (filters.employeeMatricule) {
            const selectedEmployee = suggestions.beneficiary.find(
                (emp) => emp.matricule === filters.employeeMatricule
            );
            
            if (selectedEmployee) {
                updatedFilters.employeeId = selectedEmployee.id;
                // Utiliser le nom inversé pour correspondre au format des données
                updatedFilters.employeeName = selectedEmployee.invertedName || selectedEmployee.name;
            } else {
                updatedFilters.employeeId = "";
                updatedFilters.employeeName = "";
            }
        }
        
        if (filters.employeeName && !filters.employeeId) {
            const selectedEmployee = suggestions.beneficiary.find(
                (emp) => emp.name === filters.employeeName || emp.invertedName === filters.employeeName
            );
            
            if (selectedEmployee) {
                updatedFilters.employeeId = selectedEmployee.id;
                updatedFilters.employeeMatricule = selectedEmployee.matricule || "";
                // Utiliser le nom inversé pour correspondre au format des données
                updatedFilters.employeeName = selectedEmployee.invertedName || selectedEmployee.name;
            } else {
                updatedFilters.employeeId = "";
                updatedFilters.employeeMatricule = "";
            }
        }
        
        setAppliedFilters(updatedFilters);
        setCurrentPage(1);
    };

    const handleResetFilters = () => {
        const resetFilters: Filter = {
            employeeId: "",
            employeeName: "",
            employeeMatricule: "",
            status: "",
            validationDateFrom: "",
            validationDateTo: "",
            requestDateFrom: "",
            requestDateTo: "",
        };
        
        const resetAppliedFilters: AppliedFilters = {
            employeeId: "",
            employeeName: "",
            status: "",
            missionType: "",
            employeeMatricule: "",
            validationDateFrom: "",
            validationDateTo: "",
            requestDateFrom: "",
            requestDateTo: "",
        };
        
        setFilters(resetFilters);
        setAppliedFilters(resetAppliedFilters);
        setCurrentPage(1);
    };

    // Autres handlers
    const handlePageChange = useCallback((newPage: number) => {
        setCurrentPage(newPage);
    }, []);

    const handlePageSizeChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
        const newPageSize = Number(event.target.value);
        if (newPageSize > 0 && Number.isInteger(newPageSize)) {
            setPageSize(newPageSize);
            setCurrentPage(1);
        }
    }, []);

    const handleRowClick = useCallback((compensationId: string) => {
        navigate(`/mission/collaborateur/${compensationId}`);
    }, [navigate]);

    const handleAction = useCallback(async (compensationId: string, employeeId: string, action: 'pay') => {
        if (action === 'pay') {
            updateStatus(
                {
                    employeeId: employeeId,
                    missionId: compensationId,
                    status: "paid",
                },
                {
                    onSuccess: () => {
                        setAlert({
                            message: "Paiement confirmé avec succès !",
                            type: "success",
                            isOpen: true,
                        });
                        setCurrentPage(1);
                    },
                    onError: (error) => {
                        console.error("Erreur lors de la mise à jour du statut:", error);
                        setAlert({
                            message: "Erreur lors de la confirmation du paiement.",
                            type: "error",
                            isOpen: true,
                        });
                    },
                }
            );
        }
    }, [updateStatus]);

    const handleAlertClose = useCallback(() => {
        setAlert({ message: "", type: "info", isOpen: false });
    }, []);

    const formatDate = useCallback((dateString?: string | null): string => {
        if (!dateString) return "Date non spécifiée";
        try {
            return new Date(dateString).toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });
        } catch (error) {
            console.error("Erreur de formatage de date:", error, dateString);
            return "Date invalide";
        }
    }, []);

    const getDaysUntilDue = useCallback((dueDate?: string | null): number => {
        if (!dueDate) return 0;
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const due = new Date(dueDate);
            due.setHours(0, 0, 0, 0);
            const diffTime = due.getTime() - today.getTime();
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        } catch (error) {
            console.error("Erreur de calcul des jours restants:", error, dueDate);
            return 0;
        }
    }, []);

    const filteredCompensations = useMemo(() => {
        
        const filtered = compensations.filter((c) => {
            if (appliedFilters.employeeName && appliedFilters.employeeName.trim() !== "") {
                // Normaliser le nom du filtre
                const filterNameCombinations = normalizeNameForComparison(appliedFilters.employeeName);
                
                // Normaliser le nom de l'employé
                const employeeNameCombinations = normalizeNameForComparison(c.employeeName || "");
                
                // Vérifier si une des combinaisons du filtre correspond à une des combinaisons du nom
                const matches = filterNameCombinations.some(filterCombo =>
                    employeeNameCombinations.some(employeeCombo => 
                        employeeCombo.includes(filterCombo) || filterCombo.includes(employeeCombo)
                    )
                );
                
                
                if (!matches) {
                    return false;
                }
            }
            
            return true;
        });
        
        return filtered;
    }, [compensations, appliedFilters.employeeName, normalizeNameForComparison]);

    const paginatedCompensations = useMemo(
        () => {
            return filteredCompensations.slice((currentPage - 1) * pageSize, currentPage * pageSize);
        },
        [filteredCompensations, currentPage, pageSize]
    );

    const handleBack = useCallback(() => {
        navigate("/treasury");
    }, [navigate]);

    return (
        <>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 'var(--spacing-lg)',
                padding: 'var(--spacing-md)',
                backgroundColor: 'var(--bg-primary)',
                borderRadius: 'var(--border-radius)',
                border: '1px solid var(--border-color)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                    <button
                        onClick={handleBack}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--bg-light)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-light)'}
                        title="Retour aux missions"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 style={{
                            fontSize: '1.5rem',
                            fontWeight: '600',
                            margin: 0,
                            color: 'var(--text-color)',
                        }}>
                            Indemnités
                        </h1>
                        <p style={{
                            fontSize: '0.875rem',
                            margin: 0,
                            color: 'var(--text-secondary)',
                        }}>
                            Gestion des indemnités
                        </p>
                    </div>
                </div>
            </div>

            {/* Composant de filtres */}
            <CompensationFilters
                isHidden={isHidden}
                setIsHidden={setIsHidden}
                filters={filters}
                setFilters={setFilters}
                suggestions={suggestions}
                isLoading={isLoading}
                handleFilterSubmit={handleFilterSubmit}
                handleResetFilters={handleResetFilters}
            />

            {/* Cartes de compensation */}
            <CompensationMissionCards
                compensations={paginatedCompensations}
                isLoading={isLoading}
                handleRowClick={handleRowClick}
                handleAction={handleAction}
                formatDate={formatDate}
                getDaysUntilDue={getDaysUntilDue}
                currentPage={currentPage}
                pageSize={pageSize}
                totalEntries={totalEntries}
                handlePageChange={handlePageChange}
                handlePageSizeChange={handlePageSizeChange}
                appliedFilters={appliedFilters}
            />

            {/* Toast Alert Component */}
            <AlertComponent
                type={alert.type}
                message={alert.message}
                isOpen={alert.isOpen}
                onClose={handleAlertClose}
            />
        </>
    );
};

export default CompensationMission;
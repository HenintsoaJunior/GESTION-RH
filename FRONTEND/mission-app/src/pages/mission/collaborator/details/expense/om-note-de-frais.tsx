/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import styled from "styled-components";
import type { ExpenseReportType } from "@/api/mission/expense/services";
import { useAllExpenseReportTypes } from "@/api/mission/expense/services";
import ExpenseReportStep from "./step/expense-report-step";
import ExpenseReportList from "./step/expense-report-list";
import { ClipboardList, Plus } from "lucide-react";

// --- Variables de Couleur (Rappel) ---
// --primary-color: #69b42e;
// --primary-hover: #5a9625;

// --- Styles ---

const Container = styled.div`
    padding: var(--spacing-md);
    background: var(--background-light, #f8f9fa);
    border-radius: var(--border-radius, 8px);
    border: 1px solid var(--border-light, #e0e0e0);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const SectionTitle = styled.h3`
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--text-primary, #333);
    margin-bottom: var(--spacing-sm);
    border-bottom: 2px solid var(--border-light, #e0e0e0);
    padding-bottom: 8px;
`;

const LoadingContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: var(--spacing-lg);
`;

// STYLES MISE À JOUR AVEC VOS COULEURS PERSONNALISÉES
const SegmentedControl = styled.div`
    display: flex;
    /* Utilisation d'une bordure de couleur primaire plus douce */
    border: 1px solid var(--primary-color, #69b42e);
    border-radius: 20px;
    overflow: hidden;
    width: fit-content;
    margin-bottom: var(--spacing-lg);
    background: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SegmentedButton = styled.button<{ $active: boolean }>`
    padding: 10px 20px;
    border: none;
    outline: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1rem;
    font-weight: 600;
    transition: all 0.25s ease-in-out;
    white-space: nowrap;

    /* Styles pour le bouton actif (sélectionné) */
    /* Utilise la --primary-color pour le fond actif */
    background: ${(props) => (props.$active ? "var(--primary-color, #69b42e)" : "transparent")};
    color: ${(props) => (props.$active ? "white" : "var(--text-secondary, #555)")};

    &:not(:last-child) {
        /* La bordure utilise également la couleur primaire */
        border-right: ${(props) => (props.$active ? "none" : "1px solid var(--primary-color, #69b42e)")};
    }

    /* Effet au survol (hover) pour les boutons non actifs */
    &:not([data-active]) {
        &:hover {
            /* Utilise le --primary-hover pour le fond au survol */
            background: var(--primary-hover, #5a9625);
            color: white; /* Le texte devient blanc au survol pour le contraste */

            & > svg {
                color: white; /* L'icône devient blanche au survol */
            }
        }
    }

    /* Style de l'icône */
    & > svg {
        /* L'icône inactive utilise la couleur primaire, l'icône active est blanche */
        color: ${(props) => (props.$active ? "white" : "var(--primary-color, #69b42e)")};
        transition: color 0.25s;
    }
`;
// --- Fin Nouveaux Styles ---

// Fonction utilitaire pour formater les dates
const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "2-digit",
    });
};

interface OMNoteDeFraisProps {
    selectedAssignmentId?: string;
    onBack?: () => void;
}

const OMNoteDeFrais: React.FC<OMNoteDeFraisProps> = ({ selectedAssignmentId, onBack }) => {
    // États du formulaire
    const [formData, setFormData] = useState({
        assignationId: selectedAssignmentId || "",
        userId: "",
        expenseLinesByType: {} as Record<string, any[]>,
        attachments: [] as any[],
    });
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // États pour les types de notes de frais
    const [expenseReportTypes, setExpenseReportTypes] = useState<ExpenseReportType[]>([]);
    const [isLoadingTypes, setIsLoadingTypes] = useState(true);
    const [hasErrorLoadingTypes, setHasErrorLoadingTypes] = useState(false);

    // État pour gérer l'affichage (formulaire ou liste)
    // 💡 Affichage par défaut sur "list" (Liste des Paiements)
    const [viewMode, setViewMode] = useState<"list" | "form">("list");

    // Récupération des types de notes de frais
    const { data: expenseReportTypesData, isLoading: loadingTypes, error: typesError } = useAllExpenseReportTypes();

    useEffect(() => {
        setIsLoadingTypes(loadingTypes);
        if (typesError) {
            setHasErrorLoadingTypes(true);
        } else if (expenseReportTypesData?.data) {
            setHasErrorLoadingTypes(false);
            setExpenseReportTypes(expenseReportTypesData.data.data || []);
        }
    }, [loadingTypes, typesError, expenseReportTypesData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (value) {
            setFieldErrors((prev) => ({ ...prev, [name]: [] }));
        }
    };

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulation d'une soumission
        setTimeout(() => {
            setIsSubmitting(false);
            setFormData({
                assignationId: selectedAssignmentId || "",
                userId: "",
                expenseLinesByType: {} as Record<string, any[]>,
                attachments: [] as any[],
            });
        }, 1000);
    };

    const handleError = (error: Error) => {
        console.error(error);
    };

    // Affichage conditionnel pour le chargement ou erreur
    if (isLoadingTypes) {
        return (
            <Container>
                <SectionTitle>{viewMode === "form" ? "Ajouter une Note de Frais" : "Liste des Paiements"}</SectionTitle>
                <LoadingContainer>
                    <p style={{ marginLeft: "10px" }}>Chargement des types de notes de frais...</p>
                </LoadingContainer>
            </Container>
        );
    }

    if (hasErrorLoadingTypes || expenseReportTypes.length === 0) {
        return (
            <Container>
                <SectionTitle>{viewMode === "form" ? "Ajouter une Note de Frais" : "Liste des Paiements"}</SectionTitle>
                <p style={{ color: "var(--danger-color, #dc3545)", textAlign: "center", padding: "var(--spacing-md)" }}>
                    ⚠️ Une erreur est survenue lors du chargement des types de notes de frais ou aucune donnée n'est disponible.
                </p>
            </Container>
        );
    }

    // Rendu principal
    return (
        <Container>
            {/* Segmented Control avec les nouveaux labels et icônes */}
            <SegmentedControl>
                <SegmentedButton $active={viewMode === "list"} onClick={() => setViewMode("list")}>
                    <ClipboardList size={16} /> Paiements
                </SegmentedButton>
                <SegmentedButton $active={viewMode === "form"} onClick={() => setViewMode("form")}>
                    <Plus size={16} /> Note de Frais
                </SegmentedButton>
            </SegmentedControl>

            {viewMode === "form" ? (
                <>
                    <SectionTitle>Ajouter une Nouvelle Note de Frais</SectionTitle>
                    <form onSubmit={handleFormSubmit}>
                        <ExpenseReportStep
                            formData={formData}
                            fieldErrors={fieldErrors}
                            isSubmitting={isSubmitting}
                            handleInputChange={handleInputChange}
                            expenseReportTypes={expenseReportTypes}
                        />
                    </form>
                </>
            ) : (
                <>
                    <SectionTitle>Liste des Paiements Associés</SectionTitle>
                    <ExpenseReportList
                        selectedAssignmentId={selectedAssignmentId}
                        onBack={onBack || (() => {})}
                        isLoading={false}
                        formatDate={formatDate}
                        onError={handleError}
                    />
                </>
            )}
        </Container>
    );
};

export default OMNoteDeFrais;
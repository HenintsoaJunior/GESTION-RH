import React, { useState } from "react";
import {
    FiltersContainer,
    FiltersHeader,
    FiltersTitle,
    FiltersControls,
    FilterControlButton,
    FiltersSection,
    FormTableSearch,
    FormRow,
    FormFieldCell,
    FormLabelSearch,
    FormInputSearch,
    FiltersActions,
    ButtonReset,
    ButtonSearch,
    FiltersToggle,
    ButtonShowFilters,
    StyledAutoCompleteInput,
} from "@/styles/table-styles";
import {
    ChevronDown,
    ChevronUp,
    X,
    List,
} from "lucide-react";
import type { Filter, LoadingState } from "./types/reimbursement";

interface RemboursementFiltersProps {
    isHidden: boolean;
    setIsHidden: React.Dispatch<React.SetStateAction<boolean>>;
    filters: Filter;
    setFilters: React.Dispatch<React.SetStateAction<Filter>>;
    isLoading: LoadingState;
    handleFilterSubmit: () => void;
    handleResetFilters: () => void;
    filteredEmployeeSuggestions: string[];
    missionTypes: string[];
    handleEmployeeChange: (value: string) => void;
    handleMissionTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    handlePaymentDateMinChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handlePaymentDateMaxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleEmployeeCodeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ReimbursementFilters: React.FC<RemboursementFiltersProps> = ({
    isHidden,
    setIsHidden,
    filters,
    setFilters,
    isLoading,
    handleFilterSubmit,
    handleResetFilters,
    filteredEmployeeSuggestions,
    missionTypes,
    handleEmployeeChange,
    handleMissionTypeChange,
    handlePaymentDateMinChange,
    handlePaymentDateMaxChange,
    handleEmployeeCodeChange,
}) => {
    const [isMinimized, setIsMinimized] = useState<boolean>(false);

    const handleFilterChange = (name: keyof Filter, value: string) => {
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const toggleMinimize = () => setIsMinimized((prev) => !prev);
    const toggleHide = () => setIsHidden((prev) => !prev);

    const isFilterEmpty = (): boolean => {
        return Object.values(filters).every((val) => (val || "").toString().trim() === "");
    };

    return (
        <>
            {!isHidden && (
                <FiltersContainer $isMinimized={isMinimized}>
                    <FiltersHeader>
                        <FiltersTitle>Filtres de Recherche</FiltersTitle>
                        <FiltersControls>
                            <FilterControlButton
                                $isMinimized={isMinimized}
                                onClick={toggleMinimize}
                                title={isMinimized ? "Développer" : "Réduire"}
                            >
                                {isMinimized ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                            </FilterControlButton>
                            <FilterControlButton $isClose onClick={toggleHide} title="Fermer">
                                <X size={16} />
                            </FilterControlButton>
                        </FiltersControls>
                    </FiltersHeader>
                    {!isMinimized && (
                        <FiltersSection>
                            <form
                                onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                                    e.preventDefault();
                                    handleFilterSubmit();
                                }}
                            >
                                <FormTableSearch>
                                    <tbody>
                                        <FormRow>
                                            <FormFieldCell>
                                                <FormLabelSearch>Collaborateur</FormLabelSearch>
                                                <StyledAutoCompleteInput
                                                    value={filters.employeeSearch || ""}
                                                    onChange={handleEmployeeChange}
                                                    suggestions={filteredEmployeeSuggestions}
                                                    maxVisibleItems={5}
                                                    placeholder="Sélectionner un employé..."
                                                    disabled={isLoading.employees || isLoading.remboursements}
                                                    fieldType="employee"
                                                    fieldLabel="employé"
                                                    showAddOption={false}
                                                />
                                            </FormFieldCell>
                                            <FormFieldCell>
                                                <FormLabelSearch>Matricule</FormLabelSearch>
                                                <FormInputSearch
                                                    type="text"
                                                    placeholder="Rechercher par matricule..."
                                                    value={filters.employeeCode || ""}
                                                    onChange={handleEmployeeCodeChange}
                                                    disabled={isLoading.remboursements}
                                                />
                                            </FormFieldCell>
                                            <FormFieldCell>
                                                <FormLabelSearch>Statut</FormLabelSearch>
                                                <FormInputSearch
                                                    as="select"
                                                    name="status"
                                                    value={filters.status}
                                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange("status", e.target.value)}
                                                    disabled={isLoading.remboursements}
                                                >
                                                    <option value="">Tous</option>
                                                    <option value="notreimbursed">Non remboursé</option>
                                                    <option value="reimbursed">Remboursé</option>
                                                </FormInputSearch>
                                            </FormFieldCell>
                                        </FormRow>
                                        
                                        <FormRow>
                                            <FormFieldCell>
                                                <FormLabelSearch>Type de mission</FormLabelSearch>
                                                <FormInputSearch
                                                    as="select"
                                                    value={filters.missionType}
                                                    onChange={handleMissionTypeChange}
                                                    disabled={isLoading.remboursements}
                                                >
                                                    <option value="">Tous</option>
                                                    {missionTypes.map((type) => (
                                                        <option key={type} value={type}>{type}</option>
                                                    ))}
                                                </FormInputSearch>
                                            </FormFieldCell>
                                            <FormFieldCell colSpan={2}>
                                                <fieldset style={{ 
                                                    display: "grid", 
                                                    gridTemplateColumns: "1fr 1fr", 
                                                    gap: "var(--spacing-md)",
                                                    background: "var(--bg-primary, #ffffff)",
                                                    padding: "var(--spacing-md)",
                                                    border: "1px solid var(--border-color, #ddd)",
                                                    borderRadius: "var(--border-radius, 4px)",
                                                    margin: "0"
                                                }}>
                                                    <legend style={{ 
                                                        fontWeight: "var(--font-weight-semibold)",
                                                        color: "var(--text-color)",
                                                        padding: "0 var(--spacing-sm)",
                                                        fontSize: "0.75rem"
                                                    }}>
                                                        Date de Remboursement
                                                    </legend>
                                                    <div>
                                                        <FormLabelSearch>Du</FormLabelSearch>
                                                        <FormInputSearch
                                                            type="date"
                                                            value={filters.paymentDateMin}
                                                            onChange={handlePaymentDateMinChange}
                                                            disabled={isLoading.remboursements}
                                                        />
                                                    </div>
                                                    <div>
                                                        <FormLabelSearch>Au</FormLabelSearch>
                                                        <FormInputSearch
                                                            type="date"
                                                            value={filters.paymentDateMax}
                                                            onChange={handlePaymentDateMaxChange}
                                                            disabled={isLoading.remboursements}
                                                        />
                                                    </div>
                                                </fieldset>
                                            </FormFieldCell>
                                        </FormRow>
                                    </tbody>
                                </FormTableSearch>
                                <FiltersActions>
                                    <ButtonReset
                                        type="button"
                                        onClick={handleResetFilters}
                                        disabled={isLoading.remboursements || isFilterEmpty()}
                                    >
                                        Effacer filtres
                                    </ButtonReset>
                                    <ButtonSearch type="submit" disabled={isLoading.remboursements}>
                                        {isLoading.remboursements ? "Recherche..." : "Rechercher"}
                                    </ButtonSearch>
                                </FiltersActions>
                            </form>
                        </FiltersSection>
                    )}
                </FiltersContainer>
            )}
            {isHidden && (
                <FiltersToggle>
                    <ButtonShowFilters type="button" onClick={toggleHide}>
                        <List size={16} style={{ marginRight: "var(--spacing-sm)" }} />
                        Afficher les filtres
                    </ButtonShowFilters>
                </FiltersToggle>
            )}
        </>
    );
};
"use client";

import React, { useState, useMemo } from "react";
import styled from "styled-components";
import {
    ChevronDown,
    ChevronUp,
    X,
    List,
    Filter,
} from "lucide-react";
import {
    FiltersContainer,
    FiltersHeader,
    FiltersTitle,
    FiltersControls,
    FilterControlButton,
    FiltersSection,
    FormLabelSearch,
    FormInputSearch,
    FiltersActions,
    ButtonReset,
    ButtonSearch,
    FiltersToggle,
    ButtonShowFilters,
    Separator,
    FormFieldCell,
    StyledAutoCompleteInput,
} from "@/styles/table-styles";
import type {
    CompensationFiltersProps,
    Filter as FilterType,
} from "./types";

// Composants stylisés pour la grille et les champs de date
const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const DateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Fieldset = styled.fieldset`
  background: var(--bg-primary, #ffffff);
  padding: var(--spacing-md);
  border: 1px solid var(--border-color, #ddd);
  border-radius: var(--border-radius, 4px);
  margin: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const Legend = styled.legend`
  font-weight: var(--font-weight-semibold);
  color: var(--text-color);
  padding: 0 var(--spacing-sm);
  font-size: 0.75rem;
  grid-column: 1 / -1;
`;

const DateField = styled.div`
  display: flex;
  flex-direction: column;
`;

const CompensationFilters: React.FC<CompensationFiltersProps> = ({
    isHidden,
    setIsHidden,
    filters,
    setFilters,
    suggestions,
    isLoading,
    handleFilterSubmit,
    handleResetFilters,
}) => {
    const [isMinimized, setIsMinimized] = useState<boolean>(false);
    const [employeeSearch, setEmployeeSearch] = useState<string>("");
    const [matriculeSearch, setMatriculeSearch] = useState<string>("");

    const handleFilterChange = (name: keyof FilterType, value: string) => {
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleEmployeeNameChange = (value: string) => {
        setEmployeeSearch(value);
        const selectedEmployee = suggestions.beneficiary.find(
            (emp) => emp.displayName === value || emp.matricule === value
        );
        
        if (selectedEmployee) {
            setFilters((prev) => ({
                ...prev,
                employeeName: selectedEmployee.displayName,
                employeeId: selectedEmployee.id,
                employeeMatricule: selectedEmployee.matricule || "",
            }));
        } else {
            setFilters((prev) => ({
                ...prev,
                employeeName: value,
                employeeId: "",
                employeeMatricule: "",
            }));
        }
    };

    const handleMatriculeChange = (value: string) => {
        setMatriculeSearch(value);
        const selectedEmployee = suggestions.beneficiary.find(
            (emp) => emp.matricule === value
        );
        
        if (selectedEmployee) {
            setFilters((prev) => ({
                ...prev,
                employeeMatricule: selectedEmployee.matricule || "",
                employeeName: selectedEmployee.displayName,
                employeeId: selectedEmployee.id,
            }));
        } else {
            setFilters((prev) => ({
                ...prev,
                employeeMatricule: value,
                employeeName: "",
                employeeId: "",
            }));
        }
    };

    const isFilterEmpty = (): boolean => {
        return (
            !filters.employeeName &&
            !filters.employeeMatricule &&
            !filters.status &&
            !filters.validationDateFrom &&
            !filters.validationDateTo &&
            !filters.requestDateFrom &&
            !filters.requestDateTo
        );
    };

    // Suggestions pour l'auto-complete du Matricule
    const matriculeSuggestions = useMemo(() =>
        suggestions.beneficiary
            .filter(emp => emp.matricule && emp.matricule.trim() !== "")
            .map(emp => emp.matricule as string)
            .filter((matricule, index, self) => self.indexOf(matricule) === index), // Éliminer les doublons
        [suggestions.beneficiary]
    );

    const filteredMatriculeSuggestions = useMemo(() =>
        matriculeSuggestions.filter(matricule =>
            matricule.toLowerCase().includes(matriculeSearch.toLowerCase())
        ),
        [matriculeSuggestions, matriculeSearch]
    );

    // Suggestions pour l'auto-complete du Collaborateur
    const employeeNameSuggestions = useMemo(() =>
        suggestions.beneficiary.map(emp => emp.displayName),
        [suggestions.beneficiary]
    );

    const filteredEmployeeNameSuggestions = useMemo(() =>
        employeeNameSuggestions.filter(name =>
            name.toLowerCase().includes(employeeSearch.toLowerCase())
        ),
        [employeeNameSuggestions, employeeSearch]
    );

    if (isHidden) {
        return (
            <FiltersToggle>
                <ButtonShowFilters type="button" onClick={() => setIsHidden(false)}>
                    <List size={16} style={{ marginRight: "var(--spacing-sm)" }} />
                    Afficher les filtres
                </ButtonShowFilters>
            </FiltersToggle>
        );
    }

    return (
        <FiltersContainer $isMinimized={isMinimized}>
            <FiltersHeader>
                <FiltersTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Filter size={18} />
                    Filtres avancés
                </FiltersTitle>
                <FiltersControls>
                    <FilterControlButton
                        $isMinimized={isMinimized}
                        onClick={() => setIsMinimized((p) => !p)}
                        title={isMinimized ? "Développer" : "Réduire"}
                    >
                        {isMinimized ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                    </FilterControlButton>
                    <FilterControlButton $isClose onClick={() => setIsHidden(true)} title="Fermer">
                        <X size={16} />
                    </FilterControlButton>
                </FiltersControls>
            </FiltersHeader>

            {!isMinimized && (
                <FiltersSection>
                    <Separator />
                    <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                        e.preventDefault();
                        handleFilterSubmit();
                    }}>
                        <FilterGrid>
                            {/* Matricule - Auto-complete */}
                            <FormFieldCell as="div">
                                <FormLabelSearch>Matricule</FormLabelSearch>
                                <StyledAutoCompleteInput
                                    value={filters.employeeMatricule || ""}
                                    onChange={handleMatriculeChange}
                                    suggestions={filteredMatriculeSuggestions}
                                    maxVisibleItems={5}
                                    placeholder="Rechercher par matricule..."
                                    disabled={isLoading.employees || isLoading.compensations}
                                    fieldType="matricule"
                                    fieldLabel="matricule"
                                    showAddOption={false}
                                />
                            </FormFieldCell>

                            {/* Collaborateur - Auto-complete */}
                            <FormFieldCell as="div">
                                <FormLabelSearch>Collaborateur</FormLabelSearch>
                                <StyledAutoCompleteInput
                                    value={filters.employeeName || ""}
                                    onChange={handleEmployeeNameChange}
                                    suggestions={filteredEmployeeNameSuggestions}
                                    maxVisibleItems={5}
                                    placeholder="Rechercher par nom ou matricule..."
                                    disabled={isLoading.employees || isLoading.compensations}
                                    fieldType="beneficiary"
                                    fieldLabel="collaborateur"
                                    showAddOption={false}
                                />
                            </FormFieldCell>

                            {/* Statut - Select normal */}
                            <FormFieldCell as="div">
                                <FormLabelSearch>Statut</FormLabelSearch>
                                <FormInputSearch
                                    as="select"
                                    value={filters.status}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                                        handleFilterChange("status", e.target.value)
                                    }
                                    disabled={isLoading.compensations}
                                >
                                    <option value="">Tous les statuts</option>
                                    <option value="unpaid">Non payé</option>
                                    <option value="paid">Payé</option>
                                </FormInputSearch>
                            </FormFieldCell>
                        </FilterGrid>

                        <DateGrid>
                            {/* Date de Demande */}
                            <Fieldset>
                                <Legend>
                                    Date de Demande
                                </Legend>
                                <DateField>
                                    <FormLabelSearch>Du</FormLabelSearch>
                                    <FormInputSearch
                                        type="date"
                                        value={filters.requestDateFrom || ""}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                            handleFilterChange("requestDateFrom", e.target.value)
                                        }
                                        disabled={isLoading.compensations}
                                    />
                                </DateField>
                                <DateField>
                                    <FormLabelSearch>Au</FormLabelSearch>
                                    <FormInputSearch
                                        type="date"
                                        value={filters.requestDateTo || ""}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                            handleFilterChange("requestDateTo", e.target.value)
                                        }
                                        disabled={isLoading.compensations}
                                    />
                                </DateField>
                            </Fieldset>
                            
                            {/* Date de Validation */}
                            <Fieldset>
                                <Legend>
                                    Date Validation
                                </Legend>
                                <DateField>
                                    <FormLabelSearch>Du</FormLabelSearch>
                                    <FormInputSearch
                                        type="date"
                                        value={filters.validationDateFrom || ""}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                            handleFilterChange("validationDateFrom", e.target.value)
                                        }
                                        disabled={isLoading.compensations}
                                    />
                                </DateField>
                                <DateField>
                                    <FormLabelSearch>Au</FormLabelSearch>
                                    <FormInputSearch
                                        type="date"
                                        value={filters.validationDateTo || ""}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                            handleFilterChange("validationDateTo", e.target.value)
                                        }
                                        disabled={isLoading.compensations}
                                    />
                                </DateField>
                            </Fieldset>
                        </DateGrid>

                        <Separator />

                        <FiltersActions>
                            <ButtonReset
                                type="button"
                                onClick={() => {
                                    handleResetFilters();
                                    setEmployeeSearch("");
                                    setMatriculeSearch("");
                                }}
                                disabled={isLoading.compensations || isFilterEmpty()}
                            >
                                <X size={16} style={{ marginRight: "var(--spacing-sm)" }} />
                                Effacer filtres
                            </ButtonReset>
                            <ButtonSearch 
                                type="submit" 
                                disabled={isLoading.compensations}
                            >
                                {isLoading.compensations ? "Recherche..." : "Rechercher"}
                            </ButtonSearch>
                        </FiltersActions>
                    </form>
                </FiltersSection>
            )}
        </FiltersContainer>
    );
};

export default CompensationFilters;
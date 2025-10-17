"use client";

import { useState } from "react";
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
  StyledAutoCompleteInput,
  FiltersActions,
  ButtonReset,
  ButtonSearch,
  FiltersToggle,
  ButtonShowFilters,
} from "@/styles/table-styles";
import { X, List, ChevronDown, ChevronUp } from "lucide-react";

// Types from previous context
interface Filter {
  employeeId: string;
  employeeName: string;
  status: string;
}

interface BeneficiarySuggestion {
  id: string;
  name: string;
  displayName: string;
  acronym: string;
}

interface Suggestions {
  beneficiary: BeneficiarySuggestion[];
}

interface LoadingState {
  missions: boolean;
  comments: boolean;
  employees: boolean;
  stats: boolean;
}

interface MissionFiltersProps {
  isHidden: boolean;
  setIsHidden: React.Dispatch<React.SetStateAction<boolean>>;
  filters: Filter;
  setFilters: React.Dispatch<React.SetStateAction<Filter>>;
  suggestions: Suggestions;
  isLoading: LoadingState;
  handleFilterSubmit: () => void;
  handleResetFilters: () => void;
}

const MissionFilters: React.FC<MissionFiltersProps> = ({
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

  const handleFilterChange = (name: keyof Filter, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const toggleMinimize = () => setIsMinimized((prev) => !prev);
  const toggleHide = () => setIsHidden((prev) => !prev);

  const handleEmployeeNameChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      employeeName: value,
      employeeId: value ? prev.employeeId : "",
    }));
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
                          value={filters.employeeName || ""}
                          onChange={handleEmployeeNameChange}
                          suggestions={suggestions.beneficiary
                            .filter((emp) =>
                              emp.displayName
                                .toLowerCase()
                                .includes((filters.employeeName || "").toLowerCase())
                            )
                            .map((emp) => emp.displayName)}
                          maxVisibleItems={5}
                          placeholder="Rechercher par nom collaborateur..."
                          disabled={isLoading.employees || isLoading.missions}
                          fieldType="beneficiary"
                          fieldLabel="collaborateur"
                          showAddOption={false}
                        />
                      </FormFieldCell>
                      <FormFieldCell>
                        <FormLabelSearch>Statut</FormLabelSearch>
                        <FormInputSearch
                          as="select"
                          name="status"
                          value={filters.status}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange("status", e.target.value)}
                          disabled={isLoading.missions}
                        >
                          <option value="">Tous les statuts</option>
                          <option value="pending">En attente</option>
                          <option value="approved">Validé</option>
                          <option value="rejected">Rejeté</option>
                        </FormInputSearch>
                      </FormFieldCell>
                    </FormRow>
                  </tbody>
                </FormTableSearch>
                <FiltersActions>
                  <ButtonReset
                    type="button"
                    onClick={handleResetFilters}
                    disabled={isLoading.missions}
                  >
                    Réinitialiser
                  </ButtonReset>
                  <ButtonSearch type="submit" disabled={isLoading.missions}>
                    {isLoading.missions ? "Recherche..." : "Rechercher"}
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

export default MissionFilters;
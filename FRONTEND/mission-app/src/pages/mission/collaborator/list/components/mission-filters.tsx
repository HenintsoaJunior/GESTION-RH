import { useState, useMemo, useCallback } from "react";
import styled from "styled-components";
import { 
  ChevronDown, 
  ChevronUp, 
  X, 
  List, 
  Search,
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
  StyledAutoCompleteInput,
  StyledSelect,
  FormInputSearch,
  FiltersActions,
  ButtonReset,
  ButtonSearch,
  FiltersToggle,
  ButtonShowFilters,
  Separator,
  FormFieldCell,
} from "@/styles/table-styles";
import StatusFilter from "@/components/status";

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-md);
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

// Suppression de FilterField puisque nous utilisons FormFieldCell

const DateGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
  
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
  gap: var(--spacing-sm);
  
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

const StatusFilterWrapper = styled.div`
  display: flex;
  flex-direction: column;
  
  // Assure que le composant StatusFilter s'adapte correctement
  & > div {
    width: 100%;
  }
`;

interface CompatibleEmployee {
  employeeId: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
}

interface CompatibleLieu {
  lieuId: string;
  nom: string;
  pays: string;
}

interface FiltersState {
  employeeId: string;
  missionType: string;
  lieuId: string;
  status: string[];
  minStartDate?: string;
  maxStartDate?: string;
  minEndDate?: string;
  maxEndDate?: string;
  selectedEmployee?: CompatibleEmployee | null;
  selectedLieu?: CompatibleLieu | null;
  employeeSearch?: string;
  lieuSearch?: string;
}

interface MissionFiltersProps {
  filters: FiltersState;
  activeTab: string;
  isSearchLoading: boolean;
  employees: CompatibleEmployee[];
  lieux: CompatibleLieu[];
  onFilterSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onResetFilters: () => void;
  onEmployeeChange: (value: string) => void;
  onLieuChange: (value: string) => void;
  onMissionTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onDateChange: (field: string, value: string | string[] | undefined) => void;
}

const MissionFilters: React.FC<MissionFiltersProps> = ({
  filters,
  activeTab,
  isSearchLoading,
  employees,
  lieux,
  onFilterSubmit,
  onResetFilters,
  onEmployeeChange,
  onLieuChange,
  onMissionTypeChange,
  onDateChange,
}) => {
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isHidden, setIsHidden] = useState<boolean>(false);

  const statusOptions = [
    { label: "En attente de validation", value: "pending approval" },
    { label: "Paiement en cours", value: "payment in progress" },
    { label: "Planifié", value: "planned" },
    { label: "En cours d'exécution", value: "in progress" },
    { label: "Terminé", value: "completed" },
    { label: "Clôturé", value: "closed" },
    { label: "Annulé", value: "canceled" },
    { label: "Mission Rejeté", value: "mission rejected" },
  ];

  const missionTypes = ["International", "National"];

  const employeeSuggestions = useMemo(() =>
    employees.map((emp: CompatibleEmployee) => `${emp.firstName} ${emp.lastName}`),
    [employees]
  );

  const filteredEmployeeSuggestions = useMemo(() =>
    employeeSuggestions.filter((sug) =>
      sug.toLowerCase().includes((filters.employeeSearch || "").toLowerCase())
    ),
    [employeeSuggestions, filters.employeeSearch]
  );

  const lieuSuggestions = useMemo(() =>
    lieux.map((lieu: CompatibleLieu) => `${lieu.nom}/${lieu.pays}`),
    [lieux]
  );

  const filteredLieuSuggestions = useMemo(() =>
    lieuSuggestions.filter((sug) =>
      sug.toLowerCase().includes((filters.lieuSearch || "").toLowerCase())
    ),
    [lieuSuggestions, filters.lieuSearch]
  );

  const hasFilters: boolean = useMemo(() => Object.values({ 
    ...filters, 
    selectedEmployee: null, 
    selectedLieu: null,
    employeeSearch: filters.employeeSearch || "",
    lieuSearch: filters.lieuSearch || "",
    minStartDate: filters.minStartDate || "",
    maxStartDate: filters.maxStartDate || "",
    minEndDate: filters.minEndDate || "",
    maxEndDate: filters.maxEndDate || "",
  }).some((val) => {
    if (Array.isArray(val)) {
      return val.length > 0;
    }
    return (val || "").trim() !== "";
  }), [filters]);

  const showEmployeeFilter = activeTab !== 'mes';

  // Handler spécifique pour les statuts
  const handleStatusChange = useCallback((statuses: string[]) => {
    onDateChange('status', statuses);
  }, [onDateChange]);

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
          <form onSubmit={onFilterSubmit}>
            <FilterGrid>
              {showEmployeeFilter ? (
                <>
                  <FormFieldCell as="div">
                    <FormLabelSearch>Collaborateur</FormLabelSearch>
                    <StyledAutoCompleteInput
                      value={filters.employeeSearch || ""}
                      onChange={onEmployeeChange}
                      suggestions={filteredEmployeeSuggestions}
                      maxVisibleItems={5}
                      placeholder="Sélectionner un employé..."
                      disabled={isSearchLoading}
                      fieldType="employee"
                      fieldLabel="employé"
                      showAddOption={false}
                    />
                  </FormFieldCell>
                  <FormFieldCell as="div">
                    <FormLabelSearch>Type de mission</FormLabelSearch>
                    <StyledSelect
                      value={filters.missionType}
                      onChange={onMissionTypeChange}
                      disabled={isSearchLoading}
                    >
                      <option value="">Tous</option>
                      {missionTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </StyledSelect>
                  </FormFieldCell>
                  <FormFieldCell as="div">
                    <FormLabelSearch>Lieu</FormLabelSearch>
                    <StyledAutoCompleteInput
                      value={filters.lieuSearch || ""}
                      onChange={onLieuChange}
                      suggestions={filteredLieuSuggestions}
                      maxVisibleItems={5}
                      placeholder="Sélectionner un lieu..."
                      disabled={isSearchLoading}
                      fieldType="lieu"
                      fieldLabel="lieu"
                      showAddOption={false}
                    />
                  </FormFieldCell>
                  <FormFieldCell as="div">
                    <FormLabelSearch>Statut</FormLabelSearch>
                    <StatusFilterWrapper>
                      <StatusFilter
                        options={statusOptions}
                        selectedStatuses={filters.status}
                        onStatusChange={handleStatusChange}
                      />
                    </StatusFilterWrapper>
                  </FormFieldCell>
                </>
              ) : (
                // Version sans le filtre Collaborateur
                <>
                  <FormFieldCell as="div">
                    <FormLabelSearch>Type de mission</FormLabelSearch>
                    <StyledSelect
                      value={filters.missionType}
                      onChange={onMissionTypeChange}
                      disabled={isSearchLoading}
                    >
                      <option value="">Tous</option>
                      {missionTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </StyledSelect>
                  </FormFieldCell>
                  <FormFieldCell as="div">
                    <FormLabelSearch>Lieu</FormLabelSearch>
                    <StyledAutoCompleteInput
                      value={filters.lieuSearch || ""}
                      onChange={onLieuChange}
                      suggestions={filteredLieuSuggestions}
                      maxVisibleItems={5}
                      placeholder="Sélectionner un lieu..."
                      disabled={isSearchLoading}
                      fieldType="lieu"
                      fieldLabel="lieu"
                      showAddOption={false}
                    />
                  </FormFieldCell>
                  <FormFieldCell as="div" style={{ gridColumn: 'span 2' }}>
                    <FormLabelSearch>Statut</FormLabelSearch>
                    <StatusFilterWrapper>
                      <StatusFilter
                        options={statusOptions}
                        selectedStatuses={filters.status}
                        onStatusChange={handleStatusChange}
                      />
                    </StatusFilterWrapper>
                  </FormFieldCell>
                </>
              )}
            </FilterGrid>

            <DateGrid style={{ marginTop: 'var(--spacing-md)' }}>
              <Fieldset>
                <Legend>
                  Date Début
                </Legend>
                <DateField>
                  <FormLabelSearch>Du</FormLabelSearch>
                  <FormInputSearch
                    type="date"
                    value={filters.minStartDate || ""}
                    onChange={(e) => onDateChange('minStartDate', e.target.value || undefined)}
                    disabled={isSearchLoading}
                  />
                </DateField>
                <DateField>
                  <FormLabelSearch>Au</FormLabelSearch>
                  <FormInputSearch
                    type="date"
                    value={filters.maxStartDate || ""}
                    onChange={(e) => onDateChange('maxStartDate', e.target.value || undefined)}
                    disabled={isSearchLoading}
                  />
                </DateField>
              </Fieldset>
              <Fieldset>
                <Legend>
                  Date Fin
                </Legend>
                <DateField>
                  <FormLabelSearch>Du</FormLabelSearch>
                  <FormInputSearch
                    type="date"
                    value={filters.minEndDate || ""}
                    onChange={(e) => onDateChange('minEndDate', e.target.value || undefined)}
                    disabled={isSearchLoading}
                  />
                </DateField>
                <DateField>
                  <FormLabelSearch>Au</FormLabelSearch>
                  <FormInputSearch
                    type="date"
                    value={filters.maxEndDate || ""}
                    onChange={(e) => onDateChange('maxEndDate', e.target.value || undefined)}
                    disabled={isSearchLoading}
                  />
                </DateField>
              </Fieldset>
            </DateGrid>

            <Separator />

            <FiltersActions>
              <ButtonReset
                type="button"
                onClick={onResetFilters}
                disabled={!hasFilters || isSearchLoading}
                title="Effacer filtre"
              >
                <X size={16} style={{ marginRight: "var(--spacing-sm)" }} />
                Effacer filtres
              </ButtonReset>
              <ButtonSearch type="submit" disabled={isSearchLoading} title="Rechercher">
                <Search size={16} style={{ marginRight: "var(--spacing-sm)" }} />
                Rechercher
              </ButtonSearch>
            </FiltersActions>
          </form>
        </FiltersSection>
      )}
    </FiltersContainer>
  );
};

export default MissionFilters;
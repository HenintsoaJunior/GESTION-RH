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
  FiltersActions,
  ButtonReset,
  ButtonSearch,
  FiltersToggle,
  ButtonShowFilters,
} from "styles/generaliser/table-container";
import { X, List, ChevronDown, ChevronUp } from "lucide-react";

const RecruitmentFilters = ({
  isHidden,
  setIsHidden,
  filters,
  setFilters,
  isLoading,
  handleFilterSubmit,
  handleResetFilters,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const toggleMinimize = () => setIsMinimized((prev) => !prev);
  const toggleHide = () => setIsHidden((prev) => !prev);

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
              <form onSubmit={handleFilterSubmit}>
                <FormTableSearch>
                  <tbody>
                    <FormRow>
                      <FormFieldCell>
                        <FormLabelSearch>Rechercher</FormLabelSearch>
                        <FormInputSearch
                          type="text"
                          placeholder="Rechercher une demande de recrutement..."
                          value={filters.search}
                          onChange={(e) => handleFilterChange("search", e.target.value)}
                          disabled={isLoading.recruitments}
                        />
                      </FormFieldCell>
                      <FormFieldCell>
                        <FormLabelSearch>Statut</FormLabelSearch>
                        <FormInputSearch
                          as="select"
                          name="status"
                          value={filters.status}
                          onChange={(e) => handleFilterChange("status", e.target.value)}
                          disabled={isLoading.recruitments}
                        >
                          <option value="">Tous les statuts</option>
                          <option value="Non défini">En attente</option>
                          <option value="Approuvé">Approuvées</option>
                          <option value="Rejeté">Rejetées</option>
                        </FormInputSearch>
                      </FormFieldCell>
                      <FormFieldCell>
                        <FormLabelSearch>Département</FormLabelSearch>
                        <FormInputSearch
                          type="text"
                          placeholder="Département..."
                          value={filters.department}
                          onChange={(e) => handleFilterChange("department", e.target.value)}
                          disabled={isLoading.recruitments}
                        />
                      </FormFieldCell>
                    </FormRow>
                  </tbody>
                </FormTableSearch>
                <FiltersActions>
                  <ButtonReset
                    type="button"
                    onClick={handleResetFilters}
                    disabled={isLoading.recruitments}
                  >
                    Réinitialiser
                  </ButtonReset>
                  <ButtonSearch type="submit" disabled={isLoading.recruitments}>
                    {isLoading.recruitments ? "Recherche..." : "Rechercher"}
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

export default RecruitmentFilters;
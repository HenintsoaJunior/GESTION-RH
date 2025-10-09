import { useState } from "react";
import { ChevronDown, ChevronUp, X, List } from "lucide-react";
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
} from "styles/generaliser/table-container";

const MissionFilters = ({
    isHidden,
    setIsHidden,
    filters,
    setFilters,
    suggestions,
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
                                            <FormLabelSearch>Collaborateur</FormLabelSearch>
                                            <StyledAutoCompleteInput
                                                value={filters.employeeName || ""}
                                                onChange={(value) =>
                                                    setFilters((prev) => ({
                                                        ...prev,
                                                        employeeName: value,
                                                        employeeId: value ? prev.employeeId : "",
                                                    }))
                                                }
                                                onSelect={(value) => {
                                                    const selectedEmployee = suggestions.beneficiary.find(
                                                        (emp) => emp.displayName === value
                                                    );
                                                    setFilters((prev) => ({
                                                        ...prev,
                                                        employeeId: selectedEmployee ? selectedEmployee.id : "",
                                                        employeeName: selectedEmployee ? selectedEmployee.displayName : value,
                                                    }));
                                                }}
                                                suggestions={suggestions.beneficiary
                                                    .filter((emp) =>
                                                        emp.displayName.toLowerCase().includes(filters.employeeName?.toLowerCase() || "")
                                                    )
                                                    .map((emp) => emp.displayName)}
                                                maxVisibleItems={5}
                                                placeholder="Rechercher par bénéficiaire..."
                                                disabled={isLoading.employees || isLoading.assignMissions}
                                                fieldType="beneficiary"
                                                fieldLabel="bénéficiaire"
                                                showAddOption={false}
                                            />
                                        </FormFieldCell>
                                        
                                        <FormFieldCell>
                                            <FormLabelSearch>Lieu</FormLabelSearch>
                                            <StyledAutoCompleteInput
                                                value={filters.location || ""}
                                                onChange={(value) =>
                                                    setFilters((prev) => ({
                                                        ...prev,
                                                        location: value,
                                                        lieuId: value ? prev.lieuId : "",
                                                    }))
                                                }
                                                onSelect={(value) => {
                                                    const selectedRegion = suggestions.regions.find(
                                                        (region) => region.displayName === value
                                                    );
                                                    setFilters((prev) => ({
                                                        ...prev,
                                                        lieuId: selectedRegion ? selectedRegion.id : "",
                                                        location: selectedRegion ? selectedRegion.displayName : value,
                                                    }));
                                                }}
                                                suggestions={suggestions.regions
                                                    .filter((region) =>
                                                        region.displayName.toLowerCase().includes(filters.location?.toLowerCase() || "")
                                                    )
                                                    .map((region) => region.displayName)}
                                                maxVisibleItems={5}
                                                placeholder="Saisir ou sélectionner un lieu..."
                                                disabled={isLoading.regions || isLoading.assignMissions}
                                                fieldType="lieuId"
                                                fieldLabel="lieu"
                                            />
                                        </FormFieldCell>
                                        <FormFieldCell>
                                            <FormLabelSearch>Statut</FormLabelSearch>
                                            <FormInputSearch
                                                as="select"
                                                name="status"
                                                value={filters.status}
                                                onChange={(e) => handleFilterChange("status", e.target.value)}
                                            >
                                                <option value="">Tous les statuts</option>
                                                
                                                <option value="in progress">En Cours</option>
                                                <option value="planned">Planifié</option>
                                                <option value="completed">Terminé</option>
                                                <option value="cancelled">Annulé</option>
                                            </FormInputSearch>
                                        </FormFieldCell>
                                        <FormFieldCell>
                                            <FormLabelSearch>Type de mission</FormLabelSearch>
                                            <FormInputSearch
                                                as="select"
                                                name="missionType"
                                                value={filters.missionType || ""}
                                                onChange={(e) => handleFilterChange("missionType", e.target.value)}
                                            >
                                                <option value="">Tous les types</option>
                                                <option value="national">National</option>
                                                <option value="international">International</option>
                                            </FormInputSearch>
                                        </FormFieldCell>
                                    </FormRow>
                                    <FormRow>
                                        <FormFieldCell>
                                            <FormLabelSearch>Date de départ min</FormLabelSearch>
                                            <FormInputSearch
                                                name="minDepartureDate"
                                                type="datetime-local"
                                                value={filters.minDepartureDate || ""}
                                                onChange={(e) => handleFilterChange("minDepartureDate", e.target.value)}
                                            />
                                        </FormFieldCell>
                                        <FormFieldCell>
                                            <FormLabelSearch>Date de départ max</FormLabelSearch>
                                            <FormInputSearch
                                                name="maxDepartureDate"
                                                type="datetime-local"
                                                value={filters.maxDepartureDate || ""}
                                                onChange={(e) => handleFilterChange("maxDepartureDate", e.target.value)}
                                            />
                                        </FormFieldCell>
                                        <FormFieldCell>
                                            <FormLabelSearch>Date d'arrivée min</FormLabelSearch>
                                            <FormInputSearch
                                                name="minArrivalDate"
                                                type="datetime-local"
                                                value={filters.minArrivalDate || ""}
                                                onChange={(e) => handleFilterChange("minArrivalDate", e.target.value)}
                                            />
                                        </FormFieldCell>
                                        <FormFieldCell>
                                            <FormLabelSearch>Date d'arrivée max</FormLabelSearch>
                                            <FormInputSearch
                                                name="maxArrivalDate"
                                                type="datetime-local"
                                                value={filters.maxArrivalDate || ""}
                                                onChange={(e) => handleFilterChange("maxArrivalDate", e.target.value)}
                                            />
                                        </FormFieldCell>
                                    </FormRow>
                                    </tbody>
                                </FormTableSearch>
                                <FiltersActions>
                                    <ButtonReset type="button" onClick={handleResetFilters} disabled={isLoading.assignMissions}>
                                        Réinitialiser
                                    </ButtonReset>
                                    <ButtonSearch type="submit" disabled={isLoading.assignMissions}>
                                        {isLoading.assignMissions ? "Recherche..." : "Rechercher"}
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
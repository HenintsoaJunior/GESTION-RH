import { useState, useMemo } from "react";
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
    FiltersActions,
    ButtonReset,
    ButtonSearch,
    FiltersToggle,
    ButtonShowFilters,
} from "styles/generaliser/table-container";

const FiltersPanel = ({
    filters,
    sites = [],
    contractTypes = [],
    directions = [],
    allDepartments = [],
    allServices = [],
    onFilterChange,
    onFilterSubmit,
    onResetFilters,
    isLoading = false
}) => {
    const [isMinimized, setIsMinimized] = useState(false);
    const [isHidden, setIsHidden] = useState(false);

    // Filtered departments based on selected direction
    const filteredDepartments = useMemo(() => {
        if (filters.directionId) {
            return allDepartments.filter((dept) => dept.directionId === filters.directionId);
        }
        return allDepartments;
    }, [allDepartments, filters.directionId]);

    // Filtered services based on selected department or direction
    const filteredServices = useMemo(() => {
        if (filters.departmentId) {
            return allServices.filter((svc) => svc.departmentId === filters.departmentId);
        } else if (filters.directionId) {
            return allServices.filter((svc) => svc.directionId === filters.directionId);
        }
        return allServices;
    }, [allServices, filters.directionId, filters.departmentId]);

    const toggleMinimize = () => {
        setIsMinimized((prev) => !prev);
    };

    const toggleHide = () => {
        setIsHidden((prev) => !prev);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        onFilterSubmit(event);
    };

    if (isHidden) {
        return (
            <FiltersToggle>
                <ButtonShowFilters type="button" onClick={toggleHide}>
                    <List size={16} style={{ marginRight: "var(--spacing-sm)" }} />
                    Afficher les filtres
                </ButtonShowFilters>
            </FiltersToggle>
        );
    }

    return (
        <FiltersContainer $isMinimized={isMinimized}>
            <FiltersHeader>
                <FiltersTitle>Filtres de Recherche</FiltersTitle>
                <FiltersControls>
                    <FilterControlButton
                        $isMinimized
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
                    <form onSubmit={handleSubmit}>
                        <FormTableSearch>
                            <tbody>
                                <FormRow>
                                    <FormFieldCell>
                                        <FormLabelSearch>Intitulé du Poste</FormLabelSearch>
                                        <FormInputSearch
                                            name="jobTitleKeyword"
                                            type="text"
                                            value={filters.jobTitleKeyword}
                                            onChange={(e) => onFilterChange("jobTitleKeyword", e.target.value)}
                                            placeholder="Recherche par poste"
                                            disabled={isLoading}
                                        />
                                    </FormFieldCell>
                                    <FormFieldCell>
                                        <FormLabelSearch>Direction</FormLabelSearch>
                                        <FormInputSearch
                                            as="select"
                                            name="directionId"
                                            value={filters.directionId}
                                            onChange={(e) => onFilterChange("directionId", e.target.value)}
                                            disabled={isLoading}
                                        >
                                            <option value="">Toutes les directions</option>
                                            {directions.map((dir) => (
                                                <option key={dir.directionId} value={dir.directionId}>
                                                    {dir.directionName}
                                                </option>
                                            ))}
                                        </FormInputSearch>
                                    </FormFieldCell>
                                    <FormFieldCell>
                                        <FormLabelSearch>Type de Contrat</FormLabelSearch>
                                        <FormInputSearch
                                            as="select"
                                            name="contractTypeId"
                                            value={filters.contractTypeId}
                                            onChange={(e) => onFilterChange("contractTypeId", e.target.value)}
                                            disabled={isLoading}
                                        >
                                            <option value="">Tous les contrats</option>
                                            {contractTypes.map((ct) => (
                                                <option key={ct.contractTypeId} value={ct.contractTypeId}>
                                                    {ct.label}
                                                </option>
                                            ))}
                                        </FormInputSearch>
                                    </FormFieldCell>
                                </FormRow>
                               
                                <FormRow>
                                    <FormFieldCell>
                                        <FormLabelSearch>Site</FormLabelSearch>
                                        <FormInputSearch
                                            as="select"
                                            name="siteId"
                                            value={filters.siteId}
                                            onChange={(e) => onFilterChange("siteId", e.target.value)}
                                            disabled={isLoading}
                                        >
                                            <option value="">Tous les sites</option>
                                            {sites.map((site) => (
                                                <option key={site.siteId} value={site.siteId}>
                                                    {site.siteName}
                                                </option>
                                            ))}
                                        </FormInputSearch>
                                    </FormFieldCell>
                                    <FormFieldCell>
                                        <FormLabelSearch>Département</FormLabelSearch>
                                        <FormInputSearch
                                            as="select"
                                            name="departmentId"
                                            value={filters.departmentId}
                                            onChange={(e) => onFilterChange("departmentId", e.target.value)}
                                            disabled={filters.directionId === "" || isLoading}
                                        >
                                            <option value="">Tous les départements</option>
                                            {filteredDepartments.map((dept) => (
                                                <option key={dept.departmentId} value={dept.departmentId}>
                                                    {dept.departmentName}
                                                </option>
                                            ))}
                                        </FormInputSearch>
                                    </FormFieldCell>
                                    <FormFieldCell>
                                        <FormLabelSearch>Service</FormLabelSearch>
                                        <FormInputSearch
                                            as="select"
                                            name="serviceId"
                                            value={filters.serviceId}
                                            onChange={(e) => onFilterChange("serviceId", e.target.value)}
                                            disabled={(filters.directionId === "" && filters.departmentId === "") || isLoading}
                                        >
                                            <option value="">Tous les services</option>
                                            {filteredServices.map((svc) => (
                                                <option key={svc.serviceId} value={svc.serviceId}>
                                                    {svc.serviceName}
                                                </option>
                                            ))}
                                        </FormInputSearch>
                                    </FormFieldCell>
                                </FormRow>
                               
                                <FormRow>
                                    <FormFieldCell>
                                        <FormLabelSearch>Statut</FormLabelSearch>
                                        <FormInputSearch
                                            as="select"
                                            name="status"
                                            value={filters.status}
                                            onChange={(e) => onFilterChange("status", e.target.value)}
                                            disabled={isLoading}
                                        >
                                            <option value="">Tous les statuts</option>
                                            <option value="BROUILLON">Brouillon</option>
                                            <option value="En Cours">En Cours</option>
                                            <option value="Approuvé">Approuvé</option>
                                            <option value="Rejeté">Rejeté</option>
                                        </FormInputSearch>
                                    </FormFieldCell>
                                    <FormFieldCell>
                                        <FormLabelSearch>Date de début</FormLabelSearch>
                                        <FormInputSearch
                                            name="requestDateMin"
                                            type="date"
                                            value={filters.requestDateMin}
                                            onChange={(e) => onFilterChange("requestDateMin", e.target.value)}
                                            disabled={isLoading}
                                        />
                                    </FormFieldCell>
                                    <FormFieldCell>
                                        <FormLabelSearch>Date de fin</FormLabelSearch>
                                        <FormInputSearch
                                            name="requestDateMax"
                                            type="date"
                                            value={filters.requestDateMax}
                                            onChange={(e) => onFilterChange("requestDateMax", e.target.value)}
                                            disabled={isLoading}
                                        />
                                    </FormFieldCell>
                                </FormRow>
                            </tbody>
                        </FormTableSearch>
                       
                        <FiltersActions>
                            <ButtonReset
                                type="button"
                                onClick={onResetFilters}
                                disabled={isLoading}
                            >
                                Réinitialiser
                            </ButtonReset>
                            <ButtonSearch
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading ? "Recherche..." : "Rechercher"}
                            </ButtonSearch>
                        </FiltersActions>
                    </form>
                </FiltersSection>
            )}
        </FiltersContainer>
    );
};

export default FiltersPanel;
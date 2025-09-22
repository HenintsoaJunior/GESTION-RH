"use client";

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
    onFilterChange,
    onFilterSubmit,
    onResetFilters,
    isLoading = false,
}) => {
    const [isMinimized, setIsMinimized] = useState(false);
    const [isHidden, setIsHidden] = useState(false);

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
                                        <FormLabelSearch>Type de Contrat</FormLabelSearch>
                                        <FormInputSearch
                                            as="select"
                                            name="contractTypeId"
                                            value={filters.contractTypeId}
                                            onChange={(e) => onFilterChange("contractTypeId", e.target.value)}
                                            disabled={isLoading}
                                        >
                                            <option value="">Tous les types de contrat</option>
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
                                        <FormLabelSearch>Statut</FormLabelSearch>
                                        <FormInputSearch
                                            as="select"
                                            name="status"
                                            value={filters.status}
                                            onChange={(e) => onFilterChange("status", e.target.value)}
                                            disabled={isLoading}
                                        >
                                            <option value="">Tous les statuts</option>
                                            <option value="Brouillon">Brouillon</option>
                                            <option value="Publiée">Publiée</option>
                                            <option value="Fermé">Fermé</option>
                                        </FormInputSearch>
                                    </FormFieldCell>
                                    <FormFieldCell>
                                        <FormLabelSearch>Date de publication min</FormLabelSearch>
                                        <FormInputSearch
                                            name="publicationDateMin"
                                            type="date"
                                            value={filters.publicationDateMin}
                                            onChange={(e) => onFilterChange("publicationDateMin", e.target.value)}
                                            disabled={isLoading}
                                        />
                                    </FormFieldCell>
                                    <FormFieldCell>
                                        <FormLabelSearch>Date de publication max</FormLabelSearch>
                                        <FormInputSearch
                                            name="publicationDateMax"
                                            type="date"
                                            value={filters.publicationDateMax}
                                            onChange={(e) => onFilterChange("publicationDateMax", e.target.value)}
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
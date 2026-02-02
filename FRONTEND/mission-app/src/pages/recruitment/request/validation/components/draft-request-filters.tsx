"use client";

import React, { useState } from "react";
import { X, Search, Filter, ChevronUp, ChevronDown } from "lucide-react";
import {
  StyledSelect,
  FormInputSearch,
  FormLabelSearch,
  FiltersContainer,
  FiltersSection,
  ButtonSearch,
  ButtonReset,
  Separator,
} from "@/styles/table-styles";
import type { Direction } from "@/api/direction/services";
import type { ContractType } from "@/api/contract/services";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  ActionsContainer,
  ButtonText,
  DateFieldWrapper,
  FieldsContainer,
  FiltersContent,
  FormFieldWrapper
} from "@/styles/recruitment-styles";

interface FiltersState {
  post: string;
  direction: string;
  contract: string;
  status: string; // readonly, non envoyé au backend
  selectedDirection?: Direction | null;
  selectedContract?: ContractType | null;
  dateRange: [Date | null, Date | null];
}

interface DraftRequestFiltersProps {
  filters: FiltersState;
  setFilters: React.Dispatch<React.SetStateAction<FiltersState>>;
  isLoading: boolean;
  allDirections: Direction[];
  allContracts: ContractType[];
  onSubmit: () => void;
  onReset: () => void;
}

const DraftRequestFilters: React.FC<DraftRequestFiltersProps> = ({
  filters,
  setFilters,
  isLoading,
  allDirections,
  allContracts,
  onSubmit,
  onReset
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    setFilters(prev => ({ ...prev, dateRange: dates }));
  };

  const hasFilters =
    filters.post ||
    filters.direction ||
    filters.contract ||
    filters.dateRange[0] ||
    filters.dateRange[1];

  return (
    <FiltersContainer>
      <FiltersSection>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Filter size={18} />
            <strong>Filtres</strong>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(p => !p)}
            title={isOpen ? "Masquer les filtres" : "Afficher les filtres"}
          >
            {isOpen ? <ChevronUp /> : <ChevronDown />}
          </button>
        </div>

        {isOpen && (
          <>
            <Separator />

            <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
              <FiltersContent>
                <FieldsContainer>

                  {/* Poste */}
                  <FormFieldWrapper>
                    <FormLabelSearch>Poste</FormLabelSearch>
                    <FormInputSearch
                      name="post"
                      value={filters.post}
                      onChange={handleChange}
                      placeholder="Rechercher par poste..."
                      disabled={isLoading}
                    />
                  </FormFieldWrapper>

                  {/* Direction */}
                  <FormFieldWrapper>
                    <FormLabelSearch>Direction</FormLabelSearch>
                    <StyledSelect
                      name="direction"
                      value={filters.direction}
                      onChange={handleChange}
                      disabled={isLoading}
                    >
                      <option value="">Toutes</option>
                      {allDirections.map(d => (
                        <option key={d.directionId} value={d.acronym}>{d.acronym}</option>
                      ))}
                    </StyledSelect>
                  </FormFieldWrapper>

                  {/* Contrat */}
                  <FormFieldWrapper>
                    <FormLabelSearch>Contrat</FormLabelSearch>
                    <StyledSelect
                      name="contract"
                      value={filters.contract}
                      onChange={handleChange}
                      disabled={isLoading}
                    >
                      <option value="">Tous</option>
                      {allContracts.map(c => (
                        <option key={c.code} value={c.code}>{c.label}</option>
                      ))}
                    </StyledSelect>
                  </FormFieldWrapper>

                  {/* Statut (readonly) */}
                  <FormFieldWrapper>
                    <FormLabelSearch>Statut</FormLabelSearch>
                    <FormInputSearch
                      type="text"
                      value={filters.status || "Non validée"}
                      readOnly
                    />
                  </FormFieldWrapper>

                  {/* Date de demande */}
                  <FormFieldWrapper>
                    <FormLabelSearch>Date de demande</FormLabelSearch>
                    <DateFieldWrapper>
                      <DatePicker
                        selectsRange
                        startDate={filters.dateRange[0]}
                        endDate={filters.dateRange[1]}
                        onChange={handleDateChange}
                        isClearable
                        placeholderText="Début - Fin"
                        disabled={isLoading}
                        className="form-input"
                        dateFormat="dd/MM/yyyy"
                      />
                    </DateFieldWrapper>
                  </FormFieldWrapper>

                </FieldsContainer>

                <ActionsContainer>
                  <ButtonReset
                    type="button"
                    onClick={onReset}
                    disabled={!hasFilters || isLoading}
                  >
                    <X size={16} /><ButtonText>Effacer</ButtonText>
                  </ButtonReset>

                  <ButtonSearch type="submit" disabled={isLoading}>
                    <Search size={16} /><ButtonText>Rechercher</ButtonText>
                  </ButtonSearch>
                </ActionsContainer>
              </FiltersContent>
            </form>
          </>
        )}
      </FiltersSection>
    </FiltersContainer>
  );
};

export default DraftRequestFilters;

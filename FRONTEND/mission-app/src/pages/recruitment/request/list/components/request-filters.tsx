import React, { useState } from "react";
import { Filter, ChevronUp, ChevronDown, Search, X } from "lucide-react";
import {
  StyledSelect,
  FormInputSearch,
  FormLabelSearch,
  FiltersContainer,
  FiltersSection,
  ButtonReset,
  ButtonSearch,
  Separator,
} from "@/styles/table-styles";
import type { ContractType } from "@/api/contract/services";
import type { Direction } from "@/api/direction/services";
import type { DocumentDTO } from "@/api/recruitment/service";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ActionsContainer, ButtonText, DateFieldWrapper, FieldsContainer, FiltersContent, FormFieldWrapper } from "@/styles/recruitment-styles";

interface FiltersState {
  post: string;
  status: string;
  direction: string;
  contract: string;
  selectedStatus?: DocumentDTO | null;
  selectedDirection?: Direction | null;
  selectedContract?: ContractType | null;
  dateRange: [Date | null, Date | null]; // remplacer dateMin/dateMax
}

interface RequestFiltersProps {
  filters: FiltersState;
  setFilters: React.Dispatch<React.SetStateAction<FiltersState>>;
  onSubmit: (values: FiltersState) => void;
  onReset: () => void;
  allDirections: Direction[];
  allContracts: ContractType[];
  allStatuses: DocumentDTO[];
  isLoading: boolean;
}

/* ================= COMPONENT ================= */

const RequestFilters: React.FC<RequestFiltersProps> = ({
  filters,
  setFilters,
  onSubmit,
  onReset,
  allDirections,
  allContracts,
  allStatuses,
  isLoading,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(filters);
  };

  const hasFilters =
    Object.values(filters)
      .filter(v => typeof v !== "object")
      .some(v => v && v !== "") ||
    (filters.dateRange[0] || filters.dateRange[1]);

  return (
    <FiltersContainer>
      <FiltersSection>
        {/* HEADER */}
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

        {isOpen && (<>
          <Separator />

          <form onSubmit={handleSubmit}>
            <FiltersContent>
              <FieldsContainer>
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

                <FormFieldWrapper>
                  <FormLabelSearch>Statut</FormLabelSearch>
                  <StyledSelect
                    name="status"
                    value={filters.status}
                    onChange={handleChange}
                    disabled={isLoading}
                  >
                    <option value="">Tous</option>
                    {allStatuses.map(s => (
                      <option key={s.name} value={s.name}>{s.name}</option>
                    ))}
                  </StyledSelect>
                </FormFieldWrapper>

                <FormFieldWrapper>
                  <FormLabelSearch>Date de demande</FormLabelSearch>
                  <DateFieldWrapper>
                    <DatePicker
                      selectsRange
                      startDate={filters.dateRange[0]}
                      endDate={filters.dateRange[1]}
                      onChange={(dates) =>
                        setFilters(prev => ({ ...prev, dateRange: dates as [Date | null, Date | null] }))
                      }
                      isClearable
                      placeholderText="Début - Fin"
                      disabled={isLoading}
                      className="form-input" // applique le style identique aux autres champs
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
        </>)}
      </FiltersSection>
    </FiltersContainer>
  );
};

export default RequestFilters;

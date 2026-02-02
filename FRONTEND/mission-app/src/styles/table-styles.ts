import styled from "styled-components";
import AutoCompleteInput from "@/components/auto-complete-input";

interface TableRowProps {
  $clickable?: boolean;
}

interface FilterControlButtonProps {
  $isMinimized?: boolean;
  $isClose?: boolean;
}

interface FiltersContainerProps {
  $isMinimized?: boolean;
}

interface ButtonViewProps {
  $active?: boolean;
}

interface LegendColorProps {
  color?: string;
}

interface ActionButtonProps {
  variant?: 'edit' | 'cancel' | 'delete';
}

interface ClickableTableRowProps {
  $clickable: boolean;
}

interface ViewToggleButtonProps {
  $isActive?: boolean;
}

export const DashboardContainer = styled.div`
  font-family: var(--font-family);
  background: var(--bg-primary);
  padding: var(--spacing-lg);
  max-width: 100%;
  margin: var(--spacing-xl) auto;
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);

  @media (max-width: 768px) {
    padding: var(--spacing-md);
    margin: var(--spacing-md) auto;
  }
`;

export const StatsContainer = styled.div`
  margin-bottom: var(--spacing-lg);
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const StatCard = styled.div`
  display: flex;
  align-items: center;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  background-color: #f5f5f5;
  border-left: 4px solid;
  gap: var(--spacing-sm);

  &.stat-card-total {
    border-left-color: var(--primary-color);
  }
  &.stat-card-progress {
    border-left-color: #3b82f6;
  }
  &.stat-card-pending {
    border-left-color: #f59e0b;
  }
  &.stat-card-approved {
    border-left-color: #10b981;
  }
  &.stat-card-validate {
    border-left-color: #10b981;
  }
  &.stat-card-cancelled {
    border-left-color: #ef4444;
  }
`;

export const StatIcon = styled.div`
  color: var(--text-muted);
`;

export const StatContent = styled.div`
  flex: 1;
`;

export const StatNumber = styled.div`
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
  font-family: var(--font-family);
`;

export const StatLabel = styled.div`
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  font-weight: 500;
  font-family: var(--font-family);
`;

export const TableContainer = styled.div`
  background: var(--bg-primary);
  border-radius: 0;
  margin-top: 0;
  margin-bottom: var(--spacing-lg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 100%;
  margin-left: auto;
  margin-right: auto;
  
  border: none; 
  border-top: 5px solid var(--border-color);
  overflow: hidden;
  box-sizing: border-box;

  /* Ajout d'espaces à gauche et à droite comme le FiltersContainer */
  padding-left: var(--spacing-3xl);
  padding-right: var(--spacing-3xl);
  padding-bottom: var(--spacing-lg);
  padding-top: var(--spacing-md); 

  @media (max-width: 768px) {
    padding-left: var(--spacing-md);
    padding-right: var(--spacing-md);
    padding-bottom: var(--spacing-md);
  }

  .table-wrapper {
    overflow-x: auto;
    width: 100%;
    margin-top: var(--spacing-md);
    margin-left: 0;
    margin-right: 0;
  }
`;

export const NewTableContainer = styled.div`
  position: relative;
  background: var(--bg-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  box-sizing: border-box;

  border-top: 5px solid var(--border-color);

  padding-left: var(--spacing-3xl);
  padding-right: var(--spacing-3xl);
  padding-bottom: var(--spacing-lg);
  padding-top: var(--spacing-md);

  @media (max-width: 768px) {
    padding-left: var(--spacing-md);
    padding-right: var(--spacing-md);
  }

  .table-wrapper {
    max-height: calc(100vh - 280px); /* zone scrollable */
    overflow-y: auto;
    overflow-x: auto;
    margin-top: var(--spacing-md);
  }
`;


export const DataTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: white; 
  border: 1px solid var(--border-light);
`;

export const TableHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
  padding: var(--spacing-md) 0;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: stretch;
    padding: var(--spacing-md) 0;
  }
`;

export const NewTableHeader = styled.div`
  position: sticky;
  top: var(--header-height); /* hauteur du Header global */
  z-index: 500;
  background: var(--bg-primary);

  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) 0;

  border-bottom: 1px solid var(--border-color);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: stretch;
  }
`;


export const TableTitle = styled.h2`
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  font-family: var(--font-family);
`;

export const TableActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: var(--spacing-md);
  }
`;


export const TableRow = styled.tr<TableRowProps>`
  cursor: ${({ $clickable }) => ($clickable ? "pointer" : "default")};
  &:hover {
    background: ${({ $clickable }) => ($clickable ? "var(--bg-tertiary)" : "transparent")};
  }
`;

export const ClickableTableRow = styled(TableRow)<ClickableTableRowProps>`
  cursor: ${(props) => (props.$clickable ? 'pointer' : 'default')};
  height: 56px; /* Hauteur fixe pour toutes les lignes */

  &:hover {
    background-color: ${(props) => (props.$clickable ? 'var(--bg-secondary, #f8f9fa)' : 'transparent')};
  }
`;

export const TableCell = styled.td`
  padding: var(--spacing-md);
  text-align: left;
  border-bottom: 1px solid var(--border-light);
  border-right: 1px solid var(--border-light); 
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  font-family: var(--font-family);
  vertical-align: middle; /* Crucial pour l'alignement vertical */

  &:first-child {
    border-left: none;
  }
  &:last-child {
    border-right: none; 
  }
  
  ${TableRow}:last-child & {
    border-bottom: none;
  }
`;

export const CheckboxCell = styled(TableCell)`
  text-align: center;
  width: 50px;
  padding: var(--spacing-sm);
`;

export const TableHeadCell = styled.th`
  padding: var(--spacing-md);
  text-align: left;
  border-bottom: 1px solid var(--border-light);
  border-right: 1px solid var(--border-light); 
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-secondary);
  background: var(--bg-secondary);
  white-space: nowrap;
  font-family: var(--font-family);
  vertical-align: middle; /* Pour aligner avec les cellules */

  border-top: none; 
  &:first-child {
    border-left: none; 
  }
  &:last-child {
    border-right: none; 
  }
`;

export const TableHeadCellStyled = styled(TableHeadCell)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const CheckboxHeadCell = styled(TableHeadCell)`
  text-align: center;
  width: 50px;
  padding: var(--spacing-sm);
`;

export const Loading = styled.div`
  text-align: center;
  padding: var(--spacing-md);
  color: var(--text-muted);
  font-family: var(--font-family);
`;

export const NoDataMessage = styled.div`
  text-align: center;
  padding: var(--spacing-md);
  color: var(--text-muted);
  font-family: var(--font-family);
`;

export const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  font-family: var(--font-family);
  letter-spacing: 0.01em;
  height: 22px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 0.2s ease;

  &.status-progress {
    background: rgba(59, 130, 246, 0.1); /* Bleu très clair */
    color: #1d4ed8; /* Bleu foncé */
    border: 1px solid rgba(59, 130, 246, 0.3);
  }
  
  &.status-waiting {
    background: rgba(245, 158, 11, 0.1); /* Orange très clair */
    color: #d97706; /* Orange foncé */
    border: 1px solid rgba(245, 158, 11, 0.3);
  }
  
  &.status-pending {
    background: rgba(139, 92, 246, 0.1); /* Violet très clair */
    color: #6d28d9; /* Violet foncé */
    border: 1px solid rgba(139, 92, 246, 0.3);
  }
  
  &.status-approved {
    background: rgba(34, 197, 94, 0.1); /* Vert très clair */
    color: #059669; /* Vert foncé */
    border: 1px solid rgba(34, 197, 94, 0.3);
  }
  
  &.status-cancelled {
    background: rgba(239, 68, 68, 0.1); /* Rouge très clair */
    color: #dc2626; /* Rouge foncé */
    border: 1px solid rgba(239, 68, 68, 0.3);
  }
  
  &.status-rejected {
    background: rgba(190, 18, 60, 0.1); /* Rouge foncé très clair */
    color: #be123c; /* Rouge foncé */
    border: 1px solid rgba(190, 18, 60, 0.3);
  }
  
  &.status-payment {
    background: rgba(14, 165, 233, 0.1); /* Cyan très clair */
    color: #0c4a6e; /* Cyan foncé */
    border: 1px solid rgba(14, 165, 233, 0.3);
  }
`;

// Variante alternative avec un design plus simple si préféré
export const StatusBadgeSimple = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  font-family: var(--font-family);
  letter-spacing: 0.01em;
  height: 22px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 0.2s ease;

  &.status-progress {
    background: #dbeafe;
    color: #1e40af;
    border: 1px solid #93c5fd;
  }
  
  &.status-waiting {
    background: #fef3c7;
    color: #92400e;
    border: 1px solid #fde68a;
  }
  
  &.status-pending {
    background: #f3e8ff;
    color: #6b21a8;
    border: 1px solid #d8b4fe;
  }
  
  &.status-approved {
    background: #d1fae5;
    color: #065f46;
    border: 1px solid #a7f3d0;
  }
  
  &.status-cancelled {
    background: #fee2e2;
    color: #991b1b;
    border: 1px solid #fca5a5;
  }
  
  &.status-rejected {
    background: #fce7f3;
    color: #9d174d;
    border: 1px solid #f9a8d4;
  }
  
  &.status-payment {
    background: #e0f2fe;
    color: #075985;
    border: 1px solid #bae6fd;
  }
`;

export const FiltersContainer = styled.div<FiltersContainerProps>`
  position: relative;
  background: var(--bg-primary);
  border-radius: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 21px;
  
  /* Ajout d'espaces à gauche et à droite */
  padding-left: var(--spacing-3xl);
  padding-right: var(--spacing-3xl);
  padding-top: var(--spacing-lg);
  padding-bottom: var(--spacing-lg);
  
  border-top: 5px solid var(--border-color);

  ${({ $isMinimized }) =>
    $isMinimized &&
    `
    margin-bottom: 21px;
    & .filters-section {
      display: none;
    }
    & .filters-header {
      margin-bottom: 0;
    }
  `}

  @media (max-width: 768px) {
    padding-left: var(--spacing-md);
    padding-right: var(--spacing-md);
    padding-top: var(--spacing-md);
    padding-bottom: var(--spacing-md);
  }
`;

export const FilterBar = styled.div`
  padding: var(--spacing-md) var(--spacing-3xl);
  border-bottom: 1px solid var(--border-light);
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);

  @media (max-width: 768px) {
    padding: var(--spacing-md);
    flex-direction: column;
    align-items: stretch;
  }
`;

export const FiltersHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);

  @media (max-width: 768px) {
    padding: 0;
  }
`;

export const FiltersTitle = styled.h2`
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  font-family: var(--font-family);

  @media (max-width: 768px) {
    font-size: var(--font-size-md);
  }
`;

export const FiltersControls = styled.div`
  display: flex;
  gap: var(--spacing-sm);
`;

export const FilterControlButton = styled.button<FilterControlButtonProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  background-color: var(--bg-primary);
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--bg-secondary);
    border-color: var(--primary-color);
    color: var(--text-primary);
  }

  &:active {
    transform: scale(0.95);
  }

  ${({ $isMinimized }) =>
    $isMinimized &&
    `
    &:hover {
      background-color: #fef3c7;
      border-color: #f59e0b;
      color: #d97706;
    }
  `}

  ${({ $isClose }) =>
    $isClose &&
    `
    &:hover {
      background-color: #fee2e2;
      border-color: #ef4444;
      color: #dc2626;
    }
  `}

  @media (max-width: 768px) {
    width: 28px;
    height: 28px;
  }
`;

export const FiltersSection = styled.div`
  padding: 0;
  transition: all 0.3s ease;
`;

export const FormTableSearch = styled.table`
  width: 100%;
  margin-top: var(--spacing-md);
  border-collapse: separate;
  border-spacing: 0 4px;

  @media (max-width: 480px) {
    display: block;
  }
`;

export const FormRow = styled.tr`
  margin-bottom: var(--spacing-sm);

  @media (max-width: 480px) {
    display: block;
  }
`;

export const FormFieldCell = styled.td`
  text-align: left;
  font-weight: 600;
  color: var(--text-secondary);
  font-size: var(--font-size-md);
  padding: var(--spacing-xs);
  vertical-align: top;
  font-family: var(--font-family);

  @media (max-width: 480px) {
    display: block;
    width: 100%;
  }
`;

export const FormLabelSearch = styled.label`
  margin-bottom: var(--spacing-xs);
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-secondary);
  display: block;
  font-family: var(--font-family);
`;

export const FormInputSearch = styled.input`
  width: 100%;
  height: 32px;
  border: 1px solid var(--border-light);
  border-radius: 0;
  font-size: var(--font-size-xs);
  font-family: var(--font-family);
  background-color: #f5f5f5;
  color: var(--text-input);
  box-sizing: border-box;
  line-height: 1.2;
  padding: var(--spacing-xs);
  padding-right: var(--spacing-3xl);

  &:hover {
    border: 1px solid var(--primary-color);
  }

  &:focus {
    border: 1px solid var(--primary-color);
    background-color: #ffffff;
    outline: none;
    box-shadow: inset 0 0 2px var(--primary-shadow);
  }

  &[type="select"],
  &[as="select"] {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background: #f5f5f5
      url("data:image/svg+xml;utf8,<svg fill='%2369B42E' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>")
      no-repeat right var(--spacing-sm) center;
    background-size: 16px;
  }

  &[type="date"] {
    cursor: pointer;
    background-color: #f5f5f5;

    &::-webkit-calendar-picker-indicator {
      right: var(--spacing-xs);
      cursor: pointer;
    }

    &::-webkit-datetime-edit {
      padding: 0 var(--spacing-sm);
    }

    &::-webkit-datetime-edit-text {
      color: var(--text-input);
      padding: 0 var(--spacing-xs);
    }

    &::-webkit-datetime-edit-month-field,
    &::-webkit-datetime-edit-day-field,
    &::-webkit-datetime-edit-year-field {
      color: var(--text-input);
      padding: 0 var(--spacing-xs);
      font-weight: 500;
    }

    &::-webkit-datetime-edit-fields-wrapper {
      padding: 0;
    }

    &::-webkit-inner-spin-button {
      display: none;
      -webkit-appearance: none;
    }

    &::-moz-calendar-picker {
      padding: 0 var(--spacing-sm);
    }

    &[type="date"]:invalid {
      color: var(--text-muted);
    }

    &[type="date"]:focus {
      background-color: #ffffff;
    }
  }
`;
export const Separator = styled.hr`
  border: none;
  border-top: 1px solid var(--border-light);
  margin: var(--spacing-md) 0;
  width: calc(100% + 2 * var(--spacing-3xl));
  margin-left: calc(-1 * var(--spacing-3xl));
  opacity: 0.6;

  @media (max-width: 768px) {
    width: calc(100% + 2 * var(--spacing-md));
    margin-left: calc(-1 * var(--spacing-md));
  }
`;

export const StyledAutoCompleteInput = styled(AutoCompleteInput)`
  width: 100%;
  height: 32px;
  border: 1px solid var(--border-light);
  border-radius: 0;
  font-size: var(--font-size-xs);
  font-family: var(--font-family);
  background-color: #f5f5f5;
  color: var(--text-input);
  box-sizing: border-box;
  line-height: 1.2;
  padding: var(--spacing-xs);
  padding-right: var(--spacing-xl);

  &:hover {
    border: 1px solid var(--primary-color);
  }

  &:focus {
    border: 1px solid var(--primary-color);
    background-color: #ffffff;
    outline: none;
    box-shadow: inset 0 0 2px var(--primary-shadow);
  }
`;

export const AutoCompleteContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
`;

export const AutoCompleteIcon = styled.div`
  position: absolute;
  right: var(--spacing-sm);
  top: 50%;
  transform: translateY(-50%);
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  cursor: pointer;

  &:hover {
    color: var(--primary-color);
  }
`;

export const AutoCompleteDropdown = styled.div`
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  box-shadow: var(--shadow-sm);
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  font-size: var(--font-size-xs);
`;

export const AutoCompleteSuggestionsContainer = styled.div`
  max-height: 150px;
  overflow-y: auto;
`;

export const AutoCompleteSuggestion = styled.div`
  padding: var(--spacing-sm) var(--spacing-md);
  cursor: pointer;
  border-bottom: 1px solid var(--border-light);
  color: var(--text-input);
  font-family: var(--font-family);

  &:hover {
    background-color: var(--bg-secondary);
  }

  &:last-child {
    border-bottom: none;
  }
`;

export const FiltersActions = styled.div`
  text-align: right;
  padding-top: var(--spacing-lg);
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(--spacing-sm);

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const ButtonReset = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-xl);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  font-family: var(--font-family);
  font-size: var(--font-size-sm);
  box-shadow: var(--shadow-sm);
  height: 40px;
  line-height: 1;
  transition: all 0.2s ease;
  background-color: var(--error-color);
  color: #ffffff;

  &:hover {
    background-color: var(--error-hover);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    background-color: #d32f2f;
    color: #ffffff;
  }


  @media (max-width: 768px) {
    width: 100%;
  }
`;


export const ButtonSearch = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-xl);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  font-family: var(--font-family);
  font-size: var(--font-size-sm);
  box-shadow: var(--shadow-sm);
  height: 40px;
  line-height: 1;
  transition: all 0.2s ease;
  background-color: var(--primary-color);
  color: #ffffff;
  align-self: flex-end;

  &:hover {
    background-color: var(--primary-hover);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const ButtonDetails = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-md);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-weight: 600;
  font-family: var(--font-family);
  font-size: var(--font-size-sm);
  box-shadow: var(--shadow-xs);
  height: 32px;
  line-height: 1;
  transition: all 0.2s ease;
  background-color: var(--primary-color);
  color: #ffffff;
  align-self: flex-end;

  &:hover {
    background-color: var(--primary-hover);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const ButtonAdd = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-xl);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  font-family: var(--font-family);
  font-size: var(--font-size-sm);
  box-shadow: var(--shadow-sm);
  height: 40px;
  line-height: 1;
  transition: all 0.2s ease;
  background-color: var(--primary-color);
  color: #ffffff;

  &:hover {
    background-color: var(--primary-hover);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

export const ButtonUpdate = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-md);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  font-family: var(--font-family);
  font-size: var(--font-size-xs);
  box-shadow: var(--shadow-sm);
  height: 32px;
  line-height: 1;
  transition: all 0.2s ease;
  background-color: var(--primary-color);
  color: #ffffff;
  min-width: 70px;

  &:hover {
    background-color: var(--primary-hover);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    background-color: var(--primary-dark);
  }

  @media (max-width: 768px) {
    width: 100%;
    min-width: unset;
  }
`;

export const ButtonCancel = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-md);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  font-family: var(--font-family);
  font-size: var(--font-size-xs);
  box-shadow: var(--shadow-sm);
  height: 32px;
  line-height: 1;
  transition: all 0.2s ease;
  background-color: var(--error-color);
  color: #ffffff;
  min-width: 70px;

  &:hover {
    background-color: var(--error-hover);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    width: 100%;
    min-width: unset;
  }
`;

export const ButtonConfirm = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-md);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  font-family: var(--font-family);
  font-size: var(--font-size-xs);
  box-shadow: var(--shadow-sm);
  height: 32px;
  line-height: 1;
  transition: all 0.2s ease;
  background-color: var(--primary-color);
  color: #ffffff;
  min-width: 70px;

  &:hover {
    background-color: var(--primary-hover);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    width: 100%;
    min-width: unset;
  }
`;

export const ButtonConfirmSecondary = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-md);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  font-family: var(--font-family);
  font-size: var(--font-size-xs);
  box-shadow: var(--shadow-sm);
  height: 32px;
  line-height: 1;
  transition: all 0.2s ease;
  background-color: rgb(157, 157, 156);
  color: #ffffff;
  min-width: 70px;

  &:hover {
    background-color: var(--primary-hover);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    width: 100%;
    min-width: unset;
  }
`;

export const IconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-primary);
  background: transparent;
  margin-left: var(--spacing-xs);

  &:hover {
    background-color: var(--bg-secondary);
  }

  &:active {
    transform: scale(0.95);
  }

  @media (max-width: 768px) {
    width: 28px;
    height: 28px;
  }
`;

export const EditButton = styled(IconButton)`
  color: var(--primary-color);

  &:hover {
    background-color: var(--primary-transparent);
    color: var(--primary-hover);
  }
`;

export  const EditActionButtonStyled = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  background-color: var(--primary-color);
  color: white;
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: var(--primary-hover);
  }

  &:focus {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  svg {
    flex-shrink: 0;
  }
`;

export const EditorButton = styled(IconButton)`
  color: var(--primary-color);

  &:hover {
    background-color: var(--primary-color);
    color: var(--primary-hover);
  }
`;


export const CancelButton = styled(IconButton)`
  color: var(--error-color);

  &:hover {
    background-color: var(--error-bg);
    color: var(--error-color);
  }
`;

export const DeleteButton = styled(IconButton)`
  color: var(--error-color);

  &:hover {
    background-color: var(--error-bg);
    color: var(--error-color);
  }
`;

export const ToggleButton = styled(IconButton)`
  width: 24px;
  height: 24px;
  color: var(--text-secondary);
  margin-left: 0;

  &:hover {
    background-color: var(--bg-secondary);
    color: var(--primary-color);
  }

  @media (max-width: 768px) {
    width: 20px;
    height: 20px;
  }
`;

export const FiltersToggle = styled.div`
  margin-bottom: 21px;
  margin-top: var(--spacing-lg); 
`;

export const ButtonShowFilters = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-xl);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  font-family: var(--font-family);
  font-size: var(--font-size-sm);
  box-shadow: var(--shadow-sm);
  height: 40px;
  line-height: 1;
  transition: all 0.2s ease;
  background-color: var(--primary-color);
  color: #ffffff;

  &:hover {
    background-color: var(--primary-hover);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const ViewToggle = styled.div`
  display: flex;
  gap: var(--spacing-lg);
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: var(--spacing-md);
  }
`;

export const ButtonView = styled.button<ButtonViewProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  font-family: var(--font-family);
  font-size: var(--font-size-sm);
  box-shadow: var(--shadow-sm);
  height: 40px;
  line-height: 1;
  transition: all 0.2s ease;
  background-color: ${({ $active }) => ($active ? "var(--primary-color)" : "var(--bg-primary)")};
  color: ${({ $active }) => ($active ? "#ffffff" : "var(--text-primary)")};

  &:hover {
    background-color: var(--bg-secondary);
  }

  &.active {
    background-color: var(--primary-color);
    color: #ffffff;
    border-color: var(--primary-color);
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

export const CalendarLegend = styled.div`
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background-color: #f8f9fa;
  border-radius: var(--radius-md);
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  justify-content: center;
`;

export const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
`;

export const LegendColor = styled.div<LegendColorProps>`
  width: 20px;
  height: 20px;
  border-radius: var(--radius-sm);
  background-color: ${({ color }) => color};
`;

export const LegendLabel = styled.span`
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  font-family: var(--font-family);
`;

export const LegendNote = styled.div`
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: #e9ecef;
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  font-family: var(--font-family);
`;

export const ActionButtons = styled.div`
  display: flex;
  gap: var(--spacing-xs);
  justify-content: flex-start;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: var(--spacing-xs);
  }
`;

export const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-lg);
`;

export const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
`;

export const PaginationInfo = styled.div`
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  font-family: var(--font-family);
`;

export const PaginationControls = styled.div`
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
`;

export const PaginationButton = styled.button`
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-light);
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: var(--font-size-sm);
  transition: all 0.2s;
  font-family: var(--font-family);

  &:hover {
    background: var(--bg-secondary);
  }

  &.active {
    background: var(--primary-color);
    color: #ffffff;
    border-color: var(--primary-color);
  }
`;

export const PaginationDots = styled.div`
  color: var(--text-muted);
  padding: 0 var(--spacing-sm);
  font-family: var(--font-family);
`;

export const PaginationOptions = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: var(--bg-secondary);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);

  &:hover {
    background: var(--bg-tertiary);
  }
`;

export const PaginationLabel = styled.div`
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: 600;
  font-family: var(--font-family);
`;

export const PaginationSelect = styled.select`
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  height: 32px;
  min-width: 80px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-family: var(--font-family);
  background: #f5f5f5
    url("data:image/svg+xml;utf8,<svg fill='%2369B42E' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>")
    no-repeat right var(--spacing-sm) center;
  background-size: 16px;
  color: var(--text-input);
  padding: var(--spacing-xs) var(--spacing-2xl) var(--spacing-xs) var(--spacing-sm);
  cursor: pointer;

  &:hover {
    border-color: var(--primary-color);
  }

  &:focus {
    border-color: var(--primary-color);
    background-color: var(--bg-primary);
    outline: none;
    box-shadow: var(--shadow-focus);
  }
`;

export const ActionsSelect = styled.select`
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  height: 40px;
  min-width: 180px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-family: var(--font-family);
  background: var(--bg-primary)
    url("data:image/svg+xml;utf8,<svg fill='var(--text-muted)' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>")
    no-repeat right var(--spacing-sm) center;
  background-size: 16px;
  color: var(--text-input);
  padding: var(--spacing-sm) var(--spacing-2xl) var(--spacing-sm) var(--spacing-md);
  cursor: pointer;

  &:hover:not(:disabled) {
    border-color: var(--primary-color);
  }

  &:focus {
    border-color: var(--primary-color);
    background-color: var(--bg-primary);
    outline: none;
    box-shadow: var(--shadow-focus);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  option {
    padding: var(--spacing-sm);
  }
`;

export const StyledSelect = styled.select`
  width: 100%;
  height: 32px;
  border: 1px solid var(--border-light);
  border-radius: 0;
  font-size: var(--font-size-xs);
  font-family: var(--font-family);
  background-color: #f5f5f5;
  color: var(--text-input);
  box-sizing: border-box;
  line-height: 1.2;
  padding: var(--spacing-xs) var(--spacing-2xl) var(--spacing-xs) var(--spacing-sm);
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg fill='%2369B42E' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>");
  background-repeat: no-repeat;
  background-position: right var(--spacing-sm) center;
  background-size: 16px;

  &:hover {
    border: 1px solid var(--primary-color);
  }

  &:focus {
    border: 1px solid var(--primary-color);
    background-color: #ffffff;
    outline: none;
    box-shadow: inset 0 0 2px var(--primary-shadow);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  option {
    padding: var(--spacing-sm);
  }
`;

export const SelectionInfo = styled.span`
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-weight: 500;
  font-family: var(--font-family);
`;

export const RoleBadge = styled.span`
  display: inline-block;
  background-color: var(--badge-hot);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  margin-right: 4px;
  margin-bottom: 4px;
  font-family: var(--font-family);
`;

export const RolesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

// Nouveaux styled-components pour les onglets et sections catégories (basés sur les classes Tailwind utilisées)
export const TabsContainer = styled.div`
  width: 100%;
`;

export const TabsList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-light);
  padding: 0;
  margin: 0;
`;

export const TabsTrigger = styled.button`
  padding: var(--spacing-md) var(--spacing-xl);
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 2px solid transparent;
  font-family: var(--font-family);

  &:hover {
    color: var(--primary-color);
    background-color: var(--bg-tertiary);
  }

  &.active {
    color: var(--primary-color);
    border-bottom-color: var(--primary-color);
    background-color: var(--bg-primary);
  }

  @media (max-width: 768px) {
    padding: var(--spacing-sm) var(--spacing-md);
  }
`;

export const TabsContent = styled.div<{ $value?: string }>`
  padding: var(--spacing-md) 0;
  display: ${({ $value }) => ($value ? 'block' : 'none')};
`;

export const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
`;

export const CategoryContainer = styled.div`
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  margin-bottom: var(--spacing-md);
`;

export const CategoryHeader = styled.div`
  cursor: pointer;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
  transition: all 0.2s ease;
  background-color: var(--bg-secondary);
  font-weight: 600;
  font-size: var(--font-size-lg);
  font-family: var(--font-family);

  &:hover {
    background-color: var(--bg-tertiary);
  }
`;

export const CategoryTitle = styled.span`
  color: var(--text-primary);
`;

export const CategoryContent = styled.div`
  padding: var(--spacing-md);
  background-color: var(--bg-primary);
`;

export const ScaleItem = styled.div`
  border-left: 4px solid var(--primary-color);
  background-color: var(--bg-tertiary);
  padding: var(--spacing-md);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  margin-bottom: var(--spacing-sm);
`;

export const ScaleFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  font-family: var(--font-family);
`;

export const KeyValueRow = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const KeyLabel = styled.span`
  font-weight: 500;
  color: var(--text-secondary);
`;

export const ValueSpan = styled.span`
  color: var(--text-primary);
`;

export const DatesDiv = styled.div`
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  padding-top: var(--spacing-xs);
  border-top: 1px solid var(--border-light);
  margin-top: var(--spacing-xs);
`;

export const CategorySection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  padding: var(--spacing-md) 0;
`;

export const SectionHeader = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--text-primary);
  margin: var(--spacing-lg) 0 var(--spacing-sm) 0;
  font-family: var(--font-family);
  border-bottom: 2px solid var(--primary-color);
  padding-bottom: var(--spacing-xs);
`;

export const SectionSubTitle = styled.p`
  font-size: var(--font-size-md);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
  font-weight: 500;
  font-family: var(--font-family);
`;

export const StyledDivider = styled.hr`
  border: none;
  height: 1px;
  background: linear-gradient(to right, transparent, var(--border-light), transparent);
  margin: var(--spacing-md) 0;
`;

// Nouveaux composants pour les checkboxes
export const CheckboxContainer = styled.label`
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  gap: var(--spacing-xs);
  font-family: var(--font-family);
`;

export const CheckboxLabel = styled.span`
  position: relative;
  width: 16px;
  height: 16px;
  border: 2px solid var(--border-light);
  border-radius: var(--radius-sm);
  background-color: var(--bg-primary);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &::after {
    content: '✓';
    position: absolute;
    color: white;
    font-size: 12px;
    font-weight: bold;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  &:hover {
    border-color: var(--primary-color);
  }
`;

export const CheckboxInput = styled.input`
  position: absolute;
  opacity: 0;
  cursor: pointer;

  &:checked + ${CheckboxLabel} {
    background-color: var(--primary-color);
    border-color: var(--primary-color);
  }

  &:checked + ${CheckboxLabel}::after {
    opacity: 1;
  }
`;

export const ViewToggleButton = styled(ButtonSearch)<ViewToggleButtonProps>`
  background-color: ${(props) => (props.$isActive ? 'var(--primary-color)' : 'transparent')};
  color: ${(props) => (props.$isActive ? '#ffffff' : 'var(--text-color)')};
  border: ${(props) => (props.$isActive ? '1px solid var(--primary-color)' : '1px solid var(--border-color, #ddd)')};

  &:hover {
    background-color: ${(props) =>
      props.$isActive ? 'var(--primary-hover)' : 'var(--bg-secondary, #f8f9fa)'};
  }
`;

export const SortableHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  user-select: none;
  white-space: nowrap;

  &:hover {
    opacity: 0.8;
  }
`;

export const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  white-space: nowrap;
`;

export const Tooltip = styled.div`
  position: absolute;
  background-color: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 13px;
  max-width: 300px;
  word-wrap: break-word;
  z-index: 1000;
  pointer-events: none;
  white-space: normal;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

  &::before {
    content: '';
    position: absolute;
    top: -4px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-bottom: 4px solid rgba(0, 0, 0, 0.9);
  }
`;

export const TruncatedCell = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
  position: relative;
`;

export const ActionsContainer = styled.div`
  display: flex;
  gap: var(--spacing-xs);
  justify-content: center;
  align-items: center;
  flex-wrap: nowrap;
  width: 100%;
  height: 100%;
  min-height: 32px;
  padding: 4px 0;
`;

export const DateCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  height: 100%;
`;
export const ActionButton = styled.button<ActionButtonProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: ${(props) => {
    if (props.variant === 'edit') return 'var(--primary-color)';
    if (props.variant === 'cancel') return 'var(--warning-color, #ffc107)';
    if (props.variant === 'delete') return 'transparent';
    return 'transparent';
  }};
  color: ${(props) => {
    if (props.variant === 'edit') return '#ffffff';
    if (props.variant === 'cancel') return '#000000';
    if (props.variant === 'delete') return 'var(--danger-color, #dc3545)';
    return 'var(--text-color)';
  }};
  width: 32px;
  height: 32px;
  min-width: 32px;
  min-height: 32px;
  position: relative;
  z-index: 10;

  &:hover {
    opacity: 0.8;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:focus {
    outline: 2px solid ${(props) => {
      if (props.variant === 'edit') return 'var(--primary-color)';
      if (props.variant === 'cancel') return 'var(--warning-color, #ffc107)';
      if (props.variant === 'delete') return 'var(--danger-color, #dc3545)';
      return 'var(--text-color)';
    }};
    outline-offset: 2px;
  }

  svg {
    width: 16px;
    height: 16px;
    pointer-events: none;
  }
`;

export const ActionsTableCell = styled(TableCell)`
  text-align: center;
  vertical-align: middle;
  padding: 8px 4px;
  height: 100%;

  & > div {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
  }
`;

export const StatusCell = styled(TableCell)`
  vertical-align: middle;
  display: flex;
  align-items: center;
  height: 100%;
  
  & > div {
    width: 100%;
  }
`;
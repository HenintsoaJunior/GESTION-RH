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
`;

export const StatLabel = styled.div`
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  font-weight: 500;
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

export const TableTitle = styled.h2`
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
`;

export const TableRow = styled.tr<TableRowProps>`
  cursor: ${({ $clickable }) => ($clickable ? "pointer" : "default")};
  &:hover {
    background: ${({ $clickable }) => ($clickable ? "var(--bg-tertiary)" : "transparent")};
  }
`;

export const TableCell = styled.td`
  padding: var(--spacing-md);
  text-align: left;
  border-bottom: 1px solid var(--border-light);
  border-right: 1px solid var(--border-light); 
  font-size: var(--font-size-sm);
  color: var(--text-primary);

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

  border-top: none; 
  &:first-child {
    border-left: none; 
  }
  &:last-child {
    border-right: none; 
  }
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
`;

export const NoDataMessage = styled.div`
  text-align: center;
  padding: var(--spacing-md);
  color: var(--text-muted);
`;

export const StatusBadge = styled.span`
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-transform: uppercase;

  &.status-progress {
    background: #cce5ff;
    color: #004085;
  }
  &.status-pending {
    background: #fff3cd;
    color: #856404;
  }
  &.status-approved {
    background: #d4edda;
    color: #155724;
  }
  &.status-cancelled {
    background: #f8d7da;
    color: #721c24;
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

  &[type="select"],
  &[as="select"] {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    padding-right: var(--spacing-3xl);
    background: #f5f5f5
      url("data:image/svg+xml;utf8,<svg fill='%2369B42E' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>")
      no-repeat right var(--spacing-sm) center;
    background-size: 16px;
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
  font-size: var(--font-size-md);
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
`;

export const LegendNote = styled.div`
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: #e9ecef;
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  color: var(--text-muted);
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
`;

export const RolesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;
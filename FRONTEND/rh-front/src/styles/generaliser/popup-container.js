import styled, { css } from "styled-components";
import AutoCompleteInput from "components/auto-complete-input";

// Beneficiaries Table Container
export const BeneficiariesTableContainer = styled.div`
  background: var(--bg-primary);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
  overflow-x: auto;
  overflow-y: auto;
  max-height: 400px;
  margin-bottom: var(--spacing-lg);
  position: relative;

  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: var(--radius-sm);
  }

  &::-webkit-scrollbar-thumb {
    background: var(--primary-color);
    border-radius: var(--radius-sm);

    &:hover {
      background: var(--primary-hover);
    }
  }
`;

// Beneficiaries Table
export const BeneficiariesTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-xs);
  background-color: #ffffff;
  min-width: 1000px;

  & th {
    background-color: #f8f9fa;
    color: var(--text-secondary);
    font-weight: 600;
    font-size: var(--font-size-xs);
    padding: var(--spacing-md);
    text-align: left;
    border-bottom: 2px solid var(--border-light);
    white-space: nowrap;
    position: sticky;
    top: 0;
    z-index: 10;

    @media (max-width: 768px) {
      padding: var(--spacing-xs) var(--spacing-sm);
      font-size: 11px;
    }
  }

  & td {
    padding: var(--spacing-sm) var(--spacing-md);
    border-bottom: 1px solid var(--border-light);
    color: var(--text-input);
    font-size: var(--font-size-xs);
    vertical-align: middle;
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    @media (max-width: 768px) {
      padding: var(--spacing-xs) var(--spacing-sm);
      font-size: 11px;
    }

    &[title] {
      cursor: help;
    }
  }

  & tbody tr:hover {
    background-color: #f8f9fa;
  }

  & tbody tr:last-child td {
    border-bottom: none;
  }

  & .col-id {
    width: 60px;
    text-align: center;
    font-weight: 600;
  }

  & .col-beneficiary {
    min-width: 200px;
    max-width: 250px;

    @media (max-width: 768px) {
      min-width: 150px;
      max-width: 180px;
    }
  }

  & .col-matricule {
    width: 100px;
  }

  & .col-fonction {
    min-width: 150px;
    max-width: 200px;

    @media (max-width: 768px) {
      min-width: 120px;
      max-width: 150px;
    }
  }

  & .col-direction {
    min-width: 120px;
    max-width: 180px;
  }

  & .col-transport {
    width: 120px;
  }

  & .col-dates {
    width: 110px;
  }

  & .col-duree {
    width: 80px;
    text-align: center;
  }

  & .col-actions {
    width: 120px;
    text-align: center;
  }
`;

// Table Action Button
export const TableActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xs) var(--spacing-sm);
  margin: 0 2px;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: var(--font-size-xs);
  font-weight: 500;
  transition: all 0.2s ease;
  min-width: 32px;
  height: 32px;
  transform: scale(1);

  &:active {
    transform: scale(0.95);
  }

  &.edit-btn {
    background-color: #17a2b8;
    color: #ffffff;

    &:hover {
      background-color: #138496;
    }
  }

  &.delete-btn {
    background-color: var(--error-color);
    color: #ffffff;

    &:hover {
      background-color: var(--error-hover);
    }
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  & svg {
    width: 14px;
    height: 14px;

    @media (max-width: 768px) {
      width: 12px;
      height: 12px;
    }
  }
`;

// No Beneficiaries Message
export const NoBeneficiaries = styled.div`
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--text-secondary);
  font-style: italic;
  background-color: #f8f9fa;
  border: 1px dashed var(--border-light);
  border-radius: var(--radius-sm);
`;

// Date Info
export const DateInfo = styled.div`
  display: block;
  font-size: 11px;
  color: var(--text-secondary);

  & + & {
    margin-top: 2px;
  }
`;

// Duration Badge
export const DurationBadge = styled.span`
  background-color: var(--primary-color);
  color: #ffffff;
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  display: inline-block;
`;

// Popup Styles
export const PopupOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

export const PagePopup = styled.div`
  background: var(--bg-primary);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-lg);
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
`;

export const PopupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
`;

export const PopupTitle = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
`;

export const PopupClose = styled.button`
  background: none;
  border: none;
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  cursor: pointer;

  &:hover {
    color: var(--primary-color);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const PopupContent = styled.div`
  margin-bottom: var(--spacing-lg);
`;

export const PopupActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
`;

export const ButtonPrimary = styled.button`
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
  background-color: var(--primary-color);
  color: #ffffff;

  &:hover {
    background-color: var(--primary-hover);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const ButtonSecondary = styled(ButtonPrimary)`
  background-color: var(--error-color);

  &:hover {
    background-color: var(--text-muted);
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

export const FormTableContainer = styled.div`
  background: var(--bg-primary);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
  overflow-x: auto;
  overflow-y: auto;
  max-height: 600px; /* Increased height for form table */
  margin-bottom: var(--spacing-xl); /* Larger margin for better spacing */
  position: relative;
  padding: var(--spacing-md); /* Added padding for form context */
  width: 100%;
  min-width: 1200px; /* Larger minimum width for form table */

  &::-webkit-scrollbar {
    width: 8px; /* Slightly larger scrollbar */
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: var(--radius-sm);
  }

  &::-webkit-scrollbar-thumb {
    background: var(--primary-color);
    border-radius: var(--radius-sm);

    &:hover {
      background: var(--primary-hover);
    }
  }
`;

export const FormTable = styled(BeneficiariesTable)`
  min-width: 1100px; /* Slightly larger min-width for form table */
  font-size: var(--font-size-sm); /* Slightly larger font for form context */

  & th {
    padding: var(--spacing-lg); /* More padding for form headers */
    font-size: var(--font-size-sm);
  }

  & td {
    padding: var(--spacing-md) var(--spacing-lg);
    font-size: var(--font-size-sm);
    max-width: 200px; /* Increased max-width for form cells */
  }

  & .col-beneficiary {
    min-width: 250px;
    max-width: 300px;

    @media (max-width: 768px) {
      min-width: 180px;
      max-width: 220px;
    }
  }

  & .col-fonction {
    min-width: 180px;
    max-width: 250px;

    @media (max-width: 768px) {
      min-width: 150px;
      max-width: 180px;
    }
  }
`;
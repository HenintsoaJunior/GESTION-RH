import styled, { css } from "styled-components";
import AutoCompleteInput from "components/auto-complete-input";

// Styles de base partagés pour input, select, textarea et autocomplete
const formInputBaseStyles = css`
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
  &.input-error {
    border: 2px solid var(--error-color) !important;
  }
`;

// New container for input and button
export const InputButtonContainer = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  width: 100%;
`;

// Main Container
export const FormContainer = styled.div`
  font-family: var(--font-family);
  background: var(--bg-primary);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
  margin: var(--spacing-xl) auto;
  padding: var(--spacing-lg);
  max-width: 1000px;
  position: relative;
  overflow: hidden;
  @media (max-width: 768px) {
    margin: var(--spacing-md);
    padding: var(--spacing-sm);
  }
`;

// Form Header
export const TableHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-lg);
`;

export const TableIcon = styled.div`
  font-size: var(--font-size-xl);
  margin-right: var(--spacing-sm);
  color: var(--text-primary);
`;

export const TableTitle = styled.h2`
  font-size: var(--font-size-2xl);
  font-weight: 600;
  color: var(--text-primary);
`;

// Form Structure
export const GenericForm = styled.form`
  width: 100%;
`;

export const FormTable = styled.table`
  width: 100%;
  margin-top: var(--spacing-md);
  border-collapse: separate;
  border-spacing: 0 4px;
  @media (max-width: 480px) {
    display: block;
    & tr {
      display: block;
      margin-bottom: var(--spacing-sm);
    }
    & td {
      display: block;
      width: 100%;
    }
  }
`;

export const FormRow = styled.tr`
  margin-bottom: var(--spacing-sm);
  display: table-row;
  &.dual-field-row td {
    width: 50%;
    padding: var(--spacing-sm);
    @media (max-width: 768px) {
      width: 100%;
      display: block;
    }
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

export const FormLabel = styled.label`
  margin-bottom: var(--spacing-xs);
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-secondary);
  display: block;
`;

export const FormLabelRequired = styled(FormLabel)`
  &::after {
    content: " *";
    color: var(--error-color);
    margin-left: var(--spacing-xs);
  }
`;

// Input, Select, Textarea, and AutoCompleteInput Styles
export const FormInput = styled.input`
  ${formInputBaseStyles}
  flex: 1; /* Ensure input takes available space in flex container */
`;

export const FormSelect = styled.select`
  ${formInputBaseStyles}
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  padding-right: var(--spacing-3xl);
  background: #f5f5f5
    url("data:image/svg+xml;utf8,<svg fill='%2369B42E' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>")
    no-repeat right var(--spacing-sm) center;
  background-size: 16px;
  & option {
    padding: var(--spacing-md);
    line-height: 1.4;
    font-size: var(--font-size-xs);
    background: #ffffff;
    color: var(--text-input);
  }
`;

export const FormTextarea = styled.textarea`
  ${formInputBaseStyles}
  resize: vertical;
  min-height: 100px;
  height: auto;
  padding-top: var(--spacing-sm);
  &.input-error {
    border: 2px solid var(--error-color) !important;
  }
  @media (max-width: 480px) {
    min-height: 120px !important;
  }
`;

export const FormFileInput = styled.input.attrs({ type: "file" })`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: var(--spacing-xs);
  cursor: pointer;
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

// Radio Button Styles
export const FormRadio = styled.input.attrs({ type: "radio" })`
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border: 2px solid var(--border-medium);
  border-radius: 50%;
  background-color: #f5f5f5;
  cursor: pointer;
  vertical-align: middle;
  margin: 0 4px 0 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  &:checked {
    border-color: var(--primary-color);
    background-color: var(--primary-color);
    position: relative;
    &::after {
      content: "";
      width: 10px;
      height: 10px;
      background-color: #ffffff;
      border-radius: 50%;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
  &:hover {
    border-color: var(--primary-color);
  }
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 4px var(--primary-shadow);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    border-color: var(--border-light);
    background-color: #e0e0e0;
  }
  &.input-error {
    outline: 2px solid var(--error-color) !important;
  }
`;

// Form Section Header
export const FormSectionTitle = styled.h3`
  margin-top: 8px;
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
`;

// Positions Table
export const PositionsTable = styled.table`
  width: 100%;
  & th {
    text-align: left;
    font-weight: 600;
    color: var(--text-secondary);
    font-size: var(--font-size-md);
    padding: var(--spacing-xs);
  }
  & td {
    vertical-align: middle;
    font-size: var(--font-size-xs);
    padding: var(--spacing-xs);
  }
  & td input,
  & td select,
  & td textarea {
    color: var(--text-input);
  }
`;

export const RemoveItem = styled.button`
  background-color: var(--error-color);
  color: #ffffff;
  border: none;
  padding: var(--spacing-xs);
  border-radius: var(--radius-md);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  width: 32px;
  min-width: 32px;
  &:hover {
    background-color: var(--error-hover);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  & svg {
    width: 16px;
    height: 16px;
  }
`;

// Form Actions
export const FormActions = styled.div`
  text-align: center;
  padding-top: var(--spacing-lg);
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--spacing-sm);
  @media (max-width: 768px) {
    display: flex;
    justify-content: center;
    gap: var(--spacing-sm);
  }
  @media (max-width: 480px) {
    & button {
      width: 100%;
    }
  }
`;

export const SubmitButton = styled.button`
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

export const ResetButton = styled(SubmitButton)`
  background-color: var(--error-color);
  &:hover {
    background-color: var(--error-hover);
  }
`;

export const AddButton = styled(SubmitButton)`
  margin-top: var(--spacing-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  & svg {
    width: 16px;
    height: 16px;
  }
`;

// Rich Text Editor
export const RichEditorContainer = styled.div`
  width: 100%;
`;

export const QuillToolbar = styled.div`
  border-bottom: 1px solid var(--border-light) !important;
  background-color: var(--bg-secondary);
  padding: var(--spacing-sm) !important;
`;

export const QuillContainer = styled.div`
  width: 100%;
  box-sizing: border-box;
  word-break: break-word;
  white-space: normal;
`;

export const QuillEditor = styled.div`
  min-height: 180px;
  padding: var(--spacing-sm);
  font-family: var(--font-family);
  font-size: var(--font-size-xs);
  color: var(--text-input);
  &.ql-blank::before {
    color: var(--text-placeholder) !important;
    font-style: normal !important;
  }
  @media (max-width: 480px) {
    min-height: 120px !important;
  }
`;

// Autocomplete Styles
export const AutocompleteContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
`;

export const AutocompleteIcon = styled.div`
  position: absolute;
  right: var(--spacing-sm);
  top: 50%;
  transform: translateY(calc(-50% + 5px));
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  cursor: pointer;
  pointer-events: all;
  &:hover {
    color: var(--primary-color);
  }
`;

export const AutocompleteDropdown = styled.div`
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  font-size: 12px;
`;

export const AutocompleteSuggestionsContainer = styled.div`
  max-height: 150px;
  overflow-y: auto;
  &.scrollable {
    max-height: 120px;
  }
`;

export const AutocompleteSuggestion = styled.div`
  padding: 6px 10px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  font-size: 12px;
  color: var(--text-input);
  &:hover {
    background-color: #f5f5f5;
  }
  &:last-child {
    border-bottom: none;
  }
`;

export const AutocompleteAddOption = styled.div`
  border-top: 1px solid #ddd;
  background-color: #f9f9f9;
`;

export const AutocompleteAddItem = styled.div`
  padding: 6px 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  &.enabled {
    color: #69b42e;
    &:hover {
      background-color: #e7f3ff;
    }
  }
  &.disabled {
    color: #6c757d;
    cursor: not-allowed;
  }
`;

// Error Messages
export const ErrorMessage = styled.span`
  font-family: var(--font-family);
  color: var(--error-color);
  font-size: 0.875rem;
  font-weight: normal;
  margin-top: 0.25rem;
  display: block;
  text-align: left;
`;

// Beneficiaries Table
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

export const NoBeneficiaries = styled.div`
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--text-secondary);
  font-style: italic;
  background-color: #f8f9fa;
  border: 1px dashed var(--border-light);
  border-radius: var(--radius-sm);
`;

export const DateInfo = styled.div`
  display: block;
  font-size: 11px;
  color: var(--text-secondary);
  & + & {
    margin-top: 2px;
  }
`;

export const DurationBadge = styled.span`
  background-color: var(--primary-color);
  color: #ffffff;
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  display: inline-block;
`;

// Stepper Styles
export const StepperWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
  position: relative;
  &::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--border-light);
    z-index: 1;
  }
`;

export const StepItem = styled.div`
  display: flex;
  align-items: center;
  font-size: var(--font-size-md);
  font-weight: 500;
  color: var(--text-muted);
  position: relative;
  z-index: 2;
  padding: 0 var(--spacing-md);
  background: var(--bg-primary);
  span {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--border-light);
    color: var(--text-muted);
    margin-right: var(--spacing-sm);
    font-weight: 600;
  }
  ${({ active }) =>
    active &&
    css`
      color: var(--primary-color);
      span {
        background: var(--primary-color);
        color: #ffffff;
      }
    `}
`;

export const StepContent = styled.div`
  display: ${({ active }) => (active ? "block" : "none")};
`;

export const StepNavigation = styled(FormActions)`
  justify-content: space-between;
`;

export const NextButton = styled(SubmitButton)``;

export const PreviousButton = styled(SubmitButton)`
  background-color: #6c757d;
  &:hover {
    color: #000;
    background-color: var(--secondary-hover);
  }
`;
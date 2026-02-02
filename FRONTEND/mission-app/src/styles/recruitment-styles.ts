import styled from "styled-components";

export const FormFieldWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;

  & label {
    font-weight: 600;
    color: var(--text-secondary);
    font-size: var(--font-size-md);
    font-family: var(--font-family);
  }
`;


export const FiltersContent = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  align-items: flex-end;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const FieldsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr); /* poste, direction, contrat, statut, dates */
  gap: var(--spacing-md);
  flex: 1;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const ActionsContainer = styled.div`
  display: flex;
  gap: var(--spacing-sm);

  @media (max-width: 768px) {
    flex-direction: column; /* <- mettre les boutons verticalement */
    justify-content: flex-start;
    margin-top: var(--spacing-md);
  }
`;

export const ButtonText = styled.span`
  margin-left: 6px;

  @media (min-width: 1024px) {
    display: none;
  }
`;

export const DateFieldWrapper = styled.div`
.form-input {
    min-width: 200px;
    width: 100%;
    height: 32px;
    padding: var(--spacing-xs);
    font-size: var(--font-size-xs);
    font-family: var(--font-family);
    border: 1px solid var(--border-light);
    border-radius: 0;
    background-color: #f5f5f5;
    color: var(--text-input);
    box-sizing: border-box;
    line-height: 1.2;

    &:hover {
      border: 1px solid var(--primary-color);
    }

    &:focus {
      border: 1px solid var(--primary-color);
      background-color: #ffffff;
      outline: none;
      box-shadow: inset 0 0 2px var(--primary-shadow);
    }
  }
`;
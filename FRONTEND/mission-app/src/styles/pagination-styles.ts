// pagination-styles.ts
import styled, { css } from "styled-components";

interface PaginationButtonProps {
  $isActive?: boolean;
  $isArrow?: boolean;
}

export const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: var(--bg-primary, #ffffff);
  border-top: 1px solid var(--bg-light, #f5f5f5);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 14px;
  color: var(--text-color, #333);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
    padding: 12px;
  }
`;

export const PageSizeSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

export const PaginationLabel = styled.label`
  font-size: 14px;
  color: var(--text-color, #333);
`;

export const Select = styled.select`
  padding: 6px 10px;
  border: 1px solid var(--border-color, #d1d5db);
  border-radius: 4px;
  background-color: var(--bg-primary, #ffffff);
  font-size: 14px;
  color: var(--text-color, #333);
  cursor: pointer;
  appearance: none;
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

  &:focus {
    outline: none;
    border-color: var(--primary-color, #69b42e);
    box-shadow: 0 0 0 2px var(--focus-ring-color, rgba(105, 180, 46, 0.4));
  }

  &:disabled {
    background-color: var(--bg-tertiary, #fafafa);
    color: var(--text-disabled, #9ca3af);
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    padding: 4px 8px;
    font-size: 12px;
  }
`;

export const PaginationInfo = styled.div`
  font-size: 14px;
  color: var(--text-muted-color, #6b7280);

  @media (max-width: 768px) {
    text-align: center;
  }

  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

export const PaginationButtons = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;

  @media (max-width: 768px) {
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
  }
`;

export const PaginationButton = styled.button<PaginationButtonProps>`
  min-width: 32px;
  padding: 8px 12px;
  border: 1px solid var(--border-color, #d1d5db);
  background-color: var(--bg-primary, #ffffff);
  color: var(--text-color, #333);
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out, border-color 0.2s ease-in-out;
  font-size: 14px;
  line-height: 1.5;
  text-align: center;
  user-select: none;

  ${({ $isArrow }) =>
    $isArrow &&
    css`
      padding: 8px;
      font-weight: bold;
    `}

  &:hover:not(:disabled) {
    background-color: var(--bg-secondary, #f8f9fa);
    border-color: var(--border-hover-color, #b0b0b0);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--focus-ring-color, rgba(105, 180, 46, 0.4));
  }

  &:disabled {
    background-color: var(--bg-tertiary, #fafafa);
    color: var(--text-disabled, #9ca3af);
    cursor: not-allowed;
  }

  ${({ $isActive }) =>
    $isActive &&
    css`
      background-color: var(--primary-color, #69b42e);
      color: var(--text-on-primary, #ffffff);
      border-color: var(--primary-color, #69b42e);
      font-weight: 500;

      &:hover {
        background-color: var(--primary-hover, #5a9b27);
        border-color: var(--primary-hover, #5a9b27);
      }
    `}

  @media (max-width: 480px) {
    min-width: 30px;
    padding: 6px 8px;
    font-size: 12px;
  }

  ${({ $isArrow }) =>
    $isArrow &&
    css`
      @media (max-width: 480px) {
        padding: 6px;
      }
    `}
`;

export const PaginationEllipsis = styled.span`
  display: flex;
  align-items: center;
  padding: 8px 0;
  color: var(--text-muted-color, #6b7280);
  font-size: 16px;
`;
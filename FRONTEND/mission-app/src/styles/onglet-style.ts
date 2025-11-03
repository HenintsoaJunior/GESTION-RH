// src/styles/onglet-style.ts
import { css } from 'styled-components';

/**
 * Styles pour les onglets (tabs)
 * Compatible avec ton thème actuel : --primary-color (#69b42e), --text-color (#333), etc.
 * Réutilisable, accessible, responsive
 */

export const TabContainer = css`
  display: flex;
  gap: 0;
  margin-bottom: var(--spacing-md);
  border: 1px solid var(--border-color);
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

export const TabButton = css<{
  $isActive: boolean;
  $hasBorderRight: boolean;
}>`
  padding: var(--spacing-sm) var(--spacing-md);
  background: transparent;
  color: ${({ $isActive }) =>
    $isActive ? 'var(--primary-color)' : 'var(--text-color)'};
  border: none;
  border-bottom: ${({ $isActive }) =>
    $isActive ? '3px solid var(--primary-color)' : 'none'};
  border-right: ${({ $hasBorderRight }) =>
    $hasBorderRight ? '1px solid var(--border-color)' : 'none'};
  border-radius: 0;
  cursor: pointer;
  font-weight: ${({ $isActive }) =>
    $isActive ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)'};
  font-family: var(--font-family);
  font-size: var(--font-size-sm);
  white-space: nowrap;
  transition: all 0.2s ease;
  position: relative;
  outline: none;

  &:hover {
    color: var(--primary-color);
    background: var(--primary-light);
  }

  &:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: -2px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
`;
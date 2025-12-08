// status-filter.ts
import styled, { css } from 'styled-components';
import { Search } from 'lucide-react';

// Interfaces pour les props
export interface RadioOptionProps {
  $isSelected?: boolean;
  $category?: 'progress' | 'success' | 'warning' | 'error';
}

export interface StatusBadgeProps {
  $category?: 'progress' | 'success' | 'warning' | 'error';
  $color?: string;
  $clickable?: boolean;
}

export interface ToggleButtonProps {
  $isOpen?: boolean;
}

// Container principal
export const Container = styled.div`
  position: relative;
  width: 100%;
`;

// Bouton de basculement
export const ToggleButton = styled.button<ToggleButtonProps>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 32px;
  border: 1px solid var(--border-light);
  border-radius: 0;
  font-size: var(--font-size-xs);
  font-family: var(--font-family);
  background-color: var(--bg-light);
  color: var(--text-input);
  box-sizing: border-box;
  line-height: 1.2;
  padding: var(--spacing-xs) var(--spacing-md);
  padding-right: var(--spacing-xl);
  cursor: pointer;
  transition: border-color 0.15s ease-in-out, background-color 0.15s ease-in-out;

  &:hover {
    border: 1px solid var(--primary-color);
    background-color: var(--bg-secondary);
  }

  &:focus {
    border: 1px solid var(--primary-color);
    background-color: var(--bg-primary);
    outline: none;
    box-shadow: inset 0 0 2px var(--primary-shadow);
  }

  span {
    font-size: 12px;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
  }

  .badge {
    padding: 1px 6px;
    background-color: var(--primary-light);
    color: var(--primary-color);
    border-radius: var(--radius-full);
    font-size: 10px;
    font-weight: 600;
    min-width: 16px;
    text-align: center;
  }

  svg {
    width: 14px;
    height: 14px;
    color: var(--text-muted);
    transition: transform 0.15s ease-in-out;
    flex-shrink: 0;
  }

  ${({ $isOpen }) =>
    $isOpen &&
    css`
      svg {
        transform: rotate(180deg);
      }
    `}
`;

// Dropdown
export const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: var(--spacing-xs);
  width: 100%;
  max-width: 22rem;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  z-index: 50;
  overflow: hidden;
  font-family: var(--font-family);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

// Section de recherche
export const SearchSection = styled.div`
  padding: 8px;
  border-bottom: 1px solid var(--border-light);
  background-color: var(--bg-secondary);
`;

export const SearchInputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

export const SearchIcon = styled(Search)`
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 14px;
  height: 14px;
  color: var(--text-muted);
`;

export const SearchInput = styled.input`
  width: 100%;
  height: 30px;
  border: 1px solid var(--border-light);
  border-radius: 0;
  font-size: 12px;
  font-family: var(--font-family);
  background-color: var(--bg-light);
  color: var(--text-input);
  box-sizing: border-box;
  line-height: 1.2;
  padding: 6px 12px;
  padding-left: 32px;

  &:hover {
    border: 1px solid var(--primary-color);
  }

  &:focus {
    border: 1px solid var(--primary-color);
    background-color: var(--bg-primary);
    outline: none;
    box-shadow: inset 0 0 2px var(--primary-shadow);
  }
`;

// Contenu
export const Content = styled.div`
  max-height: 18rem;
  overflow-y: auto;
  padding: 8px;
`;

export const CategoryHeader = styled.div`
  padding: 6px 8px;
  font-size: 10px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
  font-family: var(--font-family);
  font-weight: 600;
  background-color: var(--bg-secondary);
  border-radius: var(--radius-sm);
`;

export const StatusList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-bottom: 10px;
`;

// Option radio
export const RadioOption = styled.label<RadioOptionProps>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  transition: all 0.15s ease-in-out;
  cursor: pointer;
  font-family: var(--font-family);
  box-sizing: border-box;

  /* Styles par défaut (non sélectionné) */
  background-color: var(--bg-secondary);
  border: 1px solid transparent;
  color: var(--text-secondary);

  &:hover {
    background-color: var(--bg-light);
    border-color: var(--border-light);
  }

  /* Styles pour les options sélectionnées par catégorie */
  ${({ $isSelected, $category }) => {
    if (!$isSelected || !$category) return '';

    const categoryColors = {
      progress: {
        bg: 'rgba(59, 130, 246, 0.15)',
        text: '#1d4ed8',
        border: 'rgba(59, 130, 246, 0.3)',
      },
      success: {
        bg: 'rgba(34, 197, 94, 0.15)',
        text: '#059669',
        border: 'rgba(34, 197, 94, 0.3)',
      },
      warning: {
        bg: 'rgba(245, 158, 11, 0.15)',
        text: '#d97706',
        border: 'rgba(245, 158, 11, 0.3)',
      },
      error: {
        bg: 'rgba(239, 68, 68, 0.15)',
        text: '#dc2626',
        border: 'rgba(239, 68, 68, 0.3)',
      },
    };

    const colors = categoryColors[$category];

    return css`
      background-color: ${colors.bg};
      color: ${colors.text};
      border: 1px solid ${colors.border};
      font-weight: 500;
    `;
  }}

  .status-label {
    flex: 1;
    text-align: left;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 12px;
  }

  input[type="radio"] {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }
`;

// Indicateur radio
export const RadioIndicator = styled.div<RadioOptionProps>`
  width: 14px;
  height: 14px;
  border: 1.5px solid;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s ease-in-out;

  /* Style par défaut (non sélectionné) */
  border-color: var(--border-light);
  background-color: var(--bg-light);

  /* Style sélectionné par catégorie */
  ${({ $isSelected, $category }) => {
    if (!$isSelected || !$category) return '';

    const categoryColors = {
      progress: '#1d4ed8',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
    };

    const color = categoryColors[$category];

    return css`
      border-color: ${color};
      background-color: ${color};

      &::after {
        content: '';
        width: 6px;
        height: 6px;
        border-radius: var(--radius-full);
        background-color: white;
      }
    `;
  }}
`;

// Pas de résultats
export const NoResults = styled.div`
  text-align: center;
  padding: 20px 0;
  color: var(--text-muted);
  font-size: 12px;
  font-family: var(--font-family);
`;

export const NoResultsSubtext = styled.div`
  font-size: 11px;
  margin-top: 4px;
`;

// Footer
export const Footer = styled.div`
  padding: 8px;
  border-top: 1px solid var(--border-light);
  display: flex;
  justify-content: flex-end;
  background-color: var(--bg-secondary);
`;

export const ClearButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-family: var(--font-family);
  font-size: 12px;
  background-color: var(--bg-light);
  color: var(--text-secondary);
  transition: all 0.15s ease-in-out;

  &:hover {
    background-color: var(--bg-secondary);
    border-color: var(--border-dark);
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

// Badge de statut
export const StatusBadge = styled.div<StatusBadgeProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  transition: all 0.2s ease;
  min-width: fit-content;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.01em;
  height: 22px;
  text-transform: none;
  border: 1px solid;

  /* Utiliser la couleur directe si fournie, sinon fallback sur les couleurs par catégorie */
  ${({ $color, $category = 'progress' }) => {
    if ($color) {
      // Utiliser la couleur directe fournie avec transparence
      return css`
        background-color: ${$color}20;
        color: ${$color};
        border-color: ${$color}40;
      `;
    }

    const categoryColors = {
      progress: {
        bg: 'rgba(59, 130, 246, 0.1)',
        text: '#1d4ed8',
        border: 'rgba(59, 130, 246, 0.3)',
      },
      success: {
        bg: 'rgba(34, 197, 94, 0.1)',
        text: '#059669',
        border: 'rgba(34, 197, 94, 0.3)',
      },
      warning: {
        bg: 'rgba(245, 158, 11, 0.1)',
        text: '#d97706',
        border: 'rgba(245, 158, 11, 0.3)',
      },
      error: {
        bg: 'rgba(239, 68, 68, 0.1)',
        text: '#dc2626',
        border: 'rgba(239, 68, 68, 0.3)',
      },
    };

    const colors = categoryColors[$category];

    return css`
      background-color: ${colors.bg};
      color: ${colors.text};
      border-color: ${colors.border};
    `;
  }}

  ${({ $clickable }) =>
    $clickable &&
    css`
      &:hover {
        opacity: 0.9;
        transform: translateY(-1px);
      }
    `}
`;

// Badge de statut pour filtre (version simplifiée)
export const FilterStatusBadge = styled.div<StatusBadgeProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  transition: all 0.2s ease;
  min-width: fit-content;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.01em;
  height: 22px;
  text-transform: none;
  border: 1px solid transparent;

  /* Couleurs par catégorie (version simplifiée) */
  ${({ $category = 'progress' }) => {
    const categoryColors = {
      progress: {
        bg: '#dbeafe',
        text: '#1e40af',
      },
      success: {
        bg: '#d1fae5',
        text: '#065f46',
      },
      warning: {
        bg: '#fef3c7',
        text: '#92400e',
      },
      error: {
        bg: '#fee2e2',
        text: '#991b1b',
      },
    };

    const colors = categoryColors[$category];

    return css`
      background-color: ${colors.bg};
      color: ${colors.text};
    `;
  }}

  ${({ $clickable }) =>
    $clickable &&
    css`
      &:hover {
        opacity: 0.9;
        transform: translateY(-1px);
      }
    `}
`;
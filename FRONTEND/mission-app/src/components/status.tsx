import { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import styled, { css } from 'styled-components';

export interface Status {
  id: string;
  label: string;
  color: string;
  category: 'progress' | 'success' | 'warning' | 'error';
}

const STATUSES: Status[] = [
  { id: 'draft', label: 'Brouillon', color: '#94a3b8', category: 'progress' },
  { id: 'pending', label: 'En attente', color: '#fbbf24', category: 'warning' },
  { id: 'in-review', label: 'En révision', color: '#60a5fa', category: 'progress' },
  { id: 'approved', label: 'Approuvé', color: '#34d399', category: 'success' },
  { id: 'rejected', label: 'Rejeté', color: '#f87171', category: 'error' },
  { id: 'in-progress', label: 'En cours', color: '#3b82f6', category: 'progress' },
  { id: 'completed', label: 'Terminé', color: '#10b981', category: 'success' },
  { id: 'cancelled', label: 'Annulé', color: '#6b7280', category: 'error' },
  { id: 'on-hold', label: 'En pause', color: '#f59e0b', category: 'warning' },
  { id: 'archived', label: 'Archivé', color: '#9ca3af', category: 'progress' },
  { id: 'scheduled', label: 'Planifié', color: '#8b5cf6', category: 'progress' },
  { id: 'urgent', label: 'Urgent', color: '#ef4444', category: 'error' },
  { id: 'blocked', label: 'Bloqué', color: '#dc2626', category: 'error' },
  { id: 'waiting-feedback', label: 'Attente feedback', color: '#fb923c', category: 'warning' },
  { id: 'validated', label: 'Validé', color: '#059669', category: 'success' },
  { id: 'deployed', label: 'Déployé', color: '#0891b2', category: 'success' },
  { id: 'testing', label: 'En test', color: '#6366f1', category: 'progress' },
  { id: 'failed', label: 'Échoué', color: '#be123c', category: 'error' },
  { id: 'backlog', label: 'Backlog', color: '#71717a', category: 'progress' },
  { id: 'ready', label: 'Prêt', color: '#22c55e', category: 'success' },
];

const statusConfig: Record<string, { color: string; category: Status['category'] }> = {
  'pending approval': { color: '#60a5fa', category: 'progress' },
  'payment in progress': { color: '#3b82f6', category: 'progress' },
  'planned': { color: '#8b5cf6', category: 'progress' },
  'in progress': { color: '#3b82f6', category: 'progress' },
  'completed': { color: '#10b981', category: 'success' },
  'closed': { color: '#10b981', category: 'success' },
  'canceled': { color: '#ef4444', category: 'error' },
  'mission rejected': { color: '#ef4444', category: 'error' },
};

interface StatusFilterProps {
  selectedStatuses: string[];
  onStatusChange: (statuses: string[]) => void;
  options?: { label: string; value: string; }[];
}

// Styled Components (adapted to match form input styles and theme variables)
const Container = styled.div`
  position: relative;
  width: 100%;
`;

const ToggleButton = styled.button<{ $isOpen: boolean }>`
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
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
  }

  .badge {
    padding: var(--spacing-2xs) var(--spacing-xs);
    background-color: var(--primary-light);
    color: var(--primary-color);
    border-radius: var(--radius-full);
    font-size: var(--font-size-2xs);
    font-weight: 600;
  }

  svg {
    width: 1rem;
    height: 1rem;
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

const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: var(--spacing-xs);
  width: 100%;
  max-width: 24rem;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  z-index: 50;
  overflow: hidden;
  font-family: var(--font-family);
`;

const SearchSection = styled.div`
  padding: var(--spacing-sm);
  border-bottom: 1px solid var(--border-light);
  background-color: var(--bg-secondary);
`;

const SearchInputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: var(--spacing-sm);
  top: 50%;
  transform: translateY(-50%);
  width: 1rem;
  height: 1rem;
  color: var(--text-muted);
`;

const SearchInput = styled.input`
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
  padding-left: var(--spacing-2xl);

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

const Content = styled.div`
  max-height: 24rem;
  overflow-y: auto;
  padding: var(--spacing-sm);
`;

const CategoryHeader = styled.div`
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: 12px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--spacing-sm);
  font-family: var(--font-family);
`;

const StatusGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-2xs);
`;

const StatusButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'isSelected' && prop !== 'color'
})<{ isSelected: boolean; color: string }>`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  transition: all 0.15s ease-in-out;
  border: 2px solid transparent;
  cursor: pointer;
  font-family: var(--font-family);
  box-sizing: border-box;

  ${({ isSelected }) =>
    isSelected
      ? css`
          background: linear-gradient(to right, var(--bg-light), var(--primary-light));
          border-color: var(--primary-color);
          span {
            color: var(--text-color);
          }
          svg {
            color: var(--primary-color);
          }
        `
      : css`
          background-color: var(--bg-secondary);
          &:hover {
            background-color: var(--bg-light);
          }
          span {
            color: var(--text-secondary);
          }
        `}

  .color-dot {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: var(--radius-full);
    flex-shrink: 0;
    background-color: ${({ color }) => color};
  }

  span {
    flex: 1;
    text-align: left;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--text-secondary);
  }

  svg {
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
  }
`;

const NoResults = styled.div`
  text-align: center;
  padding: var(--spacing-2xl) 0;
  color: var(--text-muted);
  font-size: var(--font-size-sm);
  font-family: var(--font-family);
`;

const Footer = styled.div`
  padding: var(--spacing-sm);
  border-top: 1px solid var(--border-light);
  display: flex;
  gap: var(--spacing-sm);
  background-color: var(--bg-secondary);
`;

const ActionButton = styled.button<{ variant: 'select' | 'clear' }>`
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2xs);
  padding: var(--spacing-xs) var(--spacing-md);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-family: var(--font-family);
  font-size: var(--font-size-sm);
  transition: background-color 0.15s ease-in-out;

  ${({ variant }) =>
    variant === 'select'
      ? css`
          background-color: var(--primary-light);
          color: var(--primary-color);
          &:hover {
            background-color: var(--primary-color);
            color: var(--text-white);
          }
        `
      : css`
          background-color: var(--bg-light);
          color: var(--text-secondary);
          &:hover {
            background-color: var(--bg-secondary);
          }
        `}
`;

// Individual Status Badge Component (inspired by the design in the filter)
interface StatusBadgeProps {
  status: Status;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

export const StatusBadge = ({ status, isSelected = false, onClick, className = '' }: StatusBadgeProps) => (
  <StatusButton
    isSelected={isSelected}
    color={status.color}
    onClick={onClick}
    className={className}
    as={onClick ? 'button' : 'div'}
  >
    <div className="color-dot" />
    <span>{status.label}</span>
    {isSelected && <Check />}
  </StatusButton>
);

export default function StatusFilter({ selectedStatuses, onStatusChange, options }: StatusFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  let statuses: Status[] = STATUSES;
  if (options) {
    statuses = options.map((opt) => ({
      id: opt.value,
      label: opt.label,
      ...statusConfig[opt.value] || { color: '#6b7280', category: 'error' as const },
    }));
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredStatuses = statuses.filter((status) =>
    status.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedStatuses = {
    progress: filteredStatuses.filter((s) => s.category === 'progress'),
    success: filteredStatuses.filter((s) => s.category === 'success'),
    warning: filteredStatuses.filter((s) => s.category === 'warning'),
    error: filteredStatuses.filter((s) => s.category === 'error'),
  };

  const toggleStatus = (statusId: string) => {
    if (selectedStatuses.includes(statusId)) {
      onStatusChange(selectedStatuses.filter((id) => id !== statusId));
    } else {
      onStatusChange([...selectedStatuses, statusId]);
    }
  };

  const clearAll = () => {
    onStatusChange([]);
  };

  const selectAll = () => {
    onStatusChange(statuses.map((s) => s.id));
  };

  const categoryLabels = {
    progress: 'En cours',
    success: 'Succès',
    warning: 'Attention',
    error: 'Erreur',
  };

  return (
    <Container ref={dropdownRef}>
      <ToggleButton onClick={() => setIsOpen(!isOpen)} $isOpen={isOpen}>
        <span>
          Statuts
          {selectedStatuses.length > 0 && (
            <span className="badge">{selectedStatuses.length}</span>
          )}
        </span>
        <ChevronDown />
      </ToggleButton>

      {isOpen && (
        <Dropdown>
          <SearchSection>
            <SearchInputWrapper>
              <SearchIcon />
              <SearchInput
                type="text"
                placeholder="Rechercher un statut..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchInputWrapper>
          </SearchSection>

          <Content>
            {Object.entries(groupedStatuses).map(
              ([category, statusesInCategory]) =>
                statusesInCategory.length > 0 && (
                  <div key={category}>
                    <CategoryHeader>{categoryLabels[category as keyof typeof categoryLabels]}</CategoryHeader>
                    <StatusGrid>
                      {statusesInCategory.map((status) => {
                        const isSelected = selectedStatuses.includes(status.id);
                        return (
                          <StatusButton
                            key={status.id}
                            onClick={() => toggleStatus(status.id)}
                            isSelected={isSelected}
                            color={status.color}
                          >
                            <div className="color-dot" />
                            <span>{status.label}</span>
                            {isSelected && <Check />}
                          </StatusButton>
                        );
                      })}
                    </StatusGrid>
                  </div>
                )
            )}

            {filteredStatuses.length === 0 && <NoResults>Aucun statut trouvé</NoResults>}
          </Content>

          <Footer>
            <ActionButton variant="select" onClick={selectAll}>
              Tout sélectionner
            </ActionButton>
            <ActionButton variant="clear" onClick={clearAll}>
              <X />
              Effacer
            </ActionButton>
          </Footer>
        </Dropdown>
      )}
    </Container>
  );
}
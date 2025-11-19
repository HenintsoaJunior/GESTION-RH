import { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import styled, { css } from 'styled-components';

export interface FilterItem {
  id: string;
  label: string;
  color?: string;
  category?: 'progress' | 'success' | 'warning' | 'error';
}

export interface FilterConfig {
  color?: string;
  category?: FilterItem['category'];
}

interface MultiSelectFilterProps {
  label: string; // e.g., "Statuts", "Employés", etc.
  selectedItems: string[];
  onItemChange: (items: string[]) => void;
  items?: FilterItem[]; // Full items with color and category if needed
  options?: { label: string; value: string }[]; // Fallback: simple label/value, will assign defaults if no config
  config?: Record<string, FilterConfig>; // Optional config for color/category when using options
  showBadge?: boolean; // Whether to show count badge on toggle
  maxHeight?: string; // Optional max-height for content, default '24rem'
  placeholderSearch?: string; // Placeholder for search input
  selectAllLabel?: string;
  clearAllLabel?: string;
  noResultsLabel?: string;
}

// Default items for status (kept for backward compatibility, but can be overridden)
const DEFAULT_STATUS_ITEMS: FilterItem[] = [
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

const defaultStatusConfig: Record<string, FilterConfig> = {
  'pending approval': { color: '#60a5fa', category: 'progress' },
  'payment in progress': { color: '#3b82f6', category: 'progress' },
  'indemnity paid': { color: '#34d399', category: 'success' },
  'expense note paid': { color: '#10b981', category: 'success' },
  'planned': { color: '#8b5cf6', category: 'progress' },
  'in progress': { color: '#3b82f6', category: 'progress' },
  'completed': { color: '#10b981', category: 'success' },
  'canceled': { color: '#6b7280', category: 'error' },
};

// Styled Components (unchanged, but generalized)
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

const Content = styled.div<{ $maxHeight?: string }>`
  max-height: ${({ $maxHeight }) => $maxHeight || '24rem'};
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

const ItemGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-2xs);
`;

const ItemButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'isSelected' && prop !== 'color'
})<{ isSelected: boolean; color?: string }>`
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
    background-color: ${({ color }) => color || 'var(--text-muted)'};
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

// Generalized Badge Component
interface ItemBadgeProps {
  item: FilterItem;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

export const ItemBadge = ({ item, isSelected = false, onClick, className = '' }: ItemBadgeProps) => (
  <ItemButton
    isSelected={isSelected}
    color={item.color}
    onClick={onClick}
    className={className}
    as={onClick ? 'button' : 'div'}
  >
    {item.color && <div className="color-dot" />}
    <span>{item.label}</span>
    {isSelected && <Check />}
  </ItemButton>
);

export default function MultiSelectFilter({
  label,
  selectedItems,
  onItemChange,
  items,
  options,
  config = {},
  showBadge = true,
  maxHeight = '24rem',
  placeholderSearch = 'Rechercher...',
  selectAllLabel = 'Tout sélectionner',
  clearAllLabel = 'Effacer',
  noResultsLabel = 'Aucun résultat trouvé',
}: MultiSelectFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Resolve items: prioritize passed items, fallback to options + config, or defaults
  let resolvedItems: FilterItem[] = items || DEFAULT_STATUS_ITEMS;
  if (options && options.length > 0) {
    const effectiveConfig = { ...defaultStatusConfig, ...config };
    resolvedItems = options.map((opt) => ({
      id: opt.value,
      label: opt.label,
      ...effectiveConfig[opt.value] || { color: '#6b7280' },
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

  const filteredItems = resolvedItems.filter((item) =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group by category if any items have categories
  const hasCategories = filteredItems.some((item) => item.category);
  let groupedItems: Record<string, FilterItem[]> = {};
  if (hasCategories) {
    groupedItems = {
      progress: filteredItems.filter((s) => s.category === 'progress'),
      success: filteredItems.filter((s) => s.category === 'success'),
      warning: filteredItems.filter((s) => s.category === 'warning'),
      error: filteredItems.filter((s) => s.category === 'error'),
    };
  } else {
    // Flat list under 'all' if no categories
    groupedItems = { all: filteredItems };
  }

  const toggleItem = (itemId: string) => {
    if (selectedItems.includes(itemId)) {
      onItemChange(selectedItems.filter((id) => id !== itemId));
    } else {
      onItemChange([...selectedItems, itemId]);
    }
  };

  const clearAll = () => {
    onItemChange([]);
  };

  const selectAll = () => {
    onItemChange(resolvedItems.map((s) => s.id));
  };

  const categoryLabels = {
    progress: 'En cours',
    success: 'Succès',
    warning: 'Attention',
    error: 'Erreur',
    all: '', // No header for flat list
  } as const;

  type CategoryKey = keyof typeof categoryLabels;

  const renderCategorySection = (category: string, itemsInCategory: FilterItem[]) => {
    if (itemsInCategory.length === 0) return null;
    const label = categoryLabels[category as CategoryKey];
    return (
      <div key={category}>
        {label && <CategoryHeader>{label}</CategoryHeader>}
        <ItemGrid>
          {itemsInCategory.map((item) => {
            const isSelected = selectedItems.includes(item.id);
            return (
              <ItemButton
                key={item.id}
                onClick={() => toggleItem(item.id)}
                isSelected={isSelected}
                color={item.color}
              >
                {item.color && <div className="color-dot" />}
                <span>{item.label}</span>
                {isSelected && <Check />}
              </ItemButton>
            );
          })}
        </ItemGrid>
      </div>
    );
  };

  return (
    <Container ref={dropdownRef}>
      <ToggleButton onClick={() => setIsOpen(!isOpen)} $isOpen={isOpen}>
        <span>
          {label}
          {showBadge && selectedItems.length > 0 && (
            <span className="badge">{selectedItems.length}</span>
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
                placeholder={placeholderSearch}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchInputWrapper>
          </SearchSection>

          <Content $maxHeight={maxHeight}>
            {Object.entries(groupedItems).map(([category, itemsInCategory]) =>
              renderCategorySection(category, itemsInCategory)
            )}

            {filteredItems.length === 0 && <NoResults>{noResultsLabel}</NoResults>}
          </Content>

          <Footer>
            <ActionButton variant="select" onClick={selectAll}>
              {selectAllLabel}
            </ActionButton>
            <ActionButton variant="clear" onClick={clearAll}>
              <X />
              {clearAllLabel}
            </ActionButton>
          </Footer>
        </Dropdown>
      )}
    </Container>
  );
}

// Backward compatibility export
export { MultiSelectFilter as StatusFilter };
export type { MultiSelectFilterProps as StatusFilterProps };
export { ItemBadge as StatusBadge };
export type { FilterItem as Status };
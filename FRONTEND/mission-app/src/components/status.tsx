// StatusFilter.tsx
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import * as S from '@/styles/status-filter'; 

export interface Status {
  id: string;
  label: string;
  color: string;
  category: 'progress' | 'success' | 'warning' | 'error';
}

export const STATUSES: Status[] = [
  { id: 'draft', label: 'Brouillon', color: '#94a3b8', category: 'progress' },
  { id: 'pending', label: 'En attente', color: '#fbbf24', category: 'warning' },
  { id: 'pending approval', label: 'En attente de validation', color: '#fbbf24', category: 'progress' },
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
  { id: 'canceled', label: 'Annulé', color: '#ef4444', category: 'error' },
  { id: 'payment in progress', label: 'Paiement en cours', color: '#0ea5e9', category: 'progress' },
  { id: 'planned', label: 'Planifié', color: '#8b5cf6', category: 'progress' },
  { id: 'in progress', label: 'En cours d\'exécution', color: '#3b82f6', category: 'progress' },
  { id: 'closed', label: 'Clôturé', color: '#10b981', category: 'success' },
  { id: 'mission rejected', label: 'Mission Rejeté', color: '#ef4444', category: 'error' },
  { id: 'paid', label: 'Payé', color: '#10b981', category: 'success' },
  { id: 'unpaid', label: 'Impayé', color: '#ef4444', category: 'error' },
];

export const statusConfig: Record<string, { color: string; category: Status['category'] }> = {
  'pending approval': { color: '#fbbf24', category: 'warning' },
  'payment in progress': { color: '#0ea5e9', category: 'progress' },
  'planned': { color: '#8b5cf6', category: 'progress' }, 
  'in progress': { color: '#3b82f6', category: 'progress' },
  'completed': { color: '#10b981', category: 'success' },
  'closed': { color: '#10b981', category: 'success' }, 
  'canceled': { color: '#ef4444', category: 'error' }, 
  'mission rejected': { color: '#ef4444', category: 'error' }, 
  'rejected': { color: '#be123c', category: 'error' }, 

};

interface StatusFilterProps {
  selectedStatuses: string[];
  onStatusChange: (statuses: string[]) => void;
  options?: { label: string; value: string; }[];
}

interface StatusBadgeProps {
  status: Status;
  onClick?: () => void;
  className?: string;
}

export default function StatusFilter({ selectedStatuses, onStatusChange, options }: StatusFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRadioStatus, setSelectedRadioStatus] = useState<string | null>(null);
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

  // Synchroniser la sélection radio avec le tableau selectedStatuses
  useEffect(() => {
    if (selectedStatuses.length === 1) {
      setSelectedRadioStatus(selectedStatuses[0]);
    } else if (selectedStatuses.length === 0) {
      setSelectedRadioStatus(null);
    }
  }, [selectedStatuses]);

  const filteredStatuses = statuses.filter((status) =>
    status.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedStatuses = {
    progress: filteredStatuses.filter((s) => s.category === 'progress'),
    success: filteredStatuses.filter((s) => s.category === 'success'),
    warning: filteredStatuses.filter((s) => s.category === 'warning'),
    error: filteredStatuses.filter((s) => s.category === 'error'),
  };

  const handleRadioChange = (statusId: string) => {
    if (selectedRadioStatus === statusId) {
      // Si on clique sur le même, on le désélectionne
      setSelectedRadioStatus(null);
      onStatusChange([]);
    } else {
      // Sinon on sélectionne le nouveau
      setSelectedRadioStatus(statusId);
      onStatusChange([statusId]);
    }
  };

  const clearAll = () => {
    setSelectedRadioStatus(null);
    onStatusChange([]);
    setIsOpen(false);
  };

  const categoryLabels = {
    progress: 'En cours',
    success: 'Succès',
    warning: 'Attention',
    error: 'Erreur',
  };

  const hasSelectedStatus = selectedStatuses.length > 0;

  return (
    <S.Container ref={dropdownRef}>
      <S.ToggleButton 
        onClick={() => setIsOpen(!isOpen)} 
        $isOpen={isOpen}
        type="button"
      >
        <span>
          Statuts
          {hasSelectedStatus && (
            <span className="badge">{selectedStatuses.length}</span>
          )}
        </span>
        <ChevronDown />
      </S.ToggleButton>

      {isOpen && (
        <S.Dropdown>
          <S.SearchSection>
            <S.SearchInputWrapper>
              <S.SearchIcon />
              <S.SearchInput
                type="text"
                placeholder="Rechercher un statut..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </S.SearchInputWrapper>
          </S.SearchSection>

          <S.Content>
            {Object.entries(groupedStatuses).map(
              ([category, statusesInCategory]) =>
                statusesInCategory.length > 0 && (
                  <div key={category}>
                    <S.CategoryHeader>
                      {categoryLabels[category as keyof typeof categoryLabels]} 
                      <span style={{float: 'right', fontSize: '9px'}}>
                        ({statusesInCategory.length})
                      </span>
                    </S.CategoryHeader>
                    <S.StatusList>
                      {statusesInCategory.map((status) => {
                        const isSelected = selectedRadioStatus === status.id;
                        return (
                          <S.RadioOption
                            key={status.id}
                            $isSelected={isSelected}
                            $category={status.category}
                          >
                            <input
                              type="radio"
                              name="status-filter"
                              value={status.id}
                              checked={isSelected}
                              onChange={() => handleRadioChange(status.id)}
                            />
                            <S.RadioIndicator 
                              $isSelected={isSelected}
                              $category={status.category}
                            />
                            <span className="status-label">{status.label}</span>
                          </S.RadioOption>
                        );
                      })}
                    </S.StatusList>
                  </div>
                )
            )}

            {filteredStatuses.length === 0 && (
              <S.NoResults>
                Aucun statut trouvé
                <S.NoResultsSubtext>
                  Essayez un autre terme de recherche
                </S.NoResultsSubtext>
              </S.NoResults>
            )}
          </S.Content>

          {hasSelectedStatus && (
            <S.Footer>
              <S.ClearButton onClick={clearAll}>
                <X size={12} />
                Effacer la sélection
              </S.ClearButton>
            </S.Footer>
          )}
        </S.Dropdown>
      )}
    </S.Container>
  );
}

// Composant StatusBadge exporté
export const StatusBadge = ({ status, onClick, className = '' }: StatusBadgeProps) => (
  <S.StatusBadge
    $category={status.category}
    $color={status.color}
    $clickable={!!onClick}
    onClick={onClick}
    className={className}
    title={status.label}
  >
    {status.label}
  </S.StatusBadge>
);

// Composant FilterStatusBadge exporté (version simplifiée)
export const FilterStatusBadge = ({ status, onClick, className = '' }: StatusBadgeProps) => (
  <S.FilterStatusBadge
    $category={status.category}
    $clickable={!!onClick}
    onClick={onClick}
    className={className}
    title={status.label}
  >
    {status.label}
  </S.FilterStatusBadge>
);
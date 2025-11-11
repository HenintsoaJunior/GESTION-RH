// utils/use-auto-open-modal.ts
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface AutoOpenOptions<T> {
  entityName: string; // ex: 'Lieu' pour logs/debug
  defaultPartial: Partial<T>; // Objet par défaut si params vides
  setSelectedEntity: (entity: T | Partial<T> | null) => void;
  setIsOpen: (open: boolean) => void;
}

export const useAutoOpenModal = <T>(options: AutoOpenOptions<T>) => {
  const { entityName, defaultPartial, setSelectedEntity, setIsOpen } = options;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = searchParams.get('mode');
  const [hasProcessedParams, setHasProcessedParams] = useState(false);

  useEffect(() => {
    if (hasProcessedParams || mode !== 'add') return;

    const prefillData: Partial<T> = { ...defaultPartial };
    // Récupère tous les params et mappe vers les champs (généralisé)
    searchParams.forEach((value, key) => {
      if (key !== 'mode' && value) {
        // Use Record<string, unknown> to avoid 'any'
        (prefillData as Record<string, unknown>)[key] = decodeURIComponent(value);
      }
    });

    const hasPrefillData = Object.values(prefillData).some(v => v && v.toString().trim() !== '');

    if (hasPrefillData) {
      setSelectedEntity(prefillData as T);
      setIsOpen(true);
    }

    setHasProcessedParams(true);
    
    // Nettoie l'URL après traitement (optionnel)
    navigate(window.location.pathname, { replace: true });
  }, [mode, searchParams, hasProcessedParams, setSelectedEntity, setIsOpen, defaultPartial, navigate, entityName]);
};
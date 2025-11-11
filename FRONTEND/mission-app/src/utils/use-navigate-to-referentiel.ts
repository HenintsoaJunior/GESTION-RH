// hooks/useNavigateToReferentiel.ts
import { useNavigate } from 'react-router-dom';

interface NavigateOptions {
  route: string; // ex: '/referentiel/lieu'
  fieldLabel: string; // ex: 'nom' pour le champ à pré-remplir
  value: string; // valeur saisie par l'utilisateur
}

export const useNavigateToReferentiel = () => {
  const navigate = useNavigate();

  const navigateAndPrefill = (options: NavigateOptions) => {
    const { route, fieldLabel, value } = options;
    if (!value.trim()) return; // Évite navigation si vide

    const params = new URLSearchParams({
      mode: 'add',
      [fieldLabel]: encodeURIComponent(value), // ex: nom=Paris
    });
    navigate(`${route}?${params.toString()}`);
  };

  return { navigateAndPrefill };
};
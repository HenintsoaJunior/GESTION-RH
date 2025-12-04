// hooks/useNavigateToReferentiel.ts
import { useNavigate, useLocation } from 'react-router-dom';

interface NavigateOptions {
  route: string;
  fieldLabel: string;
  value: string;
  returnUrl?: string;
  formData?: Record<string, any>; // Ajoutez les données du formulaire
}

export const useNavigateToReferentiel = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigateAndPrefill = (options: NavigateOptions) => {
    const { route, fieldLabel, value, returnUrl, formData } = options;
    
    // Sauvegarder les données du formulaire
    if (formData) {
      sessionStorage.setItem('missionFormData', JSON.stringify(formData));
      sessionStorage.setItem('missionFormOrigin', location.pathname);
    }
    
    const params = new URLSearchParams({
      fieldLabel: fieldLabel,
      initialValue: encodeURIComponent(value),
      returnUrl: returnUrl || location.pathname,
    });
    
    navigate(`${route}?${params.toString()}`);
  };

  const restoreFormData = () => {
    const savedData = sessionStorage.getItem('missionFormData');
    const origin = sessionStorage.getItem('missionFormOrigin');
    
    if (savedData && origin) {
      const parsedData = JSON.parse(savedData);
      sessionStorage.removeItem('missionFormData');
      sessionStorage.removeItem('missionFormOrigin');
      return parsedData;
    }
    return null;
  };

  return { navigateAndPrefill, restoreFormData };
};
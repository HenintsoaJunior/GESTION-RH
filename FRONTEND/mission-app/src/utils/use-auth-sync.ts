import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


export const useAuthSync = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      
      if (e.key === 'token' && e.newValue === null) {
        console.log('Déconnexion détectée dans un autre onglet');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login', { replace: true });
      }
      
      if (e.key === 'token' && e.newValue !== null && e.oldValue === null) {
        console.log('Connexion détectée dans un autre onglet');
        window.location.reload();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [navigate]);
};
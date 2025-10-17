import { Navigate } from 'react-router-dom';
import { useHasHabilitation } from "@/api/users/services";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredHabilitation: string;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredHabilitation,
  redirectTo = "/403"
}) => {
  // Récupération de l'utilisateur connecté
  const userData = typeof window !== 'undefined' 
    ? JSON.parse(localStorage.getItem("user") || "{}") 
    : {};
  const userId = userData?.userId;

  // Vérification de l'habilitation
  const hasHabilitation = useHasHabilitation(userId, requiredHabilitation);

  // Pendant le chargement : ne rien afficher
  if (hasHabilitation === undefined) {
    return null;
  }

  // Si pas d'habilitation : rediriger IMMÉDIATEMENT avec Navigate
  if (hasHabilitation === false) {
    return <Navigate to={redirectTo} replace />;
  }

  // Afficher le contenu uniquement si autorisé
  return <>{children}</>;
};

export default ProtectedRoute;
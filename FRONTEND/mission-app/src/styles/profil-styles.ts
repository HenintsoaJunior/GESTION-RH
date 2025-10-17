import styled from 'styled-components';

// =================================================================
// VARIABLES GLOBALES (Rappel)
// =================================================================

export const ProfilePageContainer = styled.div`
  font-family: var(--font-family, 'Arial, sans-serif');
  background-color: var(--bg-primary, #ffffff);
  padding: var(--spacing-4xl, 40px);
  min-height: 100vh;

  @media (max-width: 1024px) {
    padding: var(--spacing-lg, 16px);
  }
`;

export const ProfileContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: var(--spacing-3xl, 32px);

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

// =================================================================
// EN-TÊTE & AVATAR
// =================================================================

export const ProfileHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: var(--spacing-3xl, 32px);

  @media (max-width: 1024px) {
    flex-direction: row;
    align-items: flex-start;
    text-align: left;
    gap: var(--spacing-lg, 16px);
    margin-bottom: var(--spacing-xl, 24px);
  }
`;

export const ProfileAvatar = styled.div`
  width: 100px;
  height: 100px;
  background-color: var(--primary-color, #007bff);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4px solid var(--bg-primary, #ffffff);
  box-shadow: var(--shadow-md, 0 4px 6px rgba(0, 0, 0, 0.1));
  margin-bottom: var(--spacing-lg, 16px);

  @media (max-width: 1024px) {
    width: 60px;
    height: 60px;
    margin-bottom: 0;
  }
`;

export const AvatarText = styled.span`
  font-size: 3rem;
  font-weight: var(--font-weight-semibold, 600);
  color: var(--text-white, #ffffff);

  @media (max-width: 1024px) {
    font-size: 1.5rem;
  }
`;

export const ProfileHeaderInfo = styled.div`
  flex: 1;
  width: 100%;
`;

export const MainName = styled.h1`
  font-size: 1.5rem;
  font-weight: var(--font-weight-bold, 700);
  color: var(--text-primary, #333);
  margin: 0;

  @media (max-width: 1024px) {
    font-size: 1.25rem;
  }
`;

export const MainEmail = styled.p`
  font-size: var(--font-size-md, 1rem);
  color: var(--text-secondary, #666);
  margin: var(--spacing-xs, 4px) 0 0 0;
`;

// =================================================================
// CONTENEURS DE COLONNES
// =================================================================

export const SidebarColumn = styled.div`
  /* Colonne latérale */
`;

export const ContentColumn = styled.div`
  /* Colonne principale */
`;

// =================================================================
// CARTES ET INFORMATIONS
// =================================================================

export const ProfileContent = styled.div`
  /* Conteneur de contenu */
`;

export const ProfileCard = styled.div`
  background: var(--bg-primary, #ffffff);
  padding: var(--spacing-3xl, 32px);
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.1));
  margin-bottom: var(--spacing-3xl, 32px);
  border: 1px solid var(--border-light, #eee);
`;

export const KeyInfoCard = styled(ProfileCard)`
  padding: var(--spacing-2xl, 24px);
  background-color: var(--bg-primary, #eef0f3);
  text-align: center;
  border: none;
`;

export const SectionTitle = styled.h2`
  font-size: var(--font-size-xl, 1.25rem);
  font-weight: var(--font-weight-semibold, 600);
  color: var(--text-primary, #333);
  margin-bottom: var(--spacing-2xl, 24px);
  padding-bottom: var(--spacing-sm, 8px);
  border-bottom: 1px solid var(--border-light, #eee);
`;

export const InfoGroup = styled.div`
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-sm, 8px) 0;
  margin-bottom: var(--spacing-md, 12px);

  &:not(:last-child) {
    border-bottom: 1px solid var(--border-subtle, #f5f5f5);
  }
`;

export const InfoLabel = styled.label`
  font-size: var(--font-size-md, 1rem);
  font-weight: var(--font-weight-normal, 400);
  color: var(--text-secondary, #666);
  flex-shrink: 0;
  margin-right: var(--spacing-xl, 24px);
`;

export const InfoValue = styled.p`
  font-size: var(--font-size-md, 1rem);
  font-weight: var(--font-weight-medium, 500);
  color: var(--text-primary, #333);
  word-break: break-word;
  margin: 0;
  text-align: right;
`;

export const FieldEmpty = styled.span`
  color: var(--text-muted, #aaa);
  font-style: italic;
  font-weight: var(--font-weight-normal, 400);
  font-size: var(--font-size-md, 1rem);
`;

// =================================================================
// RÔLES (ANCIENS STYLES) - Gardés pour la compatibilité d'import
// =================================================================

export const RolesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm, 8px);
  margin-top: var(--spacing-xs, 4px);
`;

export const RoleBadge = styled.span`
  display: inline-flex;
  padding: var(--spacing-xs, 4px) var(--spacing-md, 12px);
  border-radius: var(--radius-lg, 12px);
  font-size: var(--font-size-sm, 0.875rem);
  font-weight: var(--font-weight-medium, 500);
  text-transform: capitalize;
  background-color: var(--primary-light, #e0f0ff);
  color: var(--primary-dark, #0056b3);
  border: 1px solid var(--primary-color, #007bff);
`;

// =================================================================
// NOUVEAUX STYLES POUR LES RÔLES ET PERMISSIONS DÉTAILLÉS (ACCORDÉON)
// =================================================================

export const RoleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md, 12px);
  margin-top: var(--spacing-sm, 8px);
`;

export const RoleDetailContainer = styled.div`
  border: 1px solid var(--border-light, #eee);
  border-radius: var(--radius-md, 8px);
  overflow: hidden;
  transition: box-shadow 0.2s ease;
  background-color: var(--bg-primary, #ffffff); 

  &:hover {
    box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.1));
  }
`;

export const RoleSummary = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md, 12px) var(--spacing-lg, 16px);
  cursor: pointer;
  background-color: var(--bg-tertiary, #f5f5f5);
  border-bottom: 1px solid var(--bg-tertiary, #eef0f3);
  
  &:hover {
    background-color: var(--bg-secondary, #eef0f3);
  }
`;

export const RoleTitle = styled.h3`
  font-size: var(--font-size-lg, 1.125rem);
  font-weight: var(--font-weight-semibold, 600);
  color: var(--primary-dark, #0056b3);
  margin: 0;
  display: flex;
  align-items: center;

  &::before {
    content: '🔑'; /* Icône clé pour le rôle */
    margin-right: var(--spacing-sm, 8px);
    font-size: var(--font-size-md, 1rem);
  }
`;


export const PermissionsList = styled.div`
  padding: var(--spacing-lg, 16px);
  background-color: var(--bg-primary, #ffffff);
`;

export const PermissionTitle = styled.p`
  font-size: var(--font-size-md, 1rem);
  font-weight: var(--font-weight-medium, 500);
  color: var(--text-primary, #333);
  margin: 0 0 var(--spacing-sm, 8px) 0;
`;

export const PermissionsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs, 6px);
`;

export const PermissionBadge = styled.span`
  display: inline-flex;
  padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
  border-radius: var(--radius-md, 8px);
  font-size: var(--font-size-sm, 0.75rem);
  font-weight: var(--font-weight-normal, 400);
  background-color: var(--bg-tertiary, #eef0f3);
  color: var(--text-secondary, #666);
  border: 1px solid var(--border-light, #e0e0e0);
  text-transform: lowercase;
`;

// =================================================================
// CHARGEMENT ET ERREUR
// =================================================================

export const LoadingContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2xl, 24px);
  padding: var(--spacing-2xl, 24px);
`;

export const LoadingSpinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid var(--border-light, #eee);
  border-top: 4px solid var(--primary-color, #007bff);
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const LoadingText = styled.p`
  font-size: var(--font-size-lg, 1.125rem);
  color: var(--text-secondary, #666);
  margin: 0;
`;

export const ErrorContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2xl, 24px);
  padding: var(--spacing-2xl, 24px);
  text-align: center;
`;

export const ErrorIcon = styled.div`
  font-size: 4rem;
  margin-bottom: var(--spacing-lg, 16px);
`;

export const ErrorText = styled.p`
  font-size: var(--font-size-xl, 1.25rem);
  color: var(--danger-color, #dc3545);
  margin: 0 0 var(--spacing-2xl, 24px) 0;
  font-weight: var(--font-weight-medium, 500);
`;

export const ErrorButton = styled.button`
  padding: var(--spacing-lg, 16px) var(--spacing-2xl, 24px);
  border: none;
  border-radius: var(--radius-md, 8px);
  cursor: pointer;
  font-weight: var(--font-weight-semibold, 600);
  font-family: var(--font-family, 'Arial, sans-serif');
  font-size: var(--font-size-md, 1rem);
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.1));
  background-color: var(--primary-color, #007bff);
  color: var(--text-white, #ffffff);
  transition: background-color 0.2s ease;

  &:hover {
    background-color: var(--primary-hover, #0056b3);
  }
`;
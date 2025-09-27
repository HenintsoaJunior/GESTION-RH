"use client";

import React, { useEffect, useState } from 'react';
import {
  ProfilePageContainer,
  ProfileContainer,
  SidebarColumn,
  ContentColumn,
  ProfileHeader,
  ProfileAvatar,
  AvatarText,
  ProfileHeaderInfo,
  MainName,
  MainEmail,
  ProfileContent,
  ProfileCard,
  KeyInfoCard,
  SectionTitle,
  InfoGroup,
  InfoLabel,
  InfoValue,
  FieldEmpty,
  // NOUVEAUX STYLES DE RÔLES/PERMISSIONS
  RoleGroup, 
  RoleDetailContainer,
  RoleSummary,
  RoleTitle,
  ExpandIcon,
  PermissionsList,
  PermissionTitle,
  PermissionsGrid,
  PermissionBadge,
  // Chargement/Erreur
  LoadingContainer,
  LoadingSpinner,
  LoadingText,
  ErrorContainer,
  ErrorIcon,
  ErrorText,
  ErrorButton,
} from 'styles/generaliser/profil-container'; 
// Assurez-vous que ce chemin et cette fonction sont valides dans votre projet
import { fetchUserInfo } from 'services/users/users'; 

// Import des icônes demandées
import { ChevronDown, Users } from "lucide-react"; 

/**
 * Composant pour afficher les détails d'un rôle et ses permissions associées.
 */
const RoleDetailCard = ({ role }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Correction: Extraire le label de l'habilitation
  const roleHabilitations = role.roleHabilitations || [];
  // Utiliser rh.habilitation.label s'il est disponible, sinon utiliser rh.habilitationId
  const permissions = roleHabilitations.map(rh => rh.habilitation?.label || rh.habilitationId);

  const handleToggle = () => setIsExpanded(!isExpanded);
  
  return (
    <RoleDetailContainer>
      <RoleSummary onClick={handleToggle}>
        {/* Utilisation de l'icône Users pour le rôle */}
        <RoleTitle><Users size={16} style={{ marginRight: '8px' }} />{role.name}</RoleTitle>
        {/* Remplacement de '▲' / '▼' par ChevronDown avec gestion de l'état */}
        <ExpandIcon $isExpanded={isExpanded}>
          <ChevronDown size={20} />
        </ExpandIcon>
      </RoleSummary>

      {isExpanded && (
        <PermissionsList>
          {/* Affichage des habilitations/permissions réelles */}
          <PermissionTitle>Permissions Associées ({permissions.length}) :</PermissionTitle>
          {permissions.length > 0 ? (
            <PermissionsGrid>
              {permissions.map((perm, pIndex) => (
                <PermissionBadge key={pIndex}>{perm}</PermissionBadge>
              ))}
            </PermissionsGrid>
          ) : (
            <FieldEmpty>Aucune permission détaillée.</FieldEmpty>
          )}
        </PermissionsList>
      )}
    </RoleDetailContainer>
  );
};


const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState({ collaborators: true });
  const [error, setError] = useState({ isOpen: false, type: '', message: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userString = localStorage.getItem('user'); 
        if (!userString) {
          setError({ isOpen: true, type: 'error', message: 'Aucun utilisateur connecté' });
          setIsLoading({ collaborators: false });
          return;
        }

        const { userId } = JSON.parse(userString);
        if (!userId) {
          setError({ isOpen: true, type: 'error', message: 'Aucun identifiant utilisateur trouvé' });
          setIsLoading({ collaborators: false });
          return;
        }

        await fetchUserInfo(
          userId,
          (collaborators) => {
            const rawUser = collaborators[0] || null;
            // Utilisation des données réelles, sans simulation
            setUser(rawUser);
            setIsLoading({ collaborators: false });
          },
          setIsLoading,
          setError
        );
      } catch (err) {
        setError({ isOpen: true, type: 'error', message: 'Erreur lors du chargement du profil' });
        setIsLoading({ collaborators: false });
      }
    };

    fetchData();
  }, []);

  if (isLoading.collaborators) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>Chargement du profil...</LoadingText>
      </LoadingContainer>
    );
  }

  if (error.isOpen || !user) {
    const errorMessage = error.isOpen ? error.message : 'Profil utilisateur introuvable.';
    return (
      <ErrorContainer>
        <ErrorIcon>⚠️</ErrorIcon>
        <ErrorText>{errorMessage}</ErrorText>
        <ErrorButton onClick={() => window.location.reload()}>
          Actualiser
        </ErrorButton>
      </ErrorContainer>
    );
  }

  const userRoles = user.roles || [];
  const notSpecified = 'Non spécifié';

  const displayValue = (value) => (
    value ? <InfoValue>{value}</InfoValue> : <FieldEmpty>{notSpecified}</FieldEmpty>
  );

  return (
    <ProfilePageContainer>
      <ProfileContainer>
        <SidebarColumn>
          <ProfileHeader>
            <ProfileAvatar>
              <AvatarText>
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </AvatarText>
            </ProfileAvatar>
            <ProfileHeaderInfo>
              <MainName>{user.name || notSpecified}</MainName>
            </ProfileHeaderInfo>
          </ProfileHeader>

          <KeyInfoCard>
            <SectionTitle>Clés de Poste</SectionTitle>
            <InfoGroup>
              <InfoLabel>Poste</InfoLabel>
              {displayValue(user.position)}
            </InfoGroup>
            <InfoGroup>
              <InfoLabel>Matricule</InfoLabel>
              {displayValue(user.matricule)}
            </InfoGroup>
            <InfoGroup>
              <InfoLabel>Supérieur</InfoLabel>
              {displayValue(user.superiorName)}
            </InfoGroup>
          </KeyInfoCard>
        </SidebarColumn>

        <ContentColumn>
          <ProfileContent>
            <ProfileCard>
              <SectionTitle>Détails de l'Organisation</SectionTitle>
              <InfoGroup>
                <InfoLabel>Département</InfoLabel>
                {displayValue(user.department)}
              </InfoGroup>
              <InfoGroup>
                <InfoLabel>Email</InfoLabel>
                {displayValue(user.email)}
              </InfoGroup>
            </ProfileCard>

            {/* DESIGN INTERACTIF POUR RÔLES ET PERMISSIONS */}
            <ProfileCard>
              <SectionTitle>Rôles et Permissions</SectionTitle>
              {userRoles.length > 0 ? (
                <RoleGroup>
                  {userRoles.map((userRole, index) => (
                    <RoleDetailCard key={index} role={userRole.role} />
                  ))}
                </RoleGroup>
              ) : (
                <FieldEmpty>{notSpecified}</FieldEmpty>
              )}
            </ProfileCard>

          </ProfileContent>
        </ContentColumn>
      </ProfileContainer>
    </ProfilePageContainer>
  );
};

export default ProfilePage;
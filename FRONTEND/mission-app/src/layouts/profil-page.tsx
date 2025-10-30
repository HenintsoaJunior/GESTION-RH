"use client";

import { useEffect, useState, useMemo } from 'react';
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
  SectionTitle,
  InfoGroup,
  InfoLabel,
  InfoValue,
  FieldEmpty,
  RolesContainer,
  RoleBadge,
  StatusBadge,
  StatusToggleContainer, 
  StatusToggleButton,
} from '@/styles/profil-styles'; 
import { useUserInfo, useUserAvailability, useUpdateUserAvailability } from '@/api/users/services';

interface Role {
  role: {
    name: string;
  };
}

interface User {
  name?: string;
  email?: string;
  position?: string;
  matricule?: string;
  superiorName?: string;
  department?: string;
  roles?: Role[];
  status?: 'disponible' | 'absent';
}

const ProfilePage = () => {
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [currentStatus, setCurrentStatus] = useState<'disponible' | 'absent'>('disponible');

  useEffect(() => {
    const fetchUserId = () => {
      try {
        const userString = localStorage.getItem('user'); 
        if (!userString) {
          return;
        }

        const parsedUser = JSON.parse(userString);
        if (parsedUser.userId) {
          setUserId(parsedUser.userId);
        }
      } catch (err) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', err);
      }
    };

    fetchUserId();
  }, []);

  const { data: userInfosResponse } = useUserInfo(userId);
  const { data: availabilityResponse } = useUserAvailability(userId);
  const { mutate: updateStatus } = useUpdateUserAvailability();

  const user = useMemo(() => userInfosResponse?.data?.[0] || null, [userInfosResponse]) as User | null;

  const fetchedStatus = availabilityResponse?.data?.status || 'disponible';

  useEffect(() => {
    setCurrentStatus(fetchedStatus as 'disponible' | 'absent');
  }, [fetchedStatus]);

  const userRoles = user?.roles || [];
  const notSpecified = 'Non spécifié';

  const displayValue = (value: string | undefined) => (
    value ? <InfoValue>{value}</InfoValue> : <FieldEmpty>{notSpecified}</FieldEmpty>
  );

  // Fonction pour afficher le badge de statut
  const displayStatus = (status: 'disponible' | 'absent') => (
    <StatusBadge variant={status}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </StatusBadge>
  );

  // Fonction pour toggler le statut
  const toggleStatus = () => {
    if (!userId) return;
    const newStatus = currentStatus === 'disponible' ? 'absent' : 'disponible';
    updateStatus({ userId, status: newStatus });
  };

  return (
    <ProfilePageContainer>
      <ProfileContainer>
        <SidebarColumn>
          <ProfileHeader>
            <ProfileAvatar>
              <AvatarText>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </AvatarText>
            </ProfileAvatar>
            <ProfileHeaderInfo>
              <MainName>{user?.name || notSpecified}</MainName>
              <MainEmail>{user?.email || notSpecified}</MainEmail>
            </ProfileHeaderInfo>
          </ProfileHeader>

          {/* Nouvelle carte dédiée au statut, positionnée en haut de la sidebar pour une meilleure visibilité */}
          <ProfileCard>
            <SectionTitle>Statut</SectionTitle>
            <StatusToggleContainer>
              {displayStatus(currentStatus)}
              <StatusToggleButton onClick={toggleStatus}>
                Modifier
              </StatusToggleButton>
            </StatusToggleContainer>
          </ProfileCard>

          <ProfileCard>
            <SectionTitle>Rôles</SectionTitle>
            {userRoles.length > 0 ? (
              <RolesContainer>
                {userRoles.map((userRole: Role, index: number) => (
                  <RoleBadge key={index}>{userRole.role.name}</RoleBadge>
                ))}
              </RolesContainer>
            ) : (
              <FieldEmpty>{notSpecified}</FieldEmpty>
            )}
          </ProfileCard>
        </SidebarColumn>

        <ContentColumn>
          <ProfileContent>
            <ProfileCard>
              <SectionTitle>Clés de Poste</SectionTitle>
              <InfoGroup>
                <InfoLabel>Poste</InfoLabel>
                {displayValue(user?.position)}
              </InfoGroup>
              <InfoGroup>
                <InfoLabel>Matricule</InfoLabel>
                {displayValue(user?.matricule)}
              </InfoGroup>
              <InfoGroup>
                <InfoLabel>Supérieur</InfoLabel>
                {displayValue(user?.superiorName)}
              </InfoGroup>
            </ProfileCard>

            <ProfileCard>
              <SectionTitle>Détails de l'Organisation</SectionTitle>
              <InfoGroup>
                <InfoLabel>Département</InfoLabel>
                {displayValue(user?.department)}
              </InfoGroup>
            </ProfileCard>
          </ProfileContent>
        </ContentColumn>
      </ProfileContainer>
    </ProfilePageContainer>
  );
};

export default ProfilePage;
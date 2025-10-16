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
  KeyInfoCard,
  SectionTitle,
  InfoGroup,
  InfoLabel,
  InfoValue,
  FieldEmpty,
  // STYLES POUR LES RÔLES SIMPLES
  RolesContainer,
  RoleBadge,
} from '@/styles/profil-styles'; 
// Import du hook React Query pour les infos utilisateur
import { useUserInfo } from '@/api/users/services';

const ProfilePage = () => {
  const [userId, setUserId] = useState<string | undefined>(undefined);

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

  const user = useMemo(() => userInfosResponse?.data?.[0] || null, [userInfosResponse]);

  const userRoles = user?.roles || [];
  const notSpecified = 'Non spécifié';

  const displayValue = (value: string | undefined) => (
    value ? <InfoValue>{value}</InfoValue> : <FieldEmpty>{notSpecified}</FieldEmpty>
  );

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

          <KeyInfoCard>
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
          </KeyInfoCard>
        </SidebarColumn>

        <ContentColumn>
          <ProfileContent>
            <ProfileCard>
              <SectionTitle>Détails de l'Organisation</SectionTitle>
              <InfoGroup>
                <InfoLabel>Département</InfoLabel>
                {displayValue(user?.department)}
              </InfoGroup>
            </ProfileCard>

            {/* AFFICHAGE SIMPLE DES RÔLES SANS LISTE DÉROULANTE */}
            <ProfileCard>
              <SectionTitle>Rôles</SectionTitle>
              {userRoles.length > 0 ? (
                <RolesContainer>
                  {userRoles.map((userRole: any, index: number) => (
                    <RoleBadge key={index}>{userRole.role.name}</RoleBadge>
                  ))}
                </RolesContainer>
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
"use client"

import React, { useEffect, useState } from 'react';
import {
  ProfilePageContainer,
  ProfileContainer,
  ProfileHeader,
  ProfileAvatar,
  AvatarText,
  ProfileHeaderInfo,
  ProfileTitle,
  ProfileSubtitle,
  ProfileContent,
  ProfileGrid,
  ProfileField,
  FieldHeader,
  FieldIcon,
  FieldLabel,
  FieldValue,
  FieldEmpty,
  LoadingContainer,
  LoadingSpinner,
  LoadingText,
  ErrorContainer,
  ErrorIcon,
  ErrorText,
  ErrorButton
} from 'styles/generaliser/profil-container';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>Chargement du profil...</LoadingText>
      </LoadingContainer>
    );
  }

  if (!user) {
    return (
      <ErrorContainer>
        <ErrorIcon>⚠️</ErrorIcon>
        <ErrorText>Aucun utilisateur connecté</ErrorText>
        <ErrorButton onClick={() => window.location.reload()}>
          Actualiser
        </ErrorButton>
      </ErrorContainer>
    );
  }

  const userRoles = user.roles?.map(role => role.roleName).join(", ") || "Non spécifié";

  const profileFields = [
    { label: 'Nom complet', value: user.name, icon: '👤' },
    { label: 'Email', value: user.email, icon: '📧' },
    { label: 'Département', value: user.department, icon: '🏢' },
    { label: 'Rôles', value: userRoles, icon: '👥' }
  ];

  return (
    <ProfilePageContainer>
      <ProfileContainer>
        <ProfileHeader>
          <ProfileAvatar>
            <AvatarText>
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </AvatarText>
          </ProfileAvatar>
          <ProfileHeaderInfo>
            <ProfileTitle>Profil Utilisateur</ProfileTitle>
            <ProfileSubtitle>Informations personnelles et professionnelles</ProfileSubtitle>
          </ProfileHeaderInfo>
        </ProfileHeader>
        <ProfileContent>
          <ProfileGrid>
            {profileFields.map((field, index) => (
              <ProfileField key={index}>
                <FieldHeader>
                  <FieldIcon>{field.icon}</FieldIcon>
                  <FieldLabel>{field.label}</FieldLabel>
                </FieldHeader>
                <FieldValue>
                  {field.value || (
                    <FieldEmpty>Non spécifié</FieldEmpty>
                  )}
                </FieldValue>
              </ProfileField>
            ))}
          </ProfileGrid>
        </ProfileContent>
      </ProfileContainer>
    </ProfilePageContainer>
  );
};

export default ProfilePage;
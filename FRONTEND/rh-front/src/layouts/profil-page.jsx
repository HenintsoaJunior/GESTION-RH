"use client"

import React, { useEffect, useState } from 'react';

import 'styles/profile-page.css'; // Import your CSS styles

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Récupérer les données utilisateur depuis localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Chargement du profil...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <p className="error-text">Aucun utilisateur connecté</p>
        <button className="error-button" onClick={() => window.location.reload()}>
          Actualiser
        </button>
      </div>
    );
  }

  // Derive roles for display by joining roleNames
  const userRoles = user.roles?.map(role => role.roleName).join(", ") || "Non spécifié";

  const profileFields = [
    { label: 'Nom complet', value: user.name, icon: '👤' },
    { label: 'Identifiant utilisateur', value: user.userId, icon: '🆔' },
    { label: 'Email', value: user.email, icon: '📧' },
    { label: 'Département', value: user.department, icon: '🏢' },
    { label: 'Type d\'utilisateur', value: user.userType, icon: '🔐' },
    { label: 'Rôles', value: userRoles, icon: '👥' }
  ];

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            <span className="avatar-text">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </span>
          </div>
          <div className="profile-header-info">
            <h1 className="profile-title">Profil Utilisateur</h1>
            <p className="profile-subtitle">Informations personnelles et professionnelles</p>
          </div>
        </div>

        {/* Content */}
        <div className="profile-content">
          <div className="profile-grid">
            {profileFields.map((field, index) => (
              <div key={index} className="profile-field">
                <div className="field-header">
                  <span className="field-icon">{field.icon}</span>
                  <label className="field-label">{field.label}</label>
                </div>
                <div className="field-value">
                  {field.value || (
                    <span className="field-empty">Non spécifié</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
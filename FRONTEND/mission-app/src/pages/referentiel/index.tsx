"use client";
import React from "react";
import { ArrowLeft, Building2, Building, Settings, Layers, FileSignature, Truck, User, Users, MapPin, Map, Receipt, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  ContentArea,
  SectionTitle,
  PageHeader,
  HeaderLeft,
  BtnBack,
  HeaderCenter,
  HeaderTitleSection,
  PageTitle,
  PageSubtitle,
  Separator,
  InfoGrid,
  InfoItem,
  InfoLabel,
  InfoValue,
} from "@/styles/detailsmission-styles"; 

import styled from "styled-components";

const ReferentielButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-left: 2px solid var(--primary-color); // Vertical line to the left of each button

  &:hover {
    background-color: var(--primary-light, #e0f0ff);
    border-color: var(--primary-color, #007bff);
  }
`;

const ReferentielGrid = styled(InfoGrid)`
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
`;

const Referentiel: React.FC = () => {
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    navigate(-1); 
  };

  const handleNavigateToDirection = () => {
    navigate('/referentiel/direction'); 
  };

  const handleNavigateToDepartement = () => {
    navigate('/referentiel/department');
  };

  const handleNavigateToService = () => {
    navigate('/referentiel/service');
  };

  const handleNavigateToUnit = () => {
    navigate('/referentiel/unit');
  };

  const handleNavigateToTransport = () => {
    navigate('/referentiel/transport');
  };

  const handleNavigateToGenders = () => {
    navigate('/referentiel/genders');
  };

  const handleNavigateToContract = () => {
    navigate('/referentiel/contract');
  };

  const handleNavigateToCollaborateur = () => {
    navigate('/referentiel/collaborator');
  };

  const handleNavigateToSite = () => {
    navigate('/referentiel/site');
  };

  const handleNavigateToLieu = () => {
    navigate('/referentiel/lieu');
  };

  const handleNavigateToExpenseType = () => {
    navigate('/referentiel/compensation-scale');
  };


  const handleNavigateToGeoZone = () => {
    navigate('/referentiel/geo-zone');
  };

  return (
    <ContentArea>
      <PageHeader>
        <HeaderLeft>
          <BtnBack onClick={handleBackToDashboard} title="Retour au tableau de bord">
            <ArrowLeft className="w-5 h-5" />
          </BtnBack>
        </HeaderLeft>
        <HeaderCenter>
          <HeaderTitleSection>
            <PageTitle>Référentiel</PageTitle>
            <PageSubtitle>Gestion des entités de référence</PageSubtitle>
          </HeaderTitleSection>
        </HeaderCenter>
      </PageHeader>
      <Separator />
      <SectionTitle>Entités de Référence</SectionTitle>
      <ReferentielGrid>
        <InfoItem as={ReferentielButton} onClick={handleNavigateToDirection}>
          <Building2 className="mx-auto mb-2 w-6 h-6 text-gray-400" />
          <InfoLabel>Direction</InfoLabel>
          <InfoValue>
            <span>Gérer les directions</span>
          </InfoValue>
        </InfoItem>
        <InfoItem as={ReferentielButton} onClick={handleNavigateToDepartement}>
          <Building className="mx-auto mb-2 w-6 h-6 text-gray-400" />
          <InfoLabel>Département</InfoLabel>
          <InfoValue>
            <span>Gérer les départements</span>
          </InfoValue>
        </InfoItem>
        <InfoItem as={ReferentielButton} onClick={handleNavigateToService}>
          <Settings className="mx-auto mb-2 w-6 h-6 text-gray-400" />
          <InfoLabel>Service</InfoLabel>
          <InfoValue>
            <span>Gérer les services</span>
          </InfoValue>
        </InfoItem>

        <InfoItem as={ReferentielButton} onClick={handleNavigateToUnit}>
          <Layers className="mx-auto mb-2 w-6 h-6 text-gray-400" />
          <InfoLabel>Unité</InfoLabel>
          <InfoValue>
            <span>Gérer les unités</span>
          </InfoValue>
        </InfoItem>

        <InfoItem as={ReferentielButton} onClick={handleNavigateToContract}>
          <FileSignature className="mx-auto mb-2 w-6 h-6 text-gray-400" />
          <InfoLabel>Type de contrat</InfoLabel>
          <InfoValue>
            <span>Gérer les types de contrats</span>
          </InfoValue>
        </InfoItem>

        <InfoItem as={ReferentielButton} onClick={handleNavigateToTransport}>
          <Truck className="mx-auto mb-2 w-6 h-6 text-gray-400" />
          <InfoLabel>Transport</InfoLabel>
          <InfoValue>
            <span>Gérer les transports</span>
          </InfoValue>
        </InfoItem>

        <InfoItem as={ReferentielButton} onClick={handleNavigateToGenders}>
          <User className="mx-auto mb-2 w-6 h-6 text-gray-400" />
          <InfoLabel>Genre</InfoLabel>
          <InfoValue>
            <span>Gérer les genres</span>
          </InfoValue>
        </InfoItem>

        <InfoItem as={ReferentielButton} onClick={handleNavigateToCollaborateur}>
          <Users className="mx-auto mb-2 w-6 h-6 text-gray-400" />
          <InfoLabel>Collaborateur</InfoLabel>
          <InfoValue>
            <span>Gérer les collaborateurs</span>
          </InfoValue>
        </InfoItem>
        <InfoItem as={ReferentielButton} onClick={handleNavigateToSite}>
          <MapPin className="mx-auto mb-2 w-6 h-6 text-gray-400" />
          <InfoLabel>Site</InfoLabel>
          <InfoValue>
            <span>Gérer les sites</span>
          </InfoValue>
        </InfoItem>
        <InfoItem as={ReferentielButton} onClick={handleNavigateToLieu}>
          <Map className="mx-auto mb-2 w-6 h-6 text-gray-400" />
          <InfoLabel>Lieu</InfoLabel>
          <InfoValue>
            <span>Gérer les lieux</span>
          </InfoValue>
        </InfoItem>
        <InfoItem as={ReferentielButton} onClick={handleNavigateToGeoZone}>
          <Globe className="mx-auto mb-2 w-6 h-6 text-gray-400" />
          <InfoLabel>Zone</InfoLabel>
          <InfoValue>
            <span>Gérer les zones</span>
          </InfoValue>
        </InfoItem>
        <InfoItem as={ReferentielButton} onClick={handleNavigateToExpenseType}>
          <Receipt className="mx-auto mb-2 w-6 h-6 text-gray-400" />
          <InfoLabel>Type de dépense</InfoLabel>
          <InfoValue>
            <span>Gérer les types de dépenses</span>
          </InfoValue>
        </InfoItem>
      </ReferentielGrid>
      <Separator />
      {/* Optional: Add more sections if needed, like general info or comments, but keeping it minimal as per request */}
    </ContentArea>
  );
};

export default Referentiel;
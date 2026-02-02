import React from 'react';
import styled from 'styled-components';

const HomeContainer = styled.div`
  font-family: var(--font-family);
  background: var(--bg-primary);
  min-height: 100vh;
  padding: var(--spacing-xl);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--text-primary);

  @media (max-width: 768px) {
    padding: var(--spacing-md);
  }
`;

const HeroSection = styled.section`
  margin-bottom: var(--spacing-2xl);
`;

const HeroTitle = styled.h1`
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
  font-family: var(--font-family);
`;

const HeroSubtitle = styled.p`
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xl);
  font-family: var(--font-family);
  max-width: 600px;
  line-height: 1.6;
`;

const AboutSection = styled.section`
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-2xl);
  max-width: 800px;
  width: 100%;
  margin-top: var(--spacing-xl);

  @media (max-width: 768px) {
    padding: var(--spacing-lg);
    margin-top: var(--spacing-lg);
  }
`;

const SectionTitle = styled.h2`
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-lg);
  font-family: var(--font-family);
  border-bottom: 2px solid var(--primary-color);
  padding-bottom: var(--spacing-sm);
  text-align: left;
`;

const AboutContent = styled.div`
  text-align: left;
  font-size: var(--font-size-md);
  color: var(--text-secondary);
  line-height: 1.6;
  font-family: var(--font-family);

  p {
    margin-bottom: var(--spacing-md);
  }
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
  margin-top: var(--spacing-xl);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
`;

const FeatureCard = styled.div`
  background: var(--bg-primary);
  border-left: 4px solid var(--primary-color);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
`;

const FeatureTitle = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
  font-family: var(--font-family);
`;

const FeatureDescription = styled.p`
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-family: var(--font-family);
`;

const Home: React.FC = () => {
  return (
    <HomeContainer>
      <HeroSection>
        <HeroTitle>Bienvenue sur la Plateforme de Portail RH 🏠</HeroTitle>
        <HeroSubtitle>
          Solution complète pour digitaliser et optimiser le processus de gestion des missions professionnelles et recrutements de Ravinala Airports.
        </HeroSubtitle>
      </HeroSection>

      <AboutSection>
        <SectionTitle>À propos de l'application</SectionTitle>
        <AboutContent>
          <p>
            Cette application web a été développée dans le cadre de la digitalisation du processus de gestion des missions chez Ravinala Airports. Elle centralise et automatise l'ensemble du cycle de vie d'une mission, de la demande initiale jusqu'au paiement des indemnités.
          </p>
          <p>
            Construite avec React et ASP.NET Core Web API, la plateforme offre une interface intuitive permettant de créer des missions, suivre leur validation en temps réel, générer automatiquement les documents officiels (ordres de mission, indemnités) et gérer les paiements avec traçabilité complète.
          </p>
          <p>
            Grâce à son système de notifications automatiques et ses tableaux de bord interactifs, l'application a considérablement réduit les retards de traitement et amélioré la coordination entre les collaborateurs, les valideurs et le service de trésorerie.
          </p>
        </AboutContent>

        <FeaturesGrid>
          <FeatureCard>
            <FeatureTitle>Gestion Centralisée</FeatureTitle>
            <FeatureDescription>
              Créez, planifiez et suivez vos missions depuis une interface unique avec validation multi-niveaux.
            </FeatureDescription>
          </FeatureCard>
          <FeatureCard>
            <FeatureTitle>Automatisation Complète</FeatureTitle>
            <FeatureDescription>
              Calcul automatique des indemnités, génération de documents PDF et notifications en temps réel.
            </FeatureDescription>
          </FeatureCard>
          <FeatureCard>
            <FeatureTitle>Tableaux de Bord</FeatureTitle>
            <FeatureDescription>
              Visualisez les statistiques, suivez les KPI et consultez l'état financier des missions en un coup d'œil.
            </FeatureDescription>
          </FeatureCard>
        </FeaturesGrid>
      </AboutSection>
    </HomeContainer>
  );
};

export default Home;
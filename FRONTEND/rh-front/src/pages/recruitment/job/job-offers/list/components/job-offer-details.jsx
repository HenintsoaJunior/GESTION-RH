"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import styled from "styled-components";
import { fetchJobOfferById } from "services/recruitment/job/job-offers/services";
import {
  PopupOverlay,
  PopupContainer,
  PopupHeader,
  PopupTitle,
  CloseButton,
  PopupContent,
  LoadingContainer,
  ContentArea,
} from "styles/generaliser/details-mission-container";
import { formatDate } from "utils/dateConverter";

// Styled components for details section
const ValidatorCard = styled.div`
  background: var(--background-white, #fff);
  border: 1px solid var(--border-light, #dee2e6);
  border-radius: var(--border-radius, 6px);
  padding: 20px;
  margin-bottom: 20px;
`;
const ValidatorSection = styled.div`
  display: flex;
  flex-direction: column;
`;
const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #495057;
  margin-bottom: 15px;
`;
const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  padding: 15px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background-color: #f8f9fa;
`;
const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
`;
const InfoLabel = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #6c757d;
  margin-bottom: 8px;
`;
const InfoValue = styled.p`
  font-size: 14px;
  font-weight: normal;
  color: #495057;
`;
// Styled components for error modal
const ErrorModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;
const ErrorModalContainer = styled.div`
  background: #fff;
  padding: 20px;
  border-radius: 6px;
  max-width: 400px;
  width: 90%;
`;
const ErrorModalTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #dc3545;
  margin-bottom: 15px;
`;
const ErrorModalMessage = styled.p`
  font-size: 14px;
  font-weight: normal;
  color: #495057;
  margin-bottom: 10px;
`;
const ErrorModalButtonSection = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  gap: 10px;
`;
const ErrorModalButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  color: white;
  background-color: #007bff;
  cursor: pointer;
  &:hover {
    background-color: #0056b3;
  }
`;

const JobOfferDetails = ({ offerId, isOpen, onClose }) => {
  const [offer, setOffer] = useState(null);
  const [isLoading, setIsLoading] = useState({ jobOffer: false });
  const [errorModal, setErrorModal] = useState({ isOpen: false, type: "", message: "" });

  useEffect(() => {
    if (isOpen && offerId) {
      const fetchOffer = async () => {
        await fetchJobOfferById(
          offerId,
          setOffer,
          setIsLoading,
          () => {}, // Ignore success notification
          (notification) => {
            // Error callback
            setErrorModal(notification);
          }
        );
      };
      fetchOffer();
    }
  }, [offerId, isOpen]);

  const closeErrorModal = () => {
    setErrorModal({ ...errorModal, isOpen: false });
  };

  const handleClose = () => {
    if (onClose) onClose();
  };

  if (!isOpen || !offerId) return null;

  const isLoadingData = isLoading.jobOffer;

  return (
    <PopupOverlay role="dialog" aria-labelledby="job-offer-details-title" aria-modal="true">
      <PopupContainer>
        <PopupHeader>
          <PopupTitle id="job-offer-details-title">
            Détails de l'Offre d'Emploi {offerId || "Inconnue"}
          </PopupTitle>
          <CloseButton onClick={handleClose} disabled={isLoadingData} aria-label="Fermer la fenêtre">
            <X size={24} />
          </CloseButton>
        </PopupHeader>
        <PopupContent>
          {/* Error Modal */}
          {errorModal.isOpen && errorModal.type === "error" && (
            <ErrorModalOverlay>
              <ErrorModalContainer>
                <ErrorModalTitle>Erreur</ErrorModalTitle>
                <ErrorModalMessage>{errorModal.message}</ErrorModalMessage>
                <ErrorModalButtonSection>
                  <ErrorModalButton onClick={closeErrorModal}>OK</ErrorModalButton>
                </ErrorModalButtonSection>
              </ErrorModalContainer>
            </ErrorModalOverlay>
          )}
          {isLoadingData ? (
            <LoadingContainer>Chargement des informations de l'offre d'emploi...</LoadingContainer>
          ) : (
            <ContentArea>
              {offer ? (
                <>
                  <ValidatorCard>
                    <ValidatorSection>
                      <SectionTitle>Détails de l'Offre d'Emploi</SectionTitle>
                      <InfoGrid>
                        <InfoItem>
                          <InfoLabel>ID de l'Offre</InfoLabel>
                          <InfoValue>{offer.offerId || "Non spécifié"}</InfoValue>
                        </InfoItem>
                        <InfoItem>
                          <InfoLabel>Poste</InfoLabel>
                          <InfoValue>{offer.title || "Non spécifié"}</InfoValue>
                        </InfoItem>
                        <InfoItem>
                          <InfoLabel>Description</InfoLabel>
                          <InfoValue dangerouslySetInnerHTML={{ __html: offer.description || "Non spécifié" }} />
                        </InfoItem>
                        <InfoItem>
                          <InfoLabel>Attributions</InfoLabel>
                          <InfoValue>{offer.attributions || "Non spécifié"}</InfoValue>
                        </InfoItem>
                        <InfoItem>
                          <InfoLabel>Formation Requise</InfoLabel>
                          <InfoValue>{offer.requiredEducation || "Non spécifié"}</InfoValue>
                        </InfoItem>
                        <InfoItem>
                          <InfoLabel>Expérience Requise</InfoLabel>
                          <InfoValue>{offer.requiredExperience || "Non spécifié"}</InfoValue>
                        </InfoItem>
                        <InfoItem>
                          <InfoLabel>Qualités Personnelles</InfoLabel>
                          <InfoValue>{offer.requiredPersonalQualities || "Non spécifié"}</InfoValue>
                        </InfoItem>
                        <InfoItem>
                          <InfoLabel>Compétences Requises</InfoLabel>
                          <InfoValue>{offer.requiredSkills || "Non spécifié"}</InfoValue>
                        </InfoItem>
                        <InfoItem>
                          <InfoLabel>Langues Requises</InfoLabel>
                          <InfoValue>{offer.requiredLanguages || "Non spécifié"}</InfoValue>
                        </InfoItem>
                        <InfoItem>
                          <InfoLabel>Type de Contrat</InfoLabel>
                          <InfoValue>{offer.contractType?.label || "Non spécifié"}</InfoValue>
                        </InfoItem>
                        <InfoItem>
                          <InfoLabel>Statut</InfoLabel>
                          <InfoValue>{offer.status || "Non spécifié"}</InfoValue>
                        </InfoItem>
                        <InfoItem>
                          <InfoLabel>Date de Publication</InfoLabel>
                          <InfoValue>{offer.publicationDate ? formatDate(offer.publicationDate) : "Non spécifié"}</InfoValue>
                        </InfoItem>
                        <InfoItem>
                          <InfoLabel>Date Limite</InfoLabel>
                          <InfoValue>{offer.deadlineDate ? formatDate(offer.deadlineDate) : "Non spécifié"}</InfoValue>
                        </InfoItem>
                        <InfoItem>
                          <InfoLabel>Durée (mois)</InfoLabel>
                          <InfoValue>{offer.duration || "Non spécifié"}</InfoValue>
                        </InfoItem>
                      </InfoGrid>
                    </ValidatorSection>
                  </ValidatorCard>
                  <ValidatorCard>
                    <ValidatorSection>
                      <SectionTitle>Demandeur</SectionTitle>
                      <InfoGrid>
                        <InfoItem>
                          <InfoLabel>Nom</InfoLabel>
                          <InfoValue>{offer.requester?.name || "Non spécifié"}</InfoValue>
                        </InfoItem>
                        <InfoItem>
                          <InfoLabel>Email</InfoLabel>
                          <InfoValue>{offer.requester?.email || "Non spécifié"}</InfoValue>
                        </InfoItem>
                        <InfoItem>
                          <InfoLabel>Poste</InfoLabel>
                          <InfoValue>{offer.requester?.position || "Non spécifié"}</InfoValue>
                        </InfoItem>
                        <InfoItem>
                          <InfoLabel>Département</InfoLabel>
                          <InfoValue>{offer.requester?.department || "Non spécifié"}</InfoValue>
                        </InfoItem>
                      </InfoGrid>
                    </ValidatorSection>
                  </ValidatorCard>
                  <ValidatorCard>
                    <ValidatorSection>
                      <SectionTitle>Site</SectionTitle>
                      <InfoGrid>
                        <InfoItem>
                          <InfoLabel>Nom du Site</InfoLabel>
                          <InfoValue>{offer.site?.siteName || "Non spécifié"}</InfoValue>
                        </InfoItem>
                        <InfoItem>
                          <InfoLabel>Code</InfoLabel>
                          <InfoValue>{offer.site?.code || "Non spécifié"}</InfoValue>
                        </InfoItem>
                      </InfoGrid>
                    </ValidatorSection>
                  </ValidatorCard>
                </>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "15px",
                    color: "#6c757d",
                    fontSize: "14px",
                    fontWeight: "normal",
                  }}
                >
                  Aucun détail d'offre d'emploi disponible
                </div>
              )}
            </ContentArea>
          )}
        </PopupContent>
      </PopupContainer>
    </PopupOverlay>
  );
};

export default JobOfferDetails;
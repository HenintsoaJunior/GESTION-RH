import React, { useState } from 'react';
import { CheckCircle, XCircle } from "lucide-react";
import Alert from "components/alert";
import styled from "styled-components";

// Styled components pour la page complète
const PageContainer = styled.div`
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20px;
`;

const OrderPageWrapper = styled.div`
  max-width: 900px;
  margin: 0 auto;
  background: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
`;

const OrderContainer = styled.div`
  font-family: 'Arial', sans-serif;
  background: white;
  padding: 30px;
  border: 2px solid #000;
  margin: 20px;
`;

const HeaderTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  
  td {
    border: 1px solid #000;
    padding: 10px;
    vertical-align: middle;
    text-align: center;
  }
`;

const LogoCell = styled.td`
  width: 25%;
  height: 100px;
  font-weight: bold;
  font-size: 18px;
`;

const TitleCell = styled.td`
  width: 50%;
  font-size: 24px;
  font-weight: bold;
`;

const ReferenceCell = styled.td`
  width: 25%;
  text-align: left;
  line-height: 1.5;
`;

const OrderNumber = styled.div`
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  margin: 20px 0;
`;

const OrderContent = styled.div`
  margin: 20px 0;
  line-height: 1.8;
`;

const OrderLine = styled.div`
  margin: 8px 0;
  display: flex;
`;

const OrderLineDouble = styled.div`
  margin: 8px 0;
  display: flex;
  justify-content: space-between;
`;

const Label = styled.span`
  font-weight: bold;
  min-width: 180px;
  display: inline-block;
`;

const Value = styled.span`
  flex: 1;
  border-bottom: 1px solid #000;
  min-height: 20px;
  padding-left: 10px;
`;

const ValueHalf = styled.span`
  width: 45%;
  border-bottom: 1px solid #000;
  min-height: 20px;
  padding-left: 10px;
`;

const SignatureSection = styled.div`
  margin-top: 40px;
  text-align: center;
`;

const SignatureBox = styled.div`
  width: 100%;
  text-align: center;
  line-height: 2;
`;

const SectionTitle = styled.div`
  text-decoration: underline;
  font-weight: bold;
  margin: 30px 0 15px 0;
`;

const SignatureTable = styled.table`
  width: 100%;
  margin-top: 20px;
  border-collapse: collapse;
  
  td {
    padding: 8px;
    border-bottom: 1px solid #000;
    vertical-align: top;
  }
`;

const DateLocation = styled.div`
  text-align: right;
  margin: 20px 0;
  font-style: italic;
`;

const ActionSection = styled.div`
  background: #f8f9fa;
  padding: 30px;
  border-top: 1px solid #dee2e6;
`;

const ActionHeader = styled.h3`
  color: #495057;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 600;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  &.validate {
    background-color: #28a745;
    color: white;
    
    &:hover {
      background-color: #218838;
    }
  }
  
  &.reject {
    background-color: #dc3545;
    color: white;
    
    &:hover {
      background-color: #c82333;
    }
  }
`;

const CommentSection = styled.div`
  margin-bottom: 30px;
`;

const CommentLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #495057;
`;

const CommentTextarea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #80bdff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }
`;

const SignatureUploadSection = styled.div`
  margin-bottom: 30px;
`;

const SignatureUpload = styled.div`
  flex: 1;
`;

const FileInputWrapper = styled.div`
  position: relative;
  display: inline-block;
  width: 100%;
`;

const FileInput = styled.input`
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
`;

const FileInputLabel = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  border: 2px dashed #ced4da;
  border-radius: 6px;
  background-color: #f8f9fa;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  color: #6c757d;
  
  &:hover {
    border-color: #80bdff;
    background-color: #e3f2fd;
  }
  
  &.has-file {
    border-color: #28a745;
    background-color: #d4edda;
    color: #155724;
  }
`;

const SignaturePreview = styled.div`
  margin-top: 10px;
  text-align: center;
  
  img {
    max-width: 200px;
    max-height: 100px;
    border: 1px solid #dee2e6;
    border-radius: 4px;
  }
`;

const StatusBadge = styled.span`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  
  &.pending {
    background-color: #fff3cd;
    color: #856404;
  }
  
  &.validated {
    background-color: #d4edda;
    color: #155724;
  }
  
  &.rejected {
    background-color: #f8d7da;
    color: #721c24;
  }
`;

const BackButton = styled.button`
  margin-bottom: 20px;
  padding: 10px 20px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    background-color: #5a6268;
  }
`;

const MissionModals = ({
  alert,
  setAlert,
  showDetailsMission,
  setShowDetailsMission,
  selectedMissionId,
  missions,
  formatDate,
  handleValidate,
  handleUpdateComments,
  handleUpdateSignature,
}) => {
  const [comment, setComment] = useState('');
  const [signature, setSignature] = useState(null);
  
  const selectedMission = missions.find((mission) => mission.id === selectedMissionId);

  const handleFileUpload = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSignature({ file, preview: e.target.result });
        handleUpdateSignature(selectedMissionId, e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAction = (action) => {
    if (action === 'validate') {
      if (!signature) {
        setAlert({
          type: 'error',
          message: 'Une signature est requise pour valider la mission.',
          isOpen: true,
        });
        return;
      }
      handleValidate(selectedMissionId, action, comment, signature.preview);
      setAlert({
        type: 'success',
        message: 'Mission approuvée avec succès',
        isOpen: true,
      });
    } else if (action === 'reject') {
      setSignature(null);
      handleUpdateSignature(selectedMissionId, '');
      handleValidate(selectedMissionId, action, comment, '');
      setAlert({
        type: 'success',
        message: 'Mission rejetée avec succès',
        isOpen: true,
      });
    }
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);
    handleUpdateComments(selectedMissionId, e.target.value);
  };

  if (!showDetailsMission || !selectedMission) return null;

  return (
    <PageContainer>
      <Alert
        type={alert.type}
        message={alert.message}
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
      />
      
      <BackButton onClick={() => setShowDetailsMission(false)}>
        ← Retour à la liste
      </BackButton>
      
      <OrderPageWrapper>
        <OrderContainer>
          <HeaderTable>
            <tbody>
              <tr>
                <LogoCell>LOGO</LogoCell>
                <TitleCell>Ordre de Mission</TitleCell>
                <ReferenceCell>
                  Référence: {selectedMission.reference || 'RHS-ENR-037'}<br/>
                  Date: {formatDate(new Date())}<br/>
                  Page: 1/1<br/>
                  <StatusBadge className={selectedMission.status.toLowerCase()}>
                    {selectedMission.status.toUpperCase()}
                  </StatusBadge>
                </ReferenceCell>
              </tr>
            </tbody>
          </HeaderTable>

          <OrderNumber>N° {selectedMission.reference || selectedMission.id}</OrderNumber>

          <OrderContent>
            <div style={{ fontWeight: 'bold', marginBottom: '15px' }}>Il est ordonné à :</div>
            
            <OrderLine>
              <Label>Nom et prénoms :</Label>
              <Value>{selectedMission.requestedBy}</Value>
            </OrderLine>

            <OrderLineDouble>
              <div style={{ width: '48%', display: 'flex' }}>
                <Label style={{ minWidth: '80px' }}>Fonction :</Label>
                <ValueHalf>{selectedMission.function || selectedMission.title}</ValueHalf>
              </div>
              <div style={{ width: '48%', display: 'flex' }}>
                <Label style={{ minWidth: '80px' }}>Matricule :</Label>
                <ValueHalf>{selectedMission.matricule || 'N/A'}</ValueHalf>
              </div>
            </OrderLineDouble>

            <OrderLineDouble>
              <div style={{ width: '48%', display: 'flex' }}>
                <Label style={{ minWidth: '80px' }}>Direction :</Label>
                <ValueHalf>{selectedMission.department}</ValueHalf>
              </div>
              <div style={{ width: '48%', display: 'flex' }}>
                <Label style={{ minWidth: '140px' }}>Département / Service :</Label>
                <ValueHalf>{selectedMission.department}</ValueHalf>
              </div>
            </OrderLineDouble>

            <OrderLine>
              <Label>De se rendre à :</Label>
              <Value>{selectedMission.location}</Value>
            </OrderLine>

            <OrderLine>
              <Label>Motif :</Label>
              <Value>{selectedMission.description}</Value>
            </OrderLine>

            <OrderLine>
              <Label>Moyen de transport :</Label>
              <Value>{selectedMission.transport || 'Non spécifié'}</Value>
            </OrderLine>

            <OrderLine>
              <Label>Date et heure de départ :</Label>
              <Value>{formatDate(selectedMission.requestDate)} - {selectedMission.departureTime || 'Non spécifié'}</Value>
            </OrderLine>

            <DateLocation>Antananarivo, le {formatDate(new Date())}</DateLocation>

            <SignatureSection>
              <SignatureBox>
                <strong>Signature de {selectedMission.toWhom}</strong>
                <div style={{ height: '60px', marginTop: '20px' }}>
                  {selectedMission.signature && <img src={selectedMission.signature} alt={`Signature ${selectedMission.toWhom}`} style={{ maxHeight: '50px' }} />}
                </div>
              </SignatureBox>
            </SignatureSection>

            <SectionTitle>ARRIVEE SUR LE LIEU DE REALISATION DE LA MISSION :</SectionTitle>
            <SignatureTable>
              <tbody>
                <tr>
                  <td style={{ width: '15%' }}>Date :</td>
                  <td style={{ width: '35%' }}></td>
                  <td style={{ width: '50%' }}>Nom, prénoms et fonction de l'Autorité</td>
                </tr>
                <tr>
                  <td>Heure :</td>
                  <td></td>
                  <td style={{ textAlign: 'center' }}>Signature et cachet</td>
                </tr>
              </tbody>
            </SignatureTable>

            <SectionTitle>DEPART DU LIEU DE REALISATION DE LA MISSION :</SectionTitle>
            <SignatureTable>
              <tbody>
                <tr>
                  <td style={{ width: '15%' }}>Date :</td>
                  <td style={{ width: '35%' }}></td>
                  <td style={{ width: '50%' }}>Nom, prénoms et fonction de l'Autorité</td>
                </tr>
                <tr>
                  <td>Heure :</td>
                  <td></td>
                  <td style={{ textAlign: 'center' }}>Signature et cachet</td>
                </tr>
              </tbody>
            </SignatureTable>

            <SectionTitle>ARRIVEE SUR LE LIEU DE TRAVAIL HABITUEL :</SectionTitle>
            <SignatureTable>
              <tbody>
                <tr>
                  <td style={{ width: '15%' }}>Date :</td>
                  <td style={{ width: '35%' }}></td>
                  <td style={{ width: '15%' }}>Heure :</td>
                  <td style={{ width: '35%' }}></td>
                </tr>
              </tbody>
            </SignatureTable>
          </OrderContent>
        </OrderContainer>

        <ActionSection>
          <ActionHeader>Actions et Validation</ActionHeader>
          
          <ActionButtons>
            <ActionButton 
              className="validate" 
              onClick={() => handleAction('validate')}
            >
              <CheckCircle size={16} />
              Valider
            </ActionButton>
            <ActionButton 
              className="reject" 
              onClick={() => handleAction('reject')}
            >
              <XCircle size={16} />
              Rejeter
            </ActionButton>
          </ActionButtons>

          <CommentSection>
            <CommentLabel>Commentaire de validation</CommentLabel>
            <CommentTextarea
              value={comment}
              onChange={handleCommentChange}
              placeholder="Ajoutez un commentaire sur cette mission..."
            />
          </CommentSection>

          <SignatureUploadSection>
            <SignatureUpload>
              <CommentLabel>Signature de {selectedMission.toWhom}</CommentLabel>
              <FileInputWrapper>
                <FileInput
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e.target.files[0])}
                />
                <FileInputLabel className={signature ? 'has-file' : ''}>
                  {signature ? 'Signature ajoutée' : `Cliquer pour ajouter la signature de ${selectedMission.toWhom}`}
                </FileInputLabel>
              </FileInputWrapper>
              {signature && (
                <SignaturePreview>
                  <img src={signature.preview} alt={`Signature ${selectedMission.toWhom}`} />
                </SignaturePreview>
              )}
            </SignatureUpload>
          </SignatureUploadSection>
        </ActionSection>
      </OrderPageWrapper>
    </PageContainer>
  );
};

export default MissionModals;
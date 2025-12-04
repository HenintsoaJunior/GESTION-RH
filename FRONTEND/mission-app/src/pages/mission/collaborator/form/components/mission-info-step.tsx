import { useEffect, useState } from "react";
import {
  FormSectionTitle,
  FormTable,
  FormRow,
  FormFieldCell,
  FormLabel,
  FormLabelRequired,
  FormInput,
  FormTextarea,
  StyledAutoCompleteInput,
  ErrorMessage,
} from "@/styles/form-container";
import LieuForm from "@/pages/referentiel/lieu/form/index";
import TransportForm from "@/pages/referentiel/transport/form/index";
import { useGetLieuById } from "@/api/lieu/services";
import { useGetTransportById } from "@/api/transport/services";
import type { Transport } from "@/api/transport/services";

interface MissionCollaboratorStepProps {
  formData: {
    missionType?: string;
    missionTitle?: string;
    description?: string;
    location?: string;
    lieuData?: string; 
    beneficiary: {
      beneficiary: string;
      matricule: string;
      function: string;
      base: string;
      direction: string;
      department: string;
      service: string;
      costCenter: string;
      transport: string;
    };
  };
  fieldErrors: { [key: string]: string[] };
  isSubmitting: boolean;
  isLoading: { regions: boolean };
  regionDisplayNames: string[];
  suggestions: {
    beneficiary: { displayName: string }[];
    transport: { type: string }[];
  };
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement> | { target: { name: string; value: string } },
    section?: string
  ) => void;
  handleAddNewSuggestion: (type: string, value: string) => void;
  onLieuFormOpen?: () => void;
  onLieuCreated?: (newLieu: any) => void;
  onTransportCreated?: (newTransport: any) => void;
}

const MissionCollaboratorStep: React.FC<MissionCollaboratorStepProps> = ({
  formData,
  fieldErrors,
  isSubmitting,
  isLoading,
  regionDisplayNames,
  suggestions,
  handleInputChange,
  handleAddNewSuggestion,
  onLieuFormOpen,
  onLieuCreated,
  onTransportCreated,
}) => {
  useEffect(() => {
  }, [fieldErrors]);
  
  const [lieuFormOpen, setLieuFormOpen] = useState(false);
  const [transportFormOpen, setTransportFormOpen] = useState(false);
  const [lieuFormPrefill, setLieuFormPrefill] = useState("");
  const [transportFormPrefill, setTransportFormPrefill] = useState("");
  const [recentLieuId, setRecentLieuId] = useState<string | null>(null);
  const [selectedTransport, setSelectedTransport] = useState<Transport | null>(null);
  const [justCreatedTransportId, setJustCreatedTransportId] = useState<string | null>(null);
  const [uniqueTransportSuggestions, setUniqueTransportSuggestions] = useState<string[]>([]);
  
  const isInternational = formData.missionType === "Internationale";
  
  const { data: lieuDetails, isLoading: isLoadingLieuDetails } = useGetLieuById(
    recentLieuId || ""
  );

  const { data: transportDetails } = useGetTransportById(
    justCreatedTransportId || ""
  );

  // Mettre à jour les suggestions de transport uniques
  useEffect(() => {
    if (suggestions.transport) {
      // Créer un Set pour éliminer les doublons
      const uniqueTypes = Array.from(
        new Set(suggestions.transport.map(t => t.type).filter(Boolean))
      );
      setUniqueTransportSuggestions(uniqueTypes);
    }
  }, [suggestions.transport]);

  // Ajouter un nouveau transport unique aux suggestions
  useEffect(() => {
    if (transportDetails?.data?.type) {
      const newType = transportDetails.data.type;
      
      // Ajouter uniquement si ce n'est pas déjà dans la liste
      if (!uniqueTransportSuggestions.includes(newType)) {
        setUniqueTransportSuggestions(prev => [...prev, newType]);
      }
    }
  }, [transportDetails?.data?.type, uniqueTransportSuggestions]);

  useEffect(() => {
    if (recentLieuId && lieuDetails?.data) {
      
      const lieu = lieuDetails.data;
      
      let displayValue = lieu.nom;
      if (lieu.pays) {
        displayValue = lieu.pays;
        if (lieu.ville) {
          displayValue = `${lieu.ville}/${lieu.pays}`;
        }
      }
      
      handleInputChange({ 
        target: { 
          name: "location", 
          value: displayValue
        } 
      });
      
      const structuredLieu = {
        nom: lieu.nom,
        pays: lieu.pays,
        ville: lieu.ville || "",
        codePostal: lieu.codePostal || "",
        latitude: lieu.latitude || 0,
        longitude: lieu.longitude || 0,
        lieuId: lieu.lieuId,
        zoneId: lieu.zoneId || null,
        geoZone: lieu.geoZone || null,
        originalData: lieu
      };
      
      handleInputChange({ 
        target: { 
          name: "lieuData", 
          value: JSON.stringify(structuredLieu) 
        } 
      });
      
      if (onLieuCreated) {
        onLieuCreated(lieu);
      }
      
      setRecentLieuId(null);
    }
  }, [lieuDetails, recentLieuId, handleInputChange, onLieuCreated]);

  // Effet pour récupérer les détails du transport quand on a un ID récent
  useEffect(() => {
    if (transportDetails?.data) {
      const transport = transportDetails.data;
      const transportType = transport.type || "";
      
      if (transportType) {
        // Mettre à jour le champ de transport avec le type
        handleInputChange({ 
          target: { 
            name: "transport", 
            value: transportType
          } 
        }, "beneficiary");
        
        // Ajouter la nouvelle suggestion à la liste
        handleAddNewSuggestion("transport", transportType);
        
        if (onTransportCreated) {
          onTransportCreated(transport);
        }
        
        // Réinitialiser l'ID
        setJustCreatedTransportId(null);
      }
    }
  }, [transportDetails, handleInputChange, handleAddNewSuggestion, onTransportCreated]);

  const handleLieuCreated = (newLieu: any) => {
    
    let lieuObject = newLieu;
    
    if (newLieu && newLieu.data) {
      lieuObject = newLieu.data;
    }
    
    if (lieuObject?.originalData?.lieuId) {
      setRecentLieuId(lieuObject.originalData.lieuId);
    }
    else if (lieuObject?.lieuId) {
      setRecentLieuId(lieuObject.lieuId);
    }
    else {
      
      const lieuNom = lieuObject?.nom || "Lieu sans nom";
      const lieuPays = lieuObject?.pays || "";
      const lieuVille = lieuObject?.ville || "";
      
      let displayValue = lieuNom;
      if (lieuPays) {
        displayValue = lieuPays;
        if (lieuVille) {
          displayValue = `${lieuVille}/${lieuPays}`;
        }
      }
      
      handleInputChange({ 
        target: { 
          name: "location", 
          value: displayValue
        } 
      });
      
      const structuredLieu = {
        nom: lieuNom,
        pays: lieuPays,
        ville: lieuVille,
        codePostal: lieuObject?.codePostal || "",
        latitude: lieuObject?.latitude || 0,
        longitude: lieuObject?.longitude || 0,
        lieuId: lieuObject?.lieuId || "",
        zoneId: lieuObject?.zoneId || null,
        originalData: lieuObject
      };
      
      handleInputChange({ 
        target: { 
          name: "lieuData", 
          value: JSON.stringify(structuredLieu) 
        } 
      });
      
      if (onLieuCreated) {
        onLieuCreated(lieuObject);
      }
    }
    
    setLieuFormOpen(false);
    setLieuFormPrefill("");
  };

  const handleTransportCreated = (newTransport: any) => {
    
    let transportObject = newTransport;
    
    if (newTransport && newTransport.data) {
      transportObject = newTransport.data;
    }
    
    // Fermer le popup IMMÉDIATEMENT
    setTransportFormOpen(false);
    setTransportFormPrefill("");
    setSelectedTransport(null);
    
    // Si nous avons un transportId, le stocker pour récupérer les détails via GET
    if (transportObject?.transportId) {
      setJustCreatedTransportId(transportObject.transportId);
    }
    // Si nous avons un ID dans originalData
    else if (transportObject?.originalData?.transportId) {
      setJustCreatedTransportId(transportObject.originalData.transportId);
    }
    // Sinon, traiter directement les données si disponibles
    else if (transportObject?.type) {
      // Si on a directement le type, on l'utilise
      const transportType = transportObject.type;
      
      handleInputChange({ 
        target: { 
          name: "transport", 
          value: transportType
        } 
      }, "beneficiary");
      
      handleAddNewSuggestion("transport", transportType);
      
      if (onTransportCreated) {
        onTransportCreated(transportObject);
      }
    }
  };

  const handleAddNewLocation = () => {
    if (formData.location) {
      setLieuFormPrefill(formData.location);
    } else {
      setLieuFormPrefill("");
    }
    
    setLieuFormOpen(true);
    
    if (onLieuFormOpen) {
      onLieuFormOpen();
    }
  };

  const handleAddNewTransport = () => {
    setSelectedTransport(null);
    setJustCreatedTransportId(null); // Réinitialiser l'ID précédent
    
    if (formData.beneficiary.transport) {
      setTransportFormPrefill(formData.beneficiary.transport);
    } else {
      setTransportFormPrefill("");
    }
    
    setTransportFormOpen(true);
  };

  return (
    <>
      <FormSectionTitle>Informations de la Mission</FormSectionTitle>
      <FormTable>
        <tbody>
          <FormRow>
            <FormFieldCell colSpan={2}>
              <FormLabelRequired>Type de mission</FormLabelRequired>
              <div className="radio-group" style={{ display: "flex", gap: "20px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <FormInput
                    type="radio"
                    name="missionType"
                    value="Nationale"
                    checked={formData.missionType === "Nationale"}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e)}
                    disabled={isSubmitting}
                  />
                  National
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <FormInput
                    type="radio"
                    name="missionType"
                    value="Internationale"
                    checked={formData.missionType === "Internationale"}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e)}
                    disabled={isSubmitting}
                  />
                  International
                </label>
              </div>
              {fieldErrors.missionType && fieldErrors.missionType.length > 0 && (
                <ErrorMessage>{fieldErrors.missionType.join(", ")}</ErrorMessage>
              )}
            </FormFieldCell>
          </FormRow>
          <FormRow>
            <FormFieldCell colSpan={2}>
              <FormLabelRequired>Titre de la mission</FormLabelRequired>
              <FormInput
                type="text"
                name="missionTitle"
                value={formData.missionTitle || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e)}
                placeholder="Saisir le titre de la mission..."
                disabled={isSubmitting}
                className={fieldErrors.missionTitle ? "input-error" : ""}
              />
              {fieldErrors.missionTitle && fieldErrors.missionTitle.length > 0 && (
                <ErrorMessage>{fieldErrors.missionTitle.join(", ")}</ErrorMessage>
              )}
            </FormFieldCell>
          </FormRow>
          <FormRow>
            <FormFieldCell colSpan={2}>
              <FormLabel>Description</FormLabel>
              <FormTextarea
                name="description"
                value={formData.description || ""}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange(e)}
                placeholder="Saisir une description..."
                disabled={isSubmitting}
                rows={3}
                className={fieldErrors.description ? "input-error" : ""}
              />
              {fieldErrors.description && fieldErrors.description.length > 0 && (
                <ErrorMessage>{fieldErrors.description.join(", ")}</ErrorMessage>
              )}
            </FormFieldCell>
          </FormRow>
          <FormRow>
            <FormFieldCell colSpan={2}>
              <FormLabelRequired>Lieu</FormLabelRequired>
              <StyledAutoCompleteInput
                value={formData.location || ""}
                onChange={(value: string) => {
                  handleInputChange({ target: { name: "location", value } });
                  if (formData.lieuData) {
                    handleInputChange({ target: { name: "lieuData", value: "" } });
                  }
                }}
                suggestions={regionDisplayNames}
                placeholder={isLoading.regions ? "Chargement des lieux..." : "Saisir ou sélectionner un lieu..."}
                disabled={isSubmitting || isLoading.regions}
                onAddNew={handleAddNewLocation}
                fieldType="location"
                fieldLabel="lieu"
                className={fieldErrors.lieuId ? "input-error" : ""}
              />
              {fieldErrors.lieuId && fieldErrors.lieuId.length > 0 && (
                <ErrorMessage>{fieldErrors.lieuId.join(", ")}</ErrorMessage>
              )}
              
              {isLoadingLieuDetails && recentLieuId && (
                <div style={{ 
                  marginTop: '4px', 
                  fontSize: '0.85em',
                  color: '#3498db',
                  fontStyle: 'italic'
                }}>
                  Chargement des détails du lieu...
                </div>
              )}
            </FormFieldCell>
          </FormRow>
        </tbody>
      </FormTable>

      <FormSectionTitle>Détails du Missionaire</FormSectionTitle>
      <FormTable>
        <tbody>
          <FormRow className="dual-field-row">
            <FormFieldCell>
              <FormLabelRequired>MISSIONAIRE</FormLabelRequired>
              <StyledAutoCompleteInput
                value={formData.beneficiary.beneficiary}
                onChange={(value: string) => handleInputChange({ target: { name: "beneficiary", value } }, "beneficiary")}
                suggestions={suggestions.beneficiary.map((b) => b.displayName)}
                placeholder={suggestions.beneficiary.length === 0 ? "Aucun employé disponible" : "Saisir ou sélectionner..."}
                disabled={isSubmitting}
                showAddOption={false}
                fieldType="beneficiary"
                fieldLabel="bénéficiaire"
                className={fieldErrors["beneficiary.beneficiary"] ? "input-error" : ""}
              />
              {fieldErrors["beneficiary.beneficiary"] && fieldErrors["beneficiary.beneficiary"].length > 0 && (
                <ErrorMessage>{fieldErrors["beneficiary.beneficiary"].join(", ")}</ErrorMessage>
              )}
            </FormFieldCell>
            <FormFieldCell>
              <FormLabelRequired>Matricule</FormLabelRequired>
              <FormInput
                type="text"
                name="matricule"
                value={formData.beneficiary.matricule}
                placeholder="Saisir le matricule..."
                disabled={isSubmitting}
                readOnly={true}
                className={fieldErrors["beneficiary.matricule"] ? "input-error" : ""}
              />
              {fieldErrors["beneficiary.matricule"] && fieldErrors["beneficiary.matricule"].length > 0 && (
                <ErrorMessage>{fieldErrors["beneficiary.matricule"].join(", ")}</ErrorMessage>
              )}
            </FormFieldCell>
          </FormRow>
          <FormRow className="dual-field-row">
            <FormFieldCell>
              <FormLabelRequired>Fonction</FormLabelRequired>
              <FormInput
                type="text"
                name="function"
                value={formData.beneficiary.function}
                placeholder="Saisir la fonction..."
                disabled={isSubmitting}
                readOnly={true}
                className={fieldErrors["beneficiary.function"] ? "input-error" : ""}
              />
              {fieldErrors["beneficiary.function"] && fieldErrors["beneficiary.function"].length > 0 && (
                <ErrorMessage>{fieldErrors["beneficiary.function"].join(", ")}</ErrorMessage>
              )}
            </FormFieldCell>
            <FormFieldCell>
              <FormLabelRequired>Site</FormLabelRequired>
              <FormInput
                type="text"
                name="base"
                value={formData.beneficiary.base}
                placeholder="Saisir la base..."
                disabled={isSubmitting}
                readOnly={true}
                className={fieldErrors["beneficiary.base"] ? "input-error" : ""}
              />
              {fieldErrors["beneficiary.base"] && fieldErrors["beneficiary.base"].length > 0 && (
                <ErrorMessage>{fieldErrors["beneficiary.base"].join(", ")}</ErrorMessage>
              )}
            </FormFieldCell>
          </FormRow>
          <FormRow className="dual-field-row">
            <FormFieldCell>
              <FormLabelRequired>Direction</FormLabelRequired>
              <FormInput
                type="text"
                name="direction"
                value={formData.beneficiary.direction}
                placeholder="Saisir la direction..."
                disabled={isSubmitting}
                readOnly={true}
                className={fieldErrors["beneficiary.direction"] ? "input-error" : ""}
              />
              {fieldErrors["beneficiary.direction"] && fieldErrors["beneficiary.direction"].length > 0 && (
                <ErrorMessage>{fieldErrors["beneficiary.direction"].join(", ")}</ErrorMessage>
              )}
            </FormFieldCell>
            <FormFieldCell>
              <FormLabelRequired>Département</FormLabelRequired>
              <FormInput
                type="text"
                name="department"
                value={formData.beneficiary.department}
                placeholder="Saisir le département..."
                disabled={isSubmitting}
                readOnly={true}
                className={fieldErrors["beneficiary.department"] ? "input-error" : ""}
              />
              {fieldErrors["beneficiary.department"] && fieldErrors["beneficiary.department"].length > 0 && (
                <ErrorMessage>{fieldErrors["beneficiary.department"].join(", ")}</ErrorMessage>
              )}
            </FormFieldCell>
          </FormRow>
          <FormRow className="dual-field-row">
            <FormFieldCell>
              <FormLabelRequired>Service</FormLabelRequired>
              <FormInput
                type="text"
                name="service"
                value={formData.beneficiary.service}
                placeholder="Saisir le service..."
                disabled={isSubmitting}
                readOnly={true}
                className={fieldErrors["beneficiary.service"] ? "input-error" : ""}
              />
              {fieldErrors["beneficiary.service"] && fieldErrors["beneficiary.service"].length > 0 && (
                <ErrorMessage>{fieldErrors["beneficiary.service"].join(", ")}</ErrorMessage>
              )}
            </FormFieldCell>
            <FormFieldCell>
              <FormInput
                type="hidden"
                name="costCenter"
                value={formData.beneficiary.costCenter}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, "beneficiary")}
                disabled={isSubmitting}
              />
              {!isInternational && (
                <>
                  <FormLabel>Moyen de transport</FormLabel>
                  <StyledAutoCompleteInput
                    value={formData.beneficiary.transport || ""}
                    onChange={(value: string) => handleInputChange({ target: { name: "transport", value } }, "beneficiary")}
                    suggestions={uniqueTransportSuggestions}
                    placeholder={uniqueTransportSuggestions.length === 0 ? "Aucun moyen de transport disponible" : "Saisir ou sélectionner un moyen de transport..."}
                    disabled={isSubmitting}
                    onAddNew={handleAddNewTransport}
                    fieldType="transport"
                    fieldLabel="moyen de transport"
                    className={fieldErrors["beneficiary.transport"] ? "input-error" : ""}
                  />
                  {fieldErrors["beneficiary.transport"] && fieldErrors["beneficiary.transport"].length > 0 && (
                    <ErrorMessage>{fieldErrors["beneficiary.transport"].join(", ")}</ErrorMessage>
                  )}
                </>
              )}
            </FormFieldCell>
          </FormRow>
        </tbody>
      </FormTable>

      <LieuForm
        isOpen={lieuFormOpen}
        onClose={() => {
          setLieuFormOpen(false);
          setLieuFormPrefill("");
        }}
        onFormSuccess={() => {
        }}
        prefillNom={lieuFormPrefill}
        onSuccessClose={handleLieuCreated}
      />

      <TransportForm
        isOpen={transportFormOpen}
        onClose={() => {
          setTransportFormOpen(false);
          setTransportFormPrefill("");
          setSelectedTransport(null);
          setJustCreatedTransportId(null);
        }}
        onFormSuccess={() => {
        }}
        transport={selectedTransport}
        prefillType={transportFormPrefill}
        onSuccessClose={handleTransportCreated}
      />
    </>
  );
};

export default MissionCollaboratorStep;
import { useGetRecruitmentRequestDetails, useHasJobDescription, useHasValidationInRecruitment } from "@/api/recruitment/service";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import RequestDetailsCard from "./components/RequestDetailsCard";
import { ArrowLeft, Check, X } from "lucide-react";
import "./details.css";
import { useEffect, useState } from "react";
import JobTabContent from "./components/JobTabContent";
import { ButtonView } from "@/styles/table-styles";
import Modal from "@/components/modal";
import useValidateRequest from "../validation/hooks/use-validate-request";
import type { AxiosError } from "axios";
import Alert from "@/components/alert";
import RefuseValidationForm, { type RequestValidationFormDTO } from "../validation/components/refuse-request-form";
import RequestHistoricTab from "./components/RequestHistoricTab";

interface BackendError {
  message?: string;
}

const RequestDetails: React.FC = () => {
  const {
    formData,
    setFormData,
    validateForm,
    submitValidation,
    handleReset,
    fieldErrors,
    handleInputChange,
  } = useValidateRequest();

  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"request" | "historic" | "job">("request");
  const [decision, setDecision] = useState<"Approuver" | "Refuser">();
  
  const [isValidationModalOpen, setIsValidationModalOpen] = useState<boolean>(false);
  const [isRefuseFormOpen, setIsRefuseFormOpen] = useState<boolean>(false);
  
  const validatorId = searchParams.get("validateur") ?
  String(searchParams.get("validateur")) : undefined;

  useEffect(() => {
    if (id) {
      setFormData(prev => ({ ...prev, requestId: id }));
    }
    if (validatorId) {
      setFormData(prev => ({ ...prev, validatorId }));
    }
  }, [id, validatorId, setFormData]);
  
  const { data: validator} = useHasValidationInRecruitment(validatorId);

  const { data, isLoading } = useGetRecruitmentRequestDetails(id ?? "");
  const { data: jobDescData } = useHasJobDescription(id ?? "");


  const [alert, setAlert] = useState({
    isOpen: false,
    type: "info" as "success" | "info" | "error",
    message: ""
  });
  const showError = (msg: string) => setAlert({ isOpen: true, type: "error", message: msg });

  // status : "Approuver" ou "Refuser"
  const handleConfirmValidation = async (status: "Approuver" | "Refuser" | undefined) => {
    if (!status) {
      showError("Décision invalide."); return;
    }

    const updatedForm: RequestValidationFormDTO = {
      ...formData,
      status
    };
    if (!updatedForm.requestId || !updatedForm.validatorId) {
      showError("Identifiants manquants. Veuillez recharger la page.");
      return;
    }

    // Validation AVANT envoi
    if (!validateForm(updatedForm)) {
      showError("Veuillez corriger les erreurs.");
      setFormData(updatedForm);
      return;
    }

    try {
      setFormData(updatedForm);
      await submitValidation(updatedForm);

      setAlert({
        isOpen: true,
        type: "success",
        message: "Demande validée avec succès !"
      });

      handleReset();
      setIsRefuseFormOpen(false);
      setIsValidationModalOpen(false);

    // Redirection après succès
      navigate("/recrutement/demandes/validation");
    } 
    catch (err: unknown) {
      const axiosError = err as AxiosError<BackendError>;
      showError(
        axiosError.response?.data?.message || "Erreur inconnue"
      );
    }
  };


  if (isLoading || !data) return <p>Chargement...</p>;

  return (<>
    {alert.isOpen && (
      <Alert type={alert.type} message={alert.message} isOpen={alert.isOpen}
        onClose={() => {
          setAlert(a => ({ ...a, isOpen: false }))
        }}
      />
    )}

    {(activeTab==="request" && isRefuseFormOpen && !isValidationModalOpen) && (
      <RefuseValidationForm 
        onClose={() => setIsRefuseFormOpen(false)}
        onSubmit={handleConfirmValidation}
        handleReset={handleReset}
        isSubmitting={false} 
        handleInputChange={handleInputChange}
        formData={formData} fieldErrors={fieldErrors} />
    )}

    <div className="request-page">
      {/* TABS */}
      <div className="tabs">
        <button className={activeTab === "request" ? "tab active" : "tab"} onClick={() => setActiveTab("request")}>
          Demande
        </button>
        <button className={activeTab === "historic" ? "tab active" : "tab"} onClick={() => setActiveTab("historic")}>
          Validations
        </button>
        <button className={activeTab === "job" ? "tab active" : "tab"} onClick={() => setActiveTab("job")}>
          Terme de référence
        </button>
      </div>

      {/* CONTENT */}
      {activeTab === "request" && (<>
        <RequestDetailsCard
          hasJobDescription={jobDescData?.hasJobDescription}
          details={data.details}
          validations={data.validations}
        />

      {/* Confirmation d'action */}
        {(isValidationModalOpen && !isRefuseFormOpen) && (
          <Modal type="success" title="Confirmer la validation"
            message="Voulez-vous vraiment valider cette demande ?"
            isOpen={isValidationModalOpen}
            onClose={() => {setIsValidationModalOpen(false)}}
            confirmAction={() => handleConfirmValidation(decision)}
            confirmLabel="Valider" cancelLabel="Annuler"
            showActions={true}
          />
        )}
      </>)}

      {activeTab === "job" && (
        <JobTabContent
          requestId={data.details.id}
          details={data.details}
          requestStatus={data.details.status}
          hasJobDescription={jobDescData?.hasJobDescription}
        />
      )}

      {activeTab === "historic" && (
        <RequestHistoricTab 
         hasJobDescription={jobDescData?.hasJobDescription}
         validations={data.validations}/>
      )}

      {/* BOUTON RETOUR sticky en bas */}
      <div className="request-footer">
        <ButtonView style={{ background:"var(--info-bg)" }} onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Retour
        </ButtonView>

        {(validator?.hasValidation===true && activeTab==="request") && (
          <div className="right-footer">
            <ButtonView style={{ background:"var(--primary-color)", color:"white" }}
              onClick={() => {
              setDecision("Approuver");
              setIsValidationModalOpen(true);
              setIsRefuseFormOpen(false);
              }}>
              <Check size={18} /> Valider
            </ButtonView>

            <ButtonView style={{ background:"var(--danger-color)", color:"white" }}
              onClick={() => {
              setDecision("Refuser");
              setIsValidationModalOpen(false);
              setIsRefuseFormOpen(true);
              }}>
              <X size={18} /> Refuser
            </ButtonView>
          </div>
        )}
      </div>
    </div>
  </>);
};

export default RequestDetails;

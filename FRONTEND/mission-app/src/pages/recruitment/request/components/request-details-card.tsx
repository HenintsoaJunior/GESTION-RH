import React, { useState } from "react";
import type { RequestDetailsDTO, RequestValidationDTO } from "@/api/recruitment/service";
import { addMonths, formatDate } from "date-fns";
import { PlusSquare } from "lucide-react";
import { useHasHabilitation } from "@/api/users/services";
import { FaFilePdf } from "react-icons/fa";
import JobDescriptionForm from "../../job-description/job-description-form";
import Alert from "@/components/alert";
import { exportRequestToPDF } from "../../job-description/utils/pdfExport";

interface Props {
    hasJobDescription: boolean | undefined;
    details: RequestDetailsDTO;
    validations: RequestValidationDTO[];
}

const RequestDetailsCard: React.FC<Props> = ({ hasJobDescription, details, validations }) => {
    const [alert, setAlert] = useState<{
     isOpen: boolean; type: "success" | "error" | "info"; message: string;
    }>({
        isOpen: false,
        type: "info",
        message: ""
    });

    const handleFormSuccess = (type: "success" | "error" | "info", message: string) => {
        setAlert({
            isOpen: true, type, message
        });
        setIsFormOpen(false);
    };

// Nommage de statut dynamiquement
    const normalizeStatus = (status: string) =>
        status
        .toLowerCase()
        .normalize("NFD") 
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "-"); 

    const beginningDate = new Date(details.beginningDate);
    const fBeginningDate = formatDate(beginningDate, "dd/MM/yyyy");
    const endingDate = addMonths(beginningDate, details.monthDuration ?? 0);
    const fEndingDate = (details.monthDuration!=null) ? formatDate(endingDate, "dd/MM/yyyy"):"--";

// Formulaire Pop-up
    const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
    const openCreateForm = () => { setIsFormOpen(true); }

// Gestion Habilitations
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = userData?.userId || "";

    const canExportPDF = useHasHabilitation(userId, "Exporter PDF demande recrutement");
    // const canViewDetails = useHasHabilitation(userId, "Afficher détails demande recrutement");

    return (<>
        {alert.isOpen && (
            <Alert {...alert} 
                onClose={() => setAlert(a => ({ ...a, isOpen: false }))}
            />
        )}

        {isFormOpen && (
            <JobDescriptionForm
                isOpen={isFormOpen}
                requestId={details.id}
                onClose={() => setIsFormOpen(false)}
                onFormSuccess={handleFormSuccess}
            />
        )}

        <div className="request-container">
            <h2 className="page-title">Détails de la demande de recrutement</h2>

            <div className="stat-box">
                <div className="stat-number">{details.validationLevel}</div>
                <div className="stat-label">Validations faites</div>
            </div>

            <div className="details-card">
                <div className="detail-row">
                    <span className="label">Référence :</span>
                    <span className="value">{details.id}</span>
                </div>

                <div className="detail-row">
                    <span className="label">Nom du poste :</span>
                    <span className="value">{details.post}</span>
                </div>

                <div className="detail-row">
                    <span className="label">Demandeur :</span>
                    <span className="value">{details.applicantUser}</span>
                </div>

                <div className="detail-row">
                    <span className="label">Direction :</span>
                    <span className="value">{details.direction}</span>
                </div>

                <div className="detail-row">
                    <span className="label">Département :</span>
                    <span className="value">{details.department}</span>
                </div>

                <div className="detail-row">
                    <span className="label">Service :</span>
                    <span className="value">{details.service}</span>
                </div>

                <div className="detail-row">
                    <span className="label">Statut :</span>

                    <span className={`status-chip status-${normalizeStatus(details.status)}`}>
                        <span className="status-dot"></span>
                        {details.status}
                    </span>
                </div>

                <div className="detail-row">
                    <span className="label">Contrat :</span>
                    <span className="value">{details.contract ?? details.contractPrecision}</span>
                </div>

                <div className="detail-row">
                    <span className="label">Début du contrat :</span>
                    <span className="value">{fBeginningDate}</span>
                </div>

                <div className="detail-row">
                    <span className="label">Durée :</span>
                    <span className="value">{details.monthDuration != null ? details.monthDuration + " mois" : "--"}</span>
                </div>

                <div className="detail-row">
                    <span className="label">Fin du contrat :</span>
                    <span className="value">{fEndingDate}</span>
                </div>
                
                <div className="detail-row">
                    <span className="label">Sites concernées :</span>
                    <span className="value">{details.sites.join(", ")}</span>
                </div>

                {details.isReplacement && ( <>
                    <div className="separator" />

                    <div className="detail-row">
                        <span className="label">Remplacement :</span>
                        <span className="value">Oui</span>
                    </div>

                    <div className="detail-row">
                        <span className="label">Motif du remplacement :</span>
                        <span className="value">{details.replacementReason ?? details.reasonPrecision}</span>
                    </div>

                    <div className="detail-row">
                        <span className="label">Ancien titulaire :</span>
                        <span className="value">{details.lastTitular ?? "—"}</span>
                    </div>
                </> )}
            </div>
            
            <div className="actions-bar">
                {canExportPDF && (
                    <button className="export-btn" onClick={() => 
                     exportRequestToPDF(details, validations, fBeginningDate, fEndingDate)}>
                        <FaFilePdf size={16} />Exporter
                    </button>
                )}

                {(details.status==="Validée" && hasJobDescription===false) && (
                    <button className="export-btn tdr-btn" onClick={openCreateForm}>
                        <PlusSquare size={16} />Fiche de poste
                    </button>
                )}
            </div>
        </div>
    </>);
};

export default RequestDetailsCard;

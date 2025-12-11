import React from "react";
import "./request-details.css";
import type { RequestDetailsDTO } from "@/api/recruitment/service";
import { useNavigate } from "react-router-dom";
import { addMonths, formatDate } from "date-fns";
import { ArrowLeft } from "lucide-react";

interface Props {
  details: RequestDetailsDTO;
}

const RequestDetailsCard: React.FC<Props> = ({ details }) => {
    const normalizeStatus = (status: string) =>
        status
        .toLowerCase()
        .normalize("NFD")        // décompose les accents
        .replace(/[\u0300-\u036f]/g, "") // retire les accents
        .replace(/\s+/g, "-");   // remplace espaces par tirets
    
    const navigate = useNavigate();
    const beginningDate = new Date(details.beginningDate);
    const fBeginningDate = formatDate(beginningDate, "dd/MM/yyyy");

    const endingDate = addMonths(beginningDate, details.monthDuration ?? 0);
    const fEndingDate = (details.monthDuration!=null) ? formatDate(endingDate, "dd/MM/yyyy"):"--";

    return (
        <div className="request-container">
            <button className="back-btn" onClick={() => navigate(-1)}>
                <ArrowLeft size={18} />Retour
            </button>

            <h2 className="page-title">Détails de la demande de recrutement</h2>

            <div className="stat-box">
                <div className="stat-number">{details.validationLevel}</div>
                <div className="stat-label">Niveau de validation</div>
            </div>

            <div className="details-card">
                <div className="detail-row">
                    <span className="label">Référence :</span>
                    <span className="value">{details.id}</span>
                </div>

                <div className="detail-row">
                    <span className="label">Demandeur :</span>
                    <span className="value">{details.applicantUser}</span>
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
        </div>
    );
};

export default RequestDetailsCard;

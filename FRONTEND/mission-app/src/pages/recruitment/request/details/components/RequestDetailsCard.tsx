import React, { useState } from "react";
import type { RequestDetailsDTO, RequestValidationDTO } from "@/api/recruitment/service";
import { addMonths, format as formatDate } from "date-fns";
import { useHasHabilitation } from "@/api/users/services";
import { FaFilePdf } from "react-icons/fa";
import Alert from "@/components/alert";
import { exportRequestToPDF } from "@/pages/recruitment/utils/pdfExport";
import { ButtonConfirm } from "@/styles/table-styles";
import LabelValue from "./LabelValue";
import RecruitmentStatusTag from "@/components/recruitment-status";

interface Props {
  hasJobDescription?: boolean;
  details: RequestDetailsDTO;
  validations: RequestValidationDTO[];
}

// eslint-disable-next-line react-refresh/only-export-components
export const normalizeStatus = (status: string) =>
    status.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");

const RequestDetailsCard: React.FC<Props> = ({ details, validations }) => {
  const [alert, setAlert] = useState<{ isOpen: boolean; type: "success"|"error"|"info"; message: string }>({
    isOpen: false,
    type: "info",
    message: ""
  });

  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = userData?.userId || "";
  const canExportPDF = useHasHabilitation(userId, "Exporter PDF demande recrutement");

  const beginningDate = new Date(details.beginningDate);
  const fBeginningDate = formatDate(beginningDate, "dd/MM/yyyy");

  const sendingDate = new Date(details.sendingDate);
  const fSendingDate = formatDate(sendingDate, "dd/MM/yyyy à HH:mm");

  const hasDuration = details.monthDuration != null;
  const endingDate = hasDuration ? addMonths(beginningDate, details.monthDuration!) : null;
  const fEndingDate = endingDate ? formatDate(endingDate, "dd/MM/yyyy") : null;

  const fReplacementDate = details.replacementDate ? 
    formatDate(details.replacementDate, "dd/MM/yyyy") : null;


  return (
    <>
      {alert.isOpen && <Alert {...alert} onClose={() => setAlert(a => ({ ...a, isOpen: false }))} />}

      <div className="request-details-vertical">

        {/* ===== STICKY HEADER ===== */}
        <div className="sticky-top-full">
          <div className="sticky-left">
            <LabelValue label="Nom du poste" value={details.post} />
          </div>

          <div className="sticky-right">
            {canExportPDF && (
              <div className="actions-bar">
                <ButtonConfirm
                  style={{ background:"var(--pdf-color)" }}
                  onClick={() => exportRequestToPDF(details, validations)}
                >
                  <FaFilePdf /> Exporter en PDF
                </ButtonConfirm>
              </div>
            )}

            <LabelValue label="Statut">
              <RecruitmentStatusTag status={details.status}/>
            </LabelValue>
          </div>
        </div>

        {/* ===== INFORMATIONS GÉNÉRALES ===== */}
        <section className="details-section">
          <h3>Informations du poste</h3>
          <LabelValue label="Référence" value={details.id} />
          <LabelValue label="Remplacement" value={details.isReplacement?"OUI":"NON"} />
          { details.isReplacement && (<>
            <LabelValue label="Date de remplacement" value={fReplacementDate} />
            <LabelValue label="Raison de remplacement" value={details.replacementReason??details.reasonPrecision} />
              <LabelValue label="Ancien titulaire" value={details.lastTitular} />
          </>) }
          <LabelValue label="Dotation au budget" value={details.isPlanned?"Prévue":"Non prévue"} />
          { !details.isPlanned && (<>
            <LabelValue label="Motif de création de poste" value={details.notPlannedReason} />
          </>) }
        </section>

        {/* ===== ORGANISATION ===== */}
        <section className="details-section">
          <h3>Organisation</h3>
          <LabelValue label="Direction" value={details.direction} />
          <LabelValue label="Département" value={details.department} />
          <LabelValue label="Service" value={details.service} />
          <LabelValue label="Rattachement hiérarchique" value={details.hierarchicalManager} />
          <LabelValue label="Rattachement fonctionnel" value={details.functionalManager} />
        </section>

        {/* ===== CONTRAT ===== */}
        <section className="details-section">
          <h3>Contrat</h3>
          <LabelValue label="Type" value={details.contract ?? details.contractPrecision} />
          <LabelValue label="Début du contrat" value={fBeginningDate} />

          {hasDuration && (<>
            <LabelValue label="Durée" value={`${details.monthDuration} mois`} />
            <LabelValue label="Fin du contrat" value={fEndingDate} />
          </>)}

          <LabelValue label="Sites concernés" value={details.sites.join(", ")} />
        </section>

        {/* ===== CRÉATION ===== */}
        <section className="details-section">
          <h3>Création</h3>
          <LabelValue label="Régularisation" value={
            (details.applicantUser !== details.creator) ? "OUI" : "NON"
          } />
          {details.applicantUser !== details.creator && (
            <LabelValue label="Créée par" value={details.creator} />
          )}
          <LabelValue label="Demandeur" value={details.applicantUser} />
          <LabelValue label="Le" value={fSendingDate} />
        </section>
      </div>
    </>
  );
};

export default RequestDetailsCard;

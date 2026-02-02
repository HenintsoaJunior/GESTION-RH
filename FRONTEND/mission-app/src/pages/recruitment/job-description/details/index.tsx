import React from "react";
import { useGetJobDescriptionDetails, type RequestDetailsDTO } from "@/api/recruitment/service";
import { exportJobDescriptionToPDF } from "../../utils/pdfExport";
import { FaFilePdf, FaPen } from "react-icons/fa";
import { useHasHabilitation } from "@/api/users/services";
import LabelValue from "../../request/details/components/LabelValue";
import LabelList from "./components/LabelList";
import { ButtonConfirm, ButtonConfirmSecondary } from "@/styles/table-styles";
import LabelValueList from "./components/LabelValueList";
import { formatDate } from "date-fns";

interface Props {
    requestId: string;
    details: RequestDetailsDTO;
    onEdit: (jobId: string) => void;
}

const JobDetailsCard: React.FC<Props> = ({ requestId, details, onEdit }) => {
  const { data, isLoading, error } = useGetJobDescriptionDetails(requestId);

  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = userData?.userId || "";

  const canExportPDF = useHasHabilitation(userId, "Exporter PDF TDR");
  const canModify = useHasHabilitation(userId, "Modifier TDR");

  
  if (isLoading) return <p>Chargement du TDR...</p>;
  if (error) return <p>Erreur : {error.message}</p>;
  if (!data) return <p>Aucun TDR trouvé.</p>;
  
  const job = data.data;
  const createdAt = new Date(job.createdAt);
  const createdAtDateStr = formatDate(createdAt, "dd/MM/yyyy à HH:mm");

  return (
    <div className="request-details-vertical">

      {/* ===== STICKY HEADER ===== */}
      <div className="sticky-top-full">
        <div className="sticky-left">
          <LabelValue label="Nom du poste" value={job.post} />
        </div>

        <div className="sticky-right">
          <div className="actions-bar">
            {canExportPDF && (
              <ButtonConfirm
              style={{ background: "var(--pdf-color)" }}
                onClick={() => exportJobDescriptionToPDF(details, job)}
                >
                <FaFilePdf /> Exporter PDF
              </ButtonConfirm>
            )}

            {canModify && (
              <ButtonConfirmSecondary
              className="tdr-btn"
              onClick={() => onEdit(job.id)}
              >
                <FaPen /> Modifier
              </ButtonConfirmSecondary>
            )}
          </div>
        </div>
      </div>

      {/* INFOS DE BASE */}
      <section className="details-section">
        <h3>Informations supplémentaires</h3>
        <LabelValue label="Référence" value={job.id} />
        <LabelValue label="Rattachement hiérarchique" value={details.hierarchicalManager} />
        <LabelValue label="Lieu(x) de travail" value={details.sites.join(", ")} />
        <LabelValue label="Type de contrat" value={details.contract??details.contractPrecision} />
        <LabelValue label="Créé le" value={createdAtDateStr} />
      </section>

      {/* ===== MISSION ===== */}
      <section className="details-section">
        <h3>Mission</h3>
        <LabelValue label="Objectif" value={job.mission} />
      </section>

      {/* ===== ATTRIBUTIONS ===== */}
      <section className="details-section">
        <h3>Attributions</h3>
        <LabelList items={job.attributions} />
      </section>

      {/* ===== PROFIL IDEAL ===== */}
      <section className="details-section">
        <h3>Profil idéal</h3>
        <LabelValueList 
          label="Formations" items={job.formations} 
        />
        
        <LabelValueList 
          label="Expériences proffessionelles" items={job.experiences} 
        />
        
        <LabelValueList 
          label="Qualités personnelles requises" items={job.softSkills} 
        />

        <LabelValueList 
          label="Compétences requises" items={job.skills} 
        />
      </section>
    </div>
  );
};

export default JobDetailsCard;

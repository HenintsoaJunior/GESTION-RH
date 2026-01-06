import React from "react";
import { useGetJobDescriptionDetails, type JobDescriptionDetails } from "@/api/recruitment/service";
import { exportJobToPDF } from "../utils/pdfExport";
import { FaFilePdf, FaPen } from "react-icons/fa";
import { useHasHabilitation } from "@/api/users/services";

interface Props {
    requestId: string;
    onEdit: (jobId: string) => void;
}

const JobDetailsCard: React.FC<Props> = ({ requestId, onEdit }) => {
    const { data, isLoading, error } = useGetJobDescriptionDetails(requestId);

// Gestion Habilitations
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = userData?.userId || "";

    const canExportPDF = useHasHabilitation(userId, "Exporter PDF TDR");
    const canModify = useHasHabilitation(userId, "Modifier TDR");

    if (isLoading) return <p>Chargement du TDR...</p>;
    if (error) return <p>Erreur : {error.message}</p>;
    if (!data) return <p>Aucun TDR trouvé.</p>;

    const job: JobDescriptionDetails = data.data;
    
    return (
        <div className="job-details-card">
            <h3>Terme de référence associé : </h3>
            <p>
                <span className="label">Référence : </span> 
                <span className="value">{job.id}</span>
            </p>

            <p>
                <span className="label">Mission : </span> 
                <span className="value">{job.mission}</span>
            </p>

            {job.attributions.length > 0 && ( <>
                <span className="label">Attributions : </span>
                <ul>
                    {job.attributions.map((att, idx) => (
                        <li key={idx} className="value">{att}</li>
                    ))}
                </ul>
            </> )}

            {job.formations.length > 0 && ( <>
                <span className="label">Formations : </span>
                <ul>
                    {job.formations.map((f, idx) => (
                        <li key={idx} className="value">{f}</li>
                    ))}
                </ul>
            </> )}

            {job.experiences.length > 0 && ( <>
                <span className="label">Expériences : </span>
                <ul>
                    {job.experiences.map((exp, idx) => (
                        <li key={idx} className="value">{exp}</li>
                    ))}
                </ul>
            
            </> )}

            {job.softSkills.length > 0 && ( <>
                <span className="label">Qualités personnelles : </span>
                <ul>
                    {job.softSkills.map((s, idx) => (
                        <li key={idx} className="value">{s}</li>
                    ))}
                </ul>
            </> )}

            {job.skills.length > 0 && ( <>
                <span className="label">Compétences techniques : </span>
                <ul>
                    {job.skills.map((s, idx) => (
                        <li key={idx} className="value">{s}</li>
                    ))}
                </ul>
            </>)}

            {job.lastTitular && (
                <p>
                    <span className="label">Dernier titulaire : </span> 
                    <span className="value">{job.lastTitular}</span>
                </p>
            )}

            <div className="actions-bar">
                {canExportPDF && (
                    <button className="export-btn" onClick={() => exportJobToPDF(job)}>
                        <FaFilePdf size={16} />Exporter
                    </button>
                )}
                
                {canModify && (
                    <button className="export-btn tdr-btn" onClick={() => onEdit(job.id)}>
                        <FaPen size={16} />Modifier le TDR
                    </button>
                )}
            </div>
        </div>
    );
};

export default JobDetailsCard;

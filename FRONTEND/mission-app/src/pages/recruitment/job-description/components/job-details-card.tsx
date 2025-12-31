import React from "react";
import { useGetJobDescriptionDetails, type JobDescriptionDetails } from "@/api/recruitment/service";
import { exportJobToPDF } from "../utils/pdfExport";
import { FaFilePdf } from "react-icons/fa";

interface Props {
    requestId: string;
}

const JobDetailsCard: React.FC<Props> = ({ requestId }) => {
    const { data, isLoading, error } = useGetJobDescriptionDetails(requestId);

    if (isLoading) return <p>Chargement de la fiche de poste...</p>;
    if (error) return <p>Erreur : {error.message}</p>;
    if (!data) return <p>Aucune fiche de poste trouvée.</p>;

    const job: JobDescriptionDetails = data.data;
    
    return (
        <div className="job-details-card">
            <h3>Fiche de poste associée : </h3>
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

            <button className="export-btn" onClick={() => exportJobToPDF(job)}>
                <FaFilePdf size={16} />Exporter
            </button>
        </div>
    );
};

export default JobDetailsCard;

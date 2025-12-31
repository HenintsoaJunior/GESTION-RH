import { useGetRecruitmentRequestDetails, useHasJobDescription } from "@/api/recruitment/service";
import ProtectedRoute from "@/components/protected-route";
import { useNavigate, useParams } from "react-router-dom";
import RequestDetailsCard from "./components/request-details-card";
import JobDetailsCard from "../job-description/components/job-details-card";
import { ArrowLeft } from "lucide-react";
import "./details.css";

const RequestDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const {
        data: jobDescData,
        isLoading: loadingJobDesc
    } = useHasJobDescription(id ?? "");

    const hasJobDescription = jobDescData?.hasJobDescription ?? false;
    const { data, isLoading, error } = useGetRecruitmentRequestDetails(id ?? "");
    if (!id) return <p>ID invalide</p>;

    if (isLoading || loadingJobDesc) return <p>Chargement...</p>;
    if (error) return <p>Erreur : {error.message}</p>;
    if (!data) return <p>Aucune donnée trouvée.</p>;

    return (
        <div className="request-details-container">
        {/* Bouton de retour */}
            <button className="back-btn" onClick={() => navigate(-1)}>
                <ArrowLeft size={18} /> Retour
            </button>

            <RequestDetailsCard hasJobDescription={hasJobDescription}
                details={data.details}
                validations={data.validations}
            />

            { hasJobDescription && (
                <JobDetailsCard requestId={data.details.id} />
            )}
        </div>
    );
};

const ProtectedRequestDetails: React.FC = () => (
    <ProtectedRoute requiredHabilitation="Afficher détails demande recrutement">
        <RequestDetails />
    </ProtectedRoute>
);

export default ProtectedRequestDetails;

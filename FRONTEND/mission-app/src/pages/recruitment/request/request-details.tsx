import { useGetRecruitmentRequestDetails } from "@/api/recruitment/service";
import ProtectedRoute from "@/components/protected-route";
import { useParams } from "react-router-dom";
import RequestDetailsCard from "./components/request-details-card";

const RequestDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const response = useGetRecruitmentRequestDetails(id!);

  const details = response.data?.data;

  if (response.isLoading) return <p>Chargement...</p>;
  if (!details) return <p>Aucune donnée trouvée.</p>;

  return <RequestDetailsCard details={details} />;
};

const ProtectedRequestDetails: React.FC = () => (
  <ProtectedRoute requiredHabilitation="Afficher détails demande recrutement">
    <RequestDetails />
  </ProtectedRoute>
);

export default ProtectedRequestDetails;

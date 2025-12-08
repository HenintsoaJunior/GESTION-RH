import ProtectedRoute from "@/components/protected-route";

const RequestDetails : React.FC = () => {
  return (<>
    Détails de la demande de recrutement
  </>);
}


// Page protégée
const ProtectedRequestDetails: React.FC = () => (
  <ProtectedRoute requiredHabilitation="Lister détails demande recrutement">
    <RequestDetails />
  </ProtectedRoute>
);

export default ProtectedRequestDetails;

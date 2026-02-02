import { useState } from "react";
import JobDetailsCard from "@/pages/recruitment/job-description/details";
import JobDescriptionForm from "@/pages/recruitment/job-description/form";
import { ButtonPrimary } from "@/styles/popup-styles";
import { Plus } from "lucide-react";
import type { RequestDetailsDTO } from "@/api/recruitment/service";

const JobTabContent: React.FC<{
  requestId: string;
  details: RequestDetailsDTO;
  requestStatus: string;
  hasJobDescription?: boolean;
}> = ({ requestId, details, requestStatus, hasJobDescription }) => {

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [jobId, setJobId] = useState<string | null>(null);

  const canOpenJobDescriptionForm =  requestStatus.toLowerCase()==="validée";

  // 👉 création
  const openCreateForm = () => {
    setMode("create");
    setJobId(null);
    setIsFormOpen(true);
  };

  // 👉 modification
  const openEditForm = (id: string) => {
    setMode("edit");
    setJobId(id);
    setIsFormOpen(true);
  };

  const closeForm = () => setIsFormOpen(false);

  return (<>
    {!hasJobDescription ? (
      <div className="empty-state">
        <h3>Aucun terme de référence</h3>
        <p style={{ marginBottom:"2%" }}>Cette demande n’a pas encore de terme de référence.</p>

        { !canOpenJobDescriptionForm ? (
          <p className="text-note">La demande nécessite une validation complète.
          </p>
        ) : (
          <ButtonPrimary className="primary-btn" onClick={openCreateForm}>
            <Plus /> Créer un terme de référence
          </ButtonPrimary>
        )}        
      </div>
    ) : (
      <JobDetailsCard
        details={details}
        requestId={requestId}
        onEdit={openEditForm}
      />
    )}

    <JobDescriptionForm
      isOpen={isFormOpen}
      requestId={requestId}
      jobId={jobId}
      mode={mode}
      onClose={closeForm}
      onFormSuccess={(type, message) => {
        console.log(type, message);
      }}
    />
  </>);
};

export default JobTabContent;

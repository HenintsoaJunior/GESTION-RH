import { 
    normalizeStatus 
} from "@/pages/recruitment/request/details/components/RequestDetailsCard";
import React from "react";

interface RecruitmentStatusProps {
  status: string;
}

const RecruitmentStatusTag: React.FC<RecruitmentStatusProps> = ({ status }) => {
  return (
    <span className={`status-chip status-${normalizeStatus(status)}`}>
        <span className="status-dot" /> {status.toUpperCase()}
    </span>
  );
};

export default RecruitmentStatusTag;

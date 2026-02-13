import React from "react";
import { Edit, Trash2 } from "lucide-react";
import { TableRow, TableCell, EditButton, CancelButton } from "@/styles/table-styles";
import { Link } from "react-router-dom";
import type { RecruitmentRequest } from "@/types/recruitment";
import RecruitmentStatusTag from "@/components/recruitment-status";
import { formatRequestId } from "../../form";

interface RequestTableRowProps {
  request: RecruitmentRequest;
  canViewDetails?: boolean;
  canEditRequest?: boolean;
  canCancelRequest?: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const RequestTableRow: React.FC<RequestTableRowProps> = ({ request, canEditRequest, canCancelRequest, onEdit, onDelete }) => {
  return (
    <TableRow>
      <TableCell>
        {/* {canViewDetails ?  */}
        <Link style={{ textDecoration: "none" }} to={`/recrutement/demandes/${formatRequestId(request.id)}/details`}>{request.id}</Link>
        {/* } */}
      </TableCell>
      <TableCell>{request.post}</TableCell>
      <TableCell style={{ textAlign:"end" }}>{request.effective}</TableCell>
      <TableCell>{request.contract || "N/A"}</TableCell>
      <TableCell>{request.wishedDate ? new Date(request.wishedDate).toLocaleDateString("fr-FR") : "N/A"}</TableCell>
      <TableCell style={{ textAlign:"center" }}>
        { request.status ? (
          <RecruitmentStatusTag status={request.status} />
        ) : ("N/A") }
      </TableCell>
      <TableCell>{request.sendingDate ? new Date(request.sendingDate).toLocaleDateString("fr-FR") : "N/A"}</TableCell>
      <TableCell style={{ textAlign: "center" }}>
        { canEditRequest &&
          <EditButton onClick={() => onEdit(request.id)}
           disabled={request.status?.toLowerCase()!=="en attente"}>
            <Edit size={16} />
          </EditButton>
        }
        
        { canCancelRequest && 
          <CancelButton onClick={() => onDelete(request.id)}
           disabled={request.status?.toLowerCase()!=="en attente"}>
            <Trash2 size={16} />
          </CancelButton>
        }
      </TableCell>
    </TableRow>
  );
};

export default RequestTableRow;

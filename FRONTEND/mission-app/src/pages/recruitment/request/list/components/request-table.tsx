import React from "react";
import { DataTable, TableContainer, TableHeader, TableTitle, TableActions, TableHeadCell, Loading, NoDataMessage, ButtonConfirm, ButtonConfirmSecondary } from "@/styles/table-styles";
import RequestTableRow from "./request-table-row";
import Pagination from "@/components/pagination";
import { Plus } from "lucide-react";
import type { RecruitmentRequest } from "@/types/recruitment";

interface RequestTableProps {
  requests: RecruitmentRequest[];
  isLoading: boolean;
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void; // ✅ recevoir un nombre et non un event
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  canAddRequest?: boolean;
  canAddRegularisation?: boolean;
  canEditRequest?: boolean;
  canCancelRequest?: boolean;
  canViewDetails?: boolean;
  onAddRequest?: () => void; // pour ouvrir la demande simple
  onAddRegularisation?: () => void; // pour ouvrir la demande de régularisation
}

const RequestTable: React.FC<RequestTableProps> = ({
  requests,
  isLoading,
  totalCount,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
  canAddRequest,
  canAddRegularisation,
  canEditRequest,
  canCancelRequest,
  canViewDetails,
  onAddRequest,
  onAddRegularisation,
}) => {

  // Transforme un event en nombre pour PageSize
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value, 10);
    onPageSizeChange(value);
  };

  return (
    <TableContainer>
      <TableHeader style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <TableTitle>Liste des demandes de recrutement</TableTitle>

        <TableActions>
          {canAddRequest && onAddRequest && (
            <ButtonConfirm onClick={onAddRequest}>
              <Plus size={16} style={{ marginRight: "8px" }} />
              Créer une demande
            </ButtonConfirm>
          )}

          {canAddRegularisation && onAddRegularisation && (
            <ButtonConfirmSecondary onClick={onAddRegularisation}>
              <Plus size={16} style={{ marginRight: "8px" }} />
              Demander une régularisation
            </ButtonConfirmSecondary>
          )}
        </TableActions>
      </TableHeader>

      <DataTable>
        <thead>
          <tr>
            <TableHeadCell style={{ textAlign:"center" }}>Référence</TableHeadCell>
            <TableHeadCell style={{ textAlign:"center" }}>Poste</TableHeadCell>
            <TableHeadCell style={{ textAlign:"center" }}>Efféctif</TableHeadCell>
            <TableHeadCell style={{ textAlign:"center" }}>Type de contrat</TableHeadCell>
            <TableHeadCell style={{ textAlign:"center" }}>Date souhaitée</TableHeadCell>
            <TableHeadCell style={{ textAlign:"center" }}>Statut</TableHeadCell>
            <TableHeadCell style={{ textAlign:"center" }}>Date de demande</TableHeadCell>
            <TableHeadCell style={{ width: "100px", textAlign: "center" }}>Actions</TableHeadCell>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr><td colSpan={8}><Loading>Chargement des données...</Loading></td></tr>
          ) : requests.length > 0 ? (
            requests.map(req => (
              <RequestTableRow
                key={req.id}
                request={req}
                canViewDetails={canViewDetails}
                canEditRequest={canEditRequest}
                canCancelRequest={canCancelRequest}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          ) : (
            <tr>
              <td colSpan={8}><NoDataMessage>Aucune demande trouvée.</NoDataMessage></td>
            </tr>
          )}
        </tbody>
      </DataTable>

      <Pagination
        currentPage={page}
        pageSize={pageSize}
        totalEntries={totalCount}
        onPageChange={onPageChange}
        onPageSizeChange={handlePageSizeChange} // ✅ corrigé
      />
    </TableContainer>
  );
};

export default RequestTable;

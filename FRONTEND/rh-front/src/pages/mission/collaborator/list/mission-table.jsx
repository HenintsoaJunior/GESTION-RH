// Fichier : mission-table.jsx (version modifiée avec logs de débogage supplémentaires)

import { formatDate } from "utils/dateConverter";
import {
    TableContainer,
    DataTable,
    TableRow,
    TableCell,
    TableHeadCell,
    Loading,
    NoDataMessage,
    StatusBadge,
    ActionButtons,
    ButtonUpdate,
    ButtonCancel,
} from "styles/generaliser/table-container";
import Pagination from "components/pagination";

const MissionTable = ({
                          assignedPersons,
                          isLoading,
                          permissions,
                          handleRowClick,
                          handleEditMission,
                          handleShowCancelModal,
                          currentPage,
                          pageSize,
                          totalEntries,
                          handlePageChange,
                          handlePageSizeChange,
                          appliedFilters,
                      }) => {
    const getStatusBadge = (status) => {
        const statusClass =
            status === "En Cours"
                ? "status-progress"
                : status === "Planifié"
                    ? "status-pending"
                    : status === "Terminé"
                        ? "status-approved"
                        : status === "Annulé"
                            ? "status-cancelled"
                            : "status-pending";
        return <StatusBadge className={statusClass}>{status || "Inconnu"}</StatusBadge>;
    };

    const renderActionButtons = (assignment) => {
        const missionPermissions = permissions[assignment.missionId] || { canModify: false, canCancel: false };
        if (!missionPermissions.canModify && !missionPermissions.canCancel) {
            return <TableCell>—</TableCell>;
        }
        return (
            <TableCell>
                <ActionButtons>
                    {missionPermissions.canModify && (
                        <ButtonUpdate
                            onClick={(e) => {
                                e.stopPropagation();
                                handleEditMission(assignment.missionId);
                            }}
                        >
                            Modifier
                        </ButtonUpdate>
                    )}
                    {missionPermissions.canCancel && (
                        <ButtonCancel
                            onClick={(e) => {
                                e.stopPropagation();
                                handleShowCancelModal(assignment.missionId);
                            }}
                        >
                            Annuler
                        </ButtonCancel>
                    )}
                </ActionButtons>
            </TableCell>
        );
    };

    return (
        <>
            <TableContainer>
                <DataTable>
                    <thead>
                    <tr>
                        <TableHeadCell>ID Mission</TableHeadCell>
                        <TableHeadCell>Bénéficiaire</TableHeadCell>
                        <TableHeadCell>Matricule</TableHeadCell>
                        <TableHeadCell>Mission</TableHeadCell>
                        <TableHeadCell>Fonction</TableHeadCell>
                        <TableHeadCell>Lieu</TableHeadCell>
                        <TableHeadCell>Date début</TableHeadCell>
                        <TableHeadCell>Date Fin</TableHeadCell>
                        <TableHeadCell>Statut</TableHeadCell>
                        <TableHeadCell>Action</TableHeadCell>
                    </tr>
                    </thead>
                    <tbody>
                    {isLoading.assignMissions ? (
                        <TableRow>
                            <TableCell colSpan={10}>
                                <Loading>Chargement des données...</Loading>
                            </TableCell>
                        </TableRow>
                    ) : assignedPersons.length > 0 ? (
                        assignedPersons.map((assignment, index) => (
                            <TableRow
                                key={`${assignment.employeeId}-${assignment.missionId}-${assignment.transportId}-${index}`}
                                $clickable
                                onClick={(e) => {
                                    console.log("Row clicked - missionId:", assignment.missionId); // Log existant pour débogage
                                    handleRowClick(assignment.missionId);
                                }}
                            >
                                <TableCell>{assignment.assignationId || "Non spécifié"}</TableCell>
                                <TableCell>
                                    {assignment.beneficiary && assignment.directionAcronym
                                        ? `${assignment.beneficiary} (${assignment.directionAcronym})`
                                        : assignment.beneficiary || "Non spécifié"}
                                </TableCell>
                                <TableCell>{assignment.matricule || "Non spécifié"}</TableCell>
                                <TableCell>{assignment.missionTitle || "Non spécifié"}</TableCell>
                                <TableCell>{assignment.function || "Non spécifié"}</TableCell>
                                <TableCell>{assignment.lieu || "Non spécifié"}</TableCell>
                                <TableCell>{formatDate(assignment.startDate) || "Non spécifié"}</TableCell>
                                <TableCell>{formatDate(assignment.endDate) || "Non spécifié"}</TableCell>
                                <TableCell>{getStatusBadge(assignment.status)}</TableCell>
                                {renderActionButtons(assignment)}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={10}>
                                <NoDataMessage>
                                    {appliedFilters.employeeId ||
                                    appliedFilters.missionId ||
                                    appliedFilters.status ||
                                    appliedFilters.startDate ||
                                    appliedFilters.endDate ||
                                    appliedFilters.matricule.length > 0
                                        ? "Aucune assignation de mission ne correspond aux critères de recherche."
                                        : "Aucune assignation de mission trouvée."}
                                </NoDataMessage>
                            </TableCell>
                        </TableRow>
                    )}
                    </tbody>
                </DataTable>
            </TableContainer>
            <Pagination
                currentPage={currentPage}
                pageSize={pageSize}
                totalEntries={totalEntries}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                disabled={isLoading.assignMissions}
            />
        </>
    );
};

export default MissionTable;
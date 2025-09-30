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
        const normalizedStatus = (status || "").toLowerCase().trim();

        const statusTextMap = {
            "in progress": "En Cours",
            "planned": "Planifié",
            "completed": "Terminé",
            "cancelled": "Annulé",
        };

        const statusClassName =
            normalizedStatus === "in progress"
                ? "status-progress"
                : normalizedStatus === "planned"
                    ? "status-pending"
                    : normalizedStatus === "completed"
                        ? "status-completed"
                        : normalizedStatus === "cancelled"
                            ? "status-cancelled"
                            : "status-unknown"; 

        const displayText = statusTextMap[normalizedStatus] || "Inconnu";

        return <StatusBadge className={statusClassName}>{displayText}</StatusBadge>;
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
                        <TableHeadCell>Mission</TableHeadCell>
                        <TableHeadCell>Mission Type</TableHeadCell>
                        <TableHeadCell>Collaborateur</TableHeadCell>
                        <TableHeadCell>Matricule</TableHeadCell>
                        <TableHeadCell>Lieu</TableHeadCell>
                        <TableHeadCell>Date dépard</TableHeadCell>
                        <TableHeadCell>Date Arrivée</TableHeadCell>
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
                                    console.log("Row clicked - missionId:", assignment.missionId);
                                    handleRowClick(assignment.missionId);
                                }}
                            >
                                <TableCell>{assignment.assignationId || "Non spécifié"}</TableCell>
                                <TableCell>{assignment.missionTitle || "Non spécifié"}</TableCell>
                                <TableCell>{assignment.MissionType || "Non spécifié"}</TableCell>
                                <TableCell>
                                    {assignment.beneficiary && assignment.directionAcronym
                                        ? `${assignment.beneficiary} (${assignment.directionAcronym})`
                                        : assignment.beneficiary || "Non spécifié"}
                                </TableCell>
                                <TableCell>{assignment.matricule || "Non spécifié"}</TableCell>
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
                                    appliedFilters.minDepartureDate ||
                                    appliedFilters.maxDepartureDate ||
                                    appliedFilters.minArrivalDate ||
                                    appliedFilters.maxArrivalDate ||
                                    appliedFilters.lieuId ||
                                    appliedFilters.matricule?.length > 0
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
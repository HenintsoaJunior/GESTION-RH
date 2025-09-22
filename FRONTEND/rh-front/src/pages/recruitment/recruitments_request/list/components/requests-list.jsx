import { useMemo } from "react";
import { formatDate } from "utils/dateConverter";
import Pagination from "components/pagination";
import {
    TableContainer,
    DataTable,
    TableHeadCell,
    TableRow,
    TableCell,
    StatusBadge,
    Loading,
    NoDataMessage,
} from "styles/generaliser/table-container";

const RequestsList = ({
    requests = [],
    sites = [],
    currentPage,
    pageSize,
    totalEntries,
    isLoading = false,
    onRowClick,
    onPageChange,
    onPageSizeChange
}) => {
    // Create site map for quick lookups
    const siteMap = useMemo(() => {
        const map = {};
        sites.forEach((site) => {
            map[site.siteId] = site.siteName;
        });
        return map;
    }, [sites]);

    // Status badge component
    const getStatusBadge = (status) => {
        const statusClass =
            status === "BROUILLON"
                ? "status-pending"
                : status === "En Cours"
                    ? "status-progress"
                    : status === "Approuvé"
                        ? "status-approved"
                        : status === "Rejeté"
                            ? "status-rejected"
                            : "status-pending";
        return <StatusBadge className={statusClass}>{status || "Inconnu"}</StatusBadge>;
    };

    // Handle row click
    const handleRowClick = (requestId) => {
        console.log("RequestsList - Clicked requestId:", requestId); // Debug log
        if (requestId && typeof onRowClick === 'function') {
            onRowClick(requestId);
        } else {
            console.warn(`Row click failed: requestId=${requestId}, onRowClick=${typeof onRowClick}`);
        }
    };

    return (
        <>
            <TableContainer>
                <DataTable>
                    <thead>
                        <tr>
                            <TableHeadCell>Poste</TableHeadCell>
                            <TableHeadCell>Effectif</TableHeadCell>
                            <TableHeadCell>Type Contrat</TableHeadCell>
                            <TableHeadCell>Direction</TableHeadCell>
                            <TableHeadCell>Département</TableHeadCell>
                            <TableHeadCell>Service</TableHeadCell>
                            <TableHeadCell>Site</TableHeadCell>
                            <TableHeadCell>Statut</TableHeadCell>
                            <TableHeadCell>Date demande</TableHeadCell>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={9}>
                                    <Loading>Chargement...</Loading>
                                </TableCell>
                            </TableRow>
                        ) : requests.length > 0 ? (
                            requests.map((request) => (
                                <TableRow
                                    key={request.recruitmentRequestId}
                                    $clickable={true}
                                    onClick={() => handleRowClick(request.recruitmentRequestId)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <TableCell>
                                        {request.recruitmentRequest?.positionTitle || "Non spécifié"}
                                    </TableCell>
                                    <TableCell>
                                        {request.recruitmentRequest?.positionCount || 0}
                                    </TableCell>
                                    <TableCell>
                                        {request.recruitmentRequest?.contractType?.label
                                            ? `${request.recruitmentRequest.contractType.label} (${request.recruitmentRequest.contractType.code || ''})`
                                            : "Non spécifié"}
                                    </TableCell>
                                    <TableCell>
                                        {request.direction?.directionName
                                            ? `${request.direction.directionName} (${request.direction.acronym || ''})`
                                            : "Non spécifié"}
                                    </TableCell>
                                    <TableCell>
                                        {request.department?.departmentName || "Non spécifié"}
                                    </TableCell>
                                    <TableCell>
                                        {request.service?.serviceName || "Non spécifié"}
                                    </TableCell>
                                    <TableCell>
                                        {siteMap[request.recruitmentRequest?.siteId] || "Non spécifié"}
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(request.recruitmentRequest?.status)}
                                    </TableCell>
                                    <TableCell>
                                        {formatDate(request.recruitmentRequest?.createdAt) || "Non spécifié"}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={9}>
                                    <NoDataMessage>Aucune donnée trouvée.</NoDataMessage>
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
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
                disabled={isLoading}
            />
        </>
    );
};

export default RequestsList;
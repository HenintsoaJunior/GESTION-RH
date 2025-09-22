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

const JobOffersList = ({
    jobOffers = [],
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
            status === "Brouillon"
                ? "status-pending"
                : status === "Publié"
                    ? "status-approved"
                    : status === "Fermé"
                        ? "status-rejected"
                        : "status-pending";
        return <StatusBadge className={statusClass}>{status || "Inconnu"}</StatusBadge>;
    };

    // Handle row click
    const handleRowClick = (offerId) => {
        console.log("JobOffersList - Clicked offerId:", offerId);
        if (offerId && typeof onRowClick === 'function') {
            onRowClick(offerId);
        } else {
            console.warn(`Row click failed: offerId=${offerId}, onRowClick=${typeof onRowClick}`);
        }
    };

    return (
        <>
            <TableContainer>
                <DataTable>
                    <thead>
                        <tr>
                            <TableHeadCell>Poste</TableHeadCell>
                            <TableHeadCell>Type de Contrat</TableHeadCell>
                            <TableHeadCell>Durée (mois)</TableHeadCell>
                            <TableHeadCell>Site</TableHeadCell>
                            <TableHeadCell>Statut</TableHeadCell>
                            <TableHeadCell>Date de publication</TableHeadCell>
                            <TableHeadCell>Date limite</TableHeadCell>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7}>
                                    <Loading>Chargement...</Loading>
                                </TableCell>
                            </TableRow>
                        ) : jobOffers.length > 0 ? (
                            jobOffers.map((offer) => (
                                <TableRow
                                    key={offer.offerId}
                                    $clickable={true}
                                    onClick={() => handleRowClick(offer.offerId)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <TableCell>{offer.title || "Non spécifié"}</TableCell>
                                    <TableCell>{offer.contractType?.label || "Non spécifié"}</TableCell>
                                    <TableCell>{offer.duration || "N/A"}</TableCell>
                                    <TableCell>{siteMap[offer.siteId] || "Non spécifié"}</TableCell>
                                    <TableCell>{getStatusBadge(offer.status)}</TableCell>
                                    <TableCell>{formatDate(offer.publicationDate) || "Non spécifié"}</TableCell>
                                    <TableCell>{formatDate(offer.deadlineDate) || "Non spécifié"}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7}>
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

export default JobOffersList;
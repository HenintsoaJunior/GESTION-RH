"use client";

import { ArrowLeft, Download } from "lucide-react";
import {
    DetailSection,
    SectionTitle,
    InfoGrid,
    InfoItem,
    InfoLabel,
    InfoValue,
    IndemnityTable,
    TableHeader,
    TableCell,
    TotalRow,
    ActionButton,
} from "styles/generaliser/details-mission-container";
import { NoDataMessage } from "styles/generaliser/table-container";

const OMPayment = ({ missionPayment, selectedAssignmentId, onBack, onExportPDF, onExportExcel, isLoading, formatDate }) => {
    const formatNumber = (num) => {
        return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") : "0";
    };

    const indemnityDetails = missionPayment.dailyPaiements.map((item) => {
        const amounts = {
            breakfast: 0,
            lunch: 0,
            dinner: 0,
            accommodation: 0,
            transport: 0,
        };

        item.compensationScales.forEach((scale) => {
            const amount = scale.amount || 0;
            if (scale.expenseType?.type === "Petit Déjeuner") amounts.breakfast += amount;
            else if (scale.expenseType?.type === "Déjeuner") amounts.lunch += amount;
            else if (scale.expenseType?.type === "Dinner") amounts.dinner += amount;
            else if (scale.expenseType?.type === "Hébergement") amounts.accommodation += amount;
            else if (scale.transportId) amounts.transport += amount;
        });

        return {
            date: item.date,
            breakfast: amounts.breakfast,
            lunch: amounts.lunch,
            dinner: amounts.dinner,
            accommodation: amounts.accommodation,
            transport: amounts.transport,
            total: item.totalAmount,
        };
    });

    return (
        <>
            <div className="page-header">
                <div className="header-left">
                    <button onClick={onBack} className="btn-back" title="Retour aux assignations">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="header-title-section">
                        <h1 className="page-title">Détails du Paiement</h1>
                        <p className="page-subtitle">Mission #{selectedAssignmentId}</p>
                    </div>
                </div>
                <div className="header-actions">
                    <ActionButton
                        onClick={onExportExcel}
                        disabled={isLoading.exportExcel}
                    >
                        <Download size={16} /> Excel
                    </ActionButton>
                </div>
            </div>

            {missionPayment.assignmentDetails ? (
                <>
                    <SectionTitle>Informations Générales</SectionTitle>
                    <DetailSection>
                        <InfoGrid>
                            {[
                                { label: "Collaborateur", value: missionPayment.assignmentDetails.beneficiary },
                                { label: "Matricule", value: missionPayment.assignmentDetails.matricule },
                                { label: "Mission", value: missionPayment.assignmentDetails.missionTitle },
                                { label: "Fonction", value: missionPayment.assignmentDetails.function },
                                { label: "Site", value: missionPayment.assignmentDetails.base },
                                { label: "Moyen de transport", value: missionPayment.assignmentDetails.meansOfTransport },
                                { label: "Direction", value: missionPayment.assignmentDetails.direction },
                                { label: "Département/Service", value: missionPayment.assignmentDetails.departmentService },
                                { label: "Centre de coût", value: missionPayment.assignmentDetails.costCenter },
                                { label: "Date de départ", value: formatDate(missionPayment.assignmentDetails.departureDate) },
                                { label: "Heure de départ", value: missionPayment.assignmentDetails.departureTime },
                                { label: "Durée de la mission", value: `${missionPayment.assignmentDetails.missionDuration} jours` },
                                { label: "Date de retour", value: formatDate(missionPayment.assignmentDetails.returnDate) },
                                { label: "Heure de retour", value: missionPayment.assignmentDetails.returnTime },
                                { label: "Date debut mission", value: formatDate(missionPayment.assignmentDetails.startDate) },
                            ].map((item, index) => (
                                <InfoItem key={index}>
                                    <InfoLabel>{item.label}</InfoLabel>
                                    <InfoValue>{item.value}</InfoValue>
                                </InfoItem>
                            ))}
                        </InfoGrid>
                    </DetailSection>

                    <SectionTitle>Régularisation des Indemnités de Mission</SectionTitle>
                    <IndemnityTable>
                        <thead>
                            <tr>
                                <TableHeader>Date</TableHeader>
                                <TableHeader>Transport</TableHeader>
                                <TableHeader>Petit Déjeuner</TableHeader>
                                <TableHeader>Déjeuner</TableHeader>
                                <TableHeader>Dîner</TableHeader>
                                <TableHeader>Hébergement</TableHeader>
                                <TableHeader>Montant Total</TableHeader>
                            </tr>
                        </thead>
                        <tbody>
                            {indemnityDetails.map((item, index) => (
                                <tr key={index}>
                                    <TableCell>
                                        {item.date
                                            ? new Date(item.date).toLocaleDateString("fr-FR", {
                                                  day: "numeric",
                                                  month: "short",
                                                  year: "2-digit",
                                              })
                                            : ""}
                                    </TableCell>
                                    <TableCell>{item.transport ? `${formatNumber(item.transport)},00` : ""}</TableCell>
                                    <TableCell>{item.breakfast ? `${formatNumber(item.breakfast)},00` : ""}</TableCell>
                                    <TableCell>{item.lunch ? `${formatNumber(item.lunch)},00` : ""}</TableCell>
                                    <TableCell>{item.dinner ? `${formatNumber(item.dinner)},00` : ""}</TableCell>
                                    <TableCell>{item.accommodation ? `${formatNumber(item.accommodation)},00` : ""}</TableCell>
                                    <TableCell>{item.total ? `${formatNumber(item.total)},00` : ""}</TableCell>
                                </tr>
                            ))}
                            <TotalRow>
                                <TableCell colSpan={6}>Total</TableCell>
                                <TableCell><strong>{formatNumber(missionPayment.totalAmount)},00</strong></TableCell>
                            </TotalRow>
                        </tbody>
                    </IndemnityTable>
                </>
            ) : (
                <NoDataMessage>Aucune donnée trouvée pour cette assignation.</NoDataMessage>
            )}
        </>
    );
};

export default OMPayment;

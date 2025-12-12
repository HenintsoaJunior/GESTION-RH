"use client";

import React from "react";
import {
    Calendar,
    User,
    MapPin,
    Eye,
    CheckCircle,
    Check
} from "lucide-react";

import {
    CardsPaginationContainer,
    MissionCardsContainer as CardsContainer,
    Card,
    CardHeader,
    CardTitle,
    CardInfo,
    ActionsContainer,
    ActionButton,
    IndicatorBlock,
    IndicatorValue,
    IndicatorText,
} from "@/styles/card-styles";

import { StatusBadge, STATUSES } from "@/components/status";
import Pagination from "@/components/pagination";
import { Loading, NoDataMessage } from "@/styles/table-styles";
import type { RequestDetailsDTO } from "@/api/recruitment/service";

interface PendingRequestCardsProps {
    requests: RequestDetailsDTO[];
    isLoading: boolean;
    totalEntries: number;
    currentPage: number;
    pageSize: number;
    handlePageChange: (page: number) => void;
    handlePageSizeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    formatDate: (date: string) => string;
    handleRowClick: (id: string) => void;
    handleOpenValidationForm: (id: string) => void;   // <--- AJOUTÉ
}

const PendingRequestCards: React.FC<PendingRequestCardsProps> = ({
    requests,
    isLoading,
    totalEntries,
    currentPage,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    formatDate,
    handleRowClick,
    handleOpenValidationForm
}) => {

    const getStatusObject = (status: string) => {
        return (
            STATUSES.find((s) => s.id === status) ?? {
                id: status,
                label: status,
                color: "#6b7280",
                category: "progress",
            }
        );
    };

    const renderValidationIndicator = (level: number) => {
        return (
            <IndicatorBlock
                $daysUntilDue={999}
                style={{
                    border: "2px solid var(--primary-color)",
                    boxShadow: "0 2px 8px rgba(59,130,246,0.15)",
                }}
            >
                <CheckCircle size={22} />
                <IndicatorValue style={{ fontSize: "20px", fontWeight: "bold" }}>
                    {level}
                </IndicatorValue>
                <IndicatorText
                    style={{
                        fontSize: "10px",
                        fontWeight: "600",
                        letterSpacing: "0.3px",
                    }}
                >
                    VALIDATION(S)
                </IndicatorText>
            </IndicatorBlock>
        );
    };

    return (
        <CardsPaginationContainer style={{ maxWidth: "100%", overflowX: "hidden" }}>

            {/* LISTE DES CARTES */}
            <CardsContainer
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "1rem",
                }}
            >
                {isLoading ? (
                    <Loading>Chargement des demandes...</Loading>
                ) : requests.length > 0 ? (
                    <>
                        {requests.map((req) => (
                            <Card key={req.id} style={{ display: "flex", flexDirection: "column", height: "100%" }}>

                                {renderValidationIndicator(req.validationLevel)}

                                <CardHeader style={{ marginBottom: "0.5rem" }}>
                                    <CardTitle style={{ fontSize: "0.9rem" }}>
                                        {req.applicantUser}
                                    </CardTitle>
                                    <StatusBadge status={getStatusObject(req.status)} />
                                </CardHeader>

                                <CardInfo style={{ gap: "0.4rem", flex: 1 }}>

                                    {/* SITES */}
                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
                                        padding: "6px 0",
                                        flexWrap: "wrap",
                                    }}>
                                        <MapPin size={14} style={{ color: "var(--primary-color)" }} />
                                        <div style={{
                                            fontSize: "12px",
                                            fontWeight: "500",
                                            color: "var(--text-color)",
                                        }}>
                                            {req.sites?.join(", ") || "Aucun site"}
                                        </div>
                                    </div>

                                    {/* CONTRAT */}
                                    <div style={{
                                        fontSize: "12px",
                                        color: "var(--text-color)",
                                        fontWeight: "500",
                                    }}>
                                        <User size={12} /> {req.contract || "Contrat non défini"}
                                    </div>

                                    {/* DATE */}
                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
                                        padding: "6px 0",
                                        flexWrap: "wrap",
                                    }}>
                                        <Calendar size={14} style={{ color: "var(--primary-color)" }} />
                                        <div style={{
                                            flex: 1,
                                            display: "flex",
                                            alignItems: "center",
                                            fontSize: "11px",
                                        }}>
                                            {formatDate(req.beginningDate)}
                                        </div>
                                    </div>

                                </CardInfo>

                                {/* ACTIONS */}
                                <ActionsContainer style={{ marginTop: "auto" }}>
                                    <ActionButton
                                        className="details"
                                        onClick={() => handleRowClick(req.id)}
                                    >
                                        <Eye size={14} />
                                        Voir détails
                                    </ActionButton>

                                    <ActionButton
                                        className="validate"
                                        style={{ backgroundColor: "var(--primary-color)", color: "#fff" }}
                                        onClick={() => handleOpenValidationForm(req.id)}
                                    >
                                        <Check size={14} />
                                        Valider
                                    </ActionButton>
                                </ActionsContainer>

                            </Card>
                        ))}
                    </>
                ) : (
                    <NoDataMessage>Aucune demande trouvée.</NoDataMessage>
                )}
            </CardsContainer>

            {/* PAGINATION */}
            {totalEntries > 0 && (
                <Pagination
                    currentPage={currentPage}
                    pageSize={pageSize}
                    totalEntries={totalEntries}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                />
            )}
        </CardsPaginationContainer>
    );
};

export default PendingRequestCards;

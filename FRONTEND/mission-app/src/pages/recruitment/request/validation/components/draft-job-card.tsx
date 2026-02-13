"use client";

import React from "react";
import {
    Send,
    User,
    Eye,
    CheckCircle,
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

import Pagination from "@/components/pagination";
import { Loading, NoDataMessage } from "@/styles/table-styles";
import RecruitmentStatusTag from "@/components/recruitment-status";
import type { JobDescriptionDetailsDTO } from "@/api/recruitment/service";

interface DraftJobCardsProps {
    jobDescriptions: JobDescriptionDetailsDTO[];
    isLoading: boolean;
    totalEntries: number;
    currentPage: number;
    pageSize: number;
    handlePageChange: (page: number) => void;
    handlePageSizeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    formatDate: (date: string) => string;
    handleRowClick: (id: string) => void;
}

const DraftJobCards: React.FC<DraftJobCardsProps> = ({
    jobDescriptions,
    isLoading,
    totalEntries,
    currentPage,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    formatDate,
    handleRowClick,
}) => {
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
                    <Loading>Chargement des TDR...</Loading>
                ) : jobDescriptions.length > 0 ? (
                    <>
                        {jobDescriptions.map((job) => (
                            <Card key={job.id} style={{ display: "flex", flexDirection: "column", height: "100%" }}>

                                {renderValidationIndicator(job.level)}

                                <CardHeader style={{ marginBottom: "0.5rem" }}>
                                    {/* DEMANDEUR */}
                                    <CardTitle style={{ fontSize: "0.9rem" }}>
                                        {job.applicantUser}
                                    </CardTitle>

                                    {/* STATUT */}
                                    <RecruitmentStatusTag status={job.lastStatus} />
                                </CardHeader>

                                <CardInfo style={{ gap: "0.4rem", flex: 1 }}>

                                    {/* CONTRAT */}
                                    <div style={{ fontSize: "12px", color: "var(--text-color)", fontWeight: "500",
                                     }}>
                                        <User size={12} /> {job.post || "Poste non défini"}
                                    </div>

                                    {/* DATE */}
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 0",
                                     flexWrap: "wrap",
                                    }}>
                                        <Send size={14} style={{ color: "var(--primary-color)" }} />
                                        <div style={{ flex: 1, display: "flex", 
                                            alignItems: "center", fontSize: "11px",
                                        }}>
                                            {formatDate(job.createdAt)}
                                        </div>
                                    </div>
                                </CardInfo>

                                {/* ACTIONS */}
                                <ActionsContainer style={{ marginTop: "auto" }}>
                                    <ActionButton
                                        className="details"
                                        onClick={() => handleRowClick(job.requestId)}
                                    >
                                        <Eye size={14} />
                                        Voir plus
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

export default DraftJobCards;

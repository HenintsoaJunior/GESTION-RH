"use client";

import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { List, Calendar } from "lucide-react";
import Modal from "components/modal";
import JobOfferDetails from "./components/job-offer-details";
import StatsDashboard from "./components/stats-dashboard";
import FiltersPanel from "./components/filters-panel";
import JobOffersList from "./components/job-offers-list";
import CalendarView from "./components/calendar-view";
import { useJobOffers } from "./hooks/use-job-offers";
import {
    DashboardContainer,
    TableHeader,
    TableTitle,
    ViewToggle,
    ButtonView,
} from "styles/generaliser/table-container";
import JobDescriptionForm from "../form/page";

const JobOffer = () => {
    const {
        jobOffers,
        stats,
        sites,
        contractTypes,
        filters,
        handleFilterChange,
        handleFilterSubmit,
        handleResetFilters,
        currentPage,
        pageSize,
        totalEntries,
        handlePageChange,
        handlePageSizeChange,
        isLoading,
        alert,
        closeAlert,
        refetchData,
        setJobOffers,
        setTotalEntries,
    } = useJobOffers();

    const location = useLocation();
    const { recruitmentRequestId } = location.state || {};
    const [viewMode, setViewMode] = useState("list");
    const [showDetailsPopup, setShowDetailsPopup] = useState(false);
    const [selectedOfferId, setSelectedOfferId] = useState(null);
    const [showJobDescriptionForm, setShowJobDescriptionForm] = useState(false);

    useEffect(() => {
        if (recruitmentRequestId) {
            setShowJobDescriptionForm(true);
        }
    }, [recruitmentRequestId]);

    const handleRowClick = (offerId) => {
        if (offerId) {
            setSelectedOfferId(offerId);
            setShowDetailsPopup(true);
        }
    };

    const handleEventClick = (event) => {
        const offerId = event.id;
        if (offerId) {
            setSelectedOfferId(offerId);
            setShowDetailsPopup(true);
        }
    };

    const handleCloseDetailsPopup = () => {
        setShowDetailsPopup(false);
        setSelectedOfferId(null);
    };

    const handleCloseJobDescriptionForm = () => {
        setShowJobDescriptionForm(false);
        refetchData();
    };

    const handleSuccess = () => {
        handleCloseJobDescriptionForm();
        refetchData();
    };

    return (
        <DashboardContainer>
            <Modal
                type={alert.type}
                message={alert.message}
                isOpen={alert.isOpen}
                onClose={closeAlert}
                title="Notification"
            />
            {showDetailsPopup && selectedOfferId && (
                <JobOfferDetails
                    offerId={selectedOfferId}
                    isOpen={showDetailsPopup}
                    onClose={handleCloseDetailsPopup}
                />
            )}
            {showJobDescriptionForm && (
                <JobDescriptionForm
                    isOpen={showJobDescriptionForm}
                    onClose={handleCloseJobDescriptionForm}
                    recruitmentRequestId={recruitmentRequestId}
                    setJobOffers={setJobOffers}
                    setTotalEntries={setTotalEntries}
                    onSuccess={handleSuccess}
                />
            )}
            <StatsDashboard stats={stats} isLoading={isLoading.stats} />
            <FiltersPanel
                filters={filters}
                sites={sites}
                contractTypes={contractTypes}
                onFilterChange={handleFilterChange}
                onFilterSubmit={handleFilterSubmit}
                onResetFilters={handleResetFilters}
                isLoading={isLoading.jobOffers}
            />
            <TableHeader>
                <TableTitle>Liste des Offres d'Emploi</TableTitle>
                <ViewToggle>
                    <ButtonView
                        $active={viewMode === "list"}
                        onClick={() => setViewMode("list")}
                    >
                        <List size={16} style={{ marginRight: "var(--spacing-sm)" }} />
                        Liste
                    </ButtonView>
                    <ButtonView
                        $active={viewMode === "calendar"}
                        onClick={() => setViewMode("calendar")}
                    >
                        <Calendar size={16} style={{ marginRight: "var(--spacing-sm)" }} />
                        Calendrier
                    </ButtonView>
                </ViewToggle>
            </TableHeader>
            {viewMode === "list" ? (
                <JobOffersList
                    jobOffers={jobOffers}
                    sites={sites}
                    currentPage={currentPage}
                    pageSize={pageSize}
                    totalEntries={totalEntries}
                    isLoading={isLoading.jobOffers}
                    onRowClick={handleRowClick}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                />
            ) : (
                <CalendarView
                    jobOffers={jobOffers}
                    onEventClick={handleEventClick}
                />
            )}
        </DashboardContainer>
    );
};

export default JobOffer;
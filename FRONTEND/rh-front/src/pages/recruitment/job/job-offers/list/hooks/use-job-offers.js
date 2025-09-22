"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchSites } from "services/site/site";
import { fetchJobOffers, fetchJobOfferStatistics } from "services/recruitment/job/job-offers/services";
import { fetchContractTypes } from "services/contract/contract-type";

export const useJobOffers = () => {
    const [jobOffers, setJobOffers] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        publiee: 0,
        enCours: 0,
        cloturee: 0,
        annulee: 0,
    });
    const [filters, setFilters] = useState({
        status: "",
        jobTitleKeyword: "",
        publicationDateMin: "",
        publicationDateMax: "",
        siteId: "",
        contractTypeId: "",
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalEntries, setTotalEntries] = useState(0);
    const [isLoading, setIsLoading] = useState({
        jobOffers: true,
        sites: true,
        stats: true,
        contractTypes: true,
    });
    const [alert, setAlert] = useState({
        isOpen: false,
        type: "info",
        message: "",
    });
    const [sites, setSites] = useState([]);
    const [contractTypes, setContractTypes] = useState([]);

    const handleError = useCallback((error) => {
        setAlert(error);
    }, []);

    const refetchData = useCallback(() => {
        fetchJobOffers(
            setJobOffers,
            setIsLoading,
            setTotalEntries,
            handleError,
            filters,
            currentPage,
            pageSize
        );
        fetchJobOfferStatistics(
            setStats,
            setIsLoading,
            handleError
        );
    }, [filters, currentPage, pageSize, handleError]);

    useEffect(() => {
        fetchSites(setSites, setIsLoading, null, handleError);
        fetchContractTypes(setContractTypes, setIsLoading, null, handleError);
        fetchJobOffers(
            setJobOffers,
            setIsLoading,
            setTotalEntries,
            handleError,
            filters,
            currentPage,
            pageSize
        );
        fetchJobOfferStatistics(
            setStats,
            setIsLoading,
            handleError
        );
    }, [handleError]);

    const handleFilterChange = useCallback((name, value) => {
        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    }, []);

    const handleFilterSubmit = useCallback(
        (event) => {
            event.preventDefault();
            setCurrentPage(1);
            refetchData();
        },
        [refetchData]
    );

    const handleResetFilters = useCallback(() => {
        const resetFilters = {
            status: "",
            jobTitleKeyword: "",
            publicationDateMin: "",
            publicationDateMax: "",
            siteId: "",
            contractTypeId: "",
        };
        setFilters(resetFilters);
        setCurrentPage(1);
        refetchData();
    }, [refetchData]);

    const handlePageChange = useCallback(
        (page) => {
            setCurrentPage(page);
            refetchData();
        },
        [refetchData]
    );

    const handlePageSizeChange = useCallback(
        (event) => {
            setPageSize(Number(event.target.value));
            setCurrentPage(1);
            refetchData();
        },
        [refetchData]
    );

    const closeAlert = useCallback(() => {
        setAlert({ ...alert, isOpen: false });
    }, [alert]);

    const showAlert = useCallback((type, message) => {
        setAlert({ isOpen: true, type, message });
    }, []);

    return {
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
        showAlert,
        refetchData,
    };
};
import { useState, useEffect, useCallback } from "react";
import { fetchSites } from "services/site/site";
import { fetchContractTypes } from "services/contract/contract-type";
import { fetchDirections } from "services/direction/direction";
import { fetchDepartments } from "services/direction/department";
import { fetchServices } from "services/direction/service";
import {
    fetchRecruitmentRequests,
    fetchRecruitmentRequestStats
} from "services/recruitment/recruitment-request/services";

export const useRecruitmentRequests = () => {
    // State management
    const [requests, setRequests] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        enAttente: 0,
        enCours: 0,
        approuvees: 0,
        rejetees: 0
    });

    const [filters, setFilters] = useState({
        status: "",
        jobTitleKeyword: "",
        requestDateMin: "",
        requestDateMax: "",
        siteId: "",
        contractTypeId: "",
        directionId: "",
        departmentId: "",
        serviceId: "",
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalEntries, setTotalEntries] = useState(0);

    const [isLoading, setIsLoading] = useState({
        requests: true,
        sites: true,
        contractTypes: true,
        directions: true,
        departments: true,
        services: true,
        stats: true,
    });
    const [alert, setAlert] = useState({
        isOpen: false,
        type: "info",
        message: ""
    });

    // Reference data
    const [sites, setSites] = useState([]);
    const [contractTypes, setContractTypes] = useState([]);
    const [directions, setDirections] = useState([]);
    const [allDepartments, setAllDepartments] = useState([]);
    const [allServices, setAllServices] = useState([]);

    // Error handling
    const handleError = useCallback((error) => {
        setAlert(error);
    }, []);

    // Fetch data function
    const refetchData = useCallback(() => {
        fetchRecruitmentRequests(
            setRequests,
            setIsLoading,
            setTotalEntries,
            filters,
            currentPage,
            pageSize,
            handleError
        );
        fetchRecruitmentRequestStats(setStats, setIsLoading, handleError);
    }, [filters, currentPage, pageSize, handleError]);

    // Initial data loading
    useEffect(() => {
        fetchSites(setSites, setIsLoading, null, handleError);
        fetchContractTypes(setContractTypes, setIsLoading, null, handleError);
        fetchDirections(setDirections, setIsLoading, null, handleError);
        fetchDepartments(setAllDepartments, setIsLoading, null, handleError);
        fetchServices(setAllServices, setIsLoading, null, handleError);
        // Initial data fetch with default filters
        fetchRecruitmentRequests(
            setRequests,
            setIsLoading,
            setTotalEntries,
            filters,
            currentPage,
            pageSize,
            handleError
        );
        fetchRecruitmentRequestStats(setStats, setIsLoading, handleError);
    }, []); // Empty dependency array for initial load only

    // Filter handlers
    const handleFilterChange = useCallback((name, value) => {
        setFilters((prev) => ({
            ...prev,
            [name]: value,
            ...(name === "directionId" && { departmentId: "", serviceId: "" }),
            ...(name === "departmentId" && { serviceId: "" }),
        }));
    }, []);

    const handleFilterSubmit = useCallback((event) => {
        event.preventDefault();
        setCurrentPage(1);
        refetchData();
    }, [refetchData]);

    const handleResetFilters = useCallback(() => {
        const resetFilters = {
            status: "",
            jobTitleKeyword: "",
            requestDateMin: "",
            requestDateMax: "",
            siteId: "",
            contractTypeId: "",
            directionId: "",
            departmentId: "",
            serviceId: "",
        };
        setFilters(resetFilters);
        setCurrentPage(1);
        fetchRecruitmentRequests(
            setRequests,
            setIsLoading,
            setTotalEntries,
            resetFilters,
            1,
            pageSize,
            handleError
        );
    }, [pageSize, handleError]);

    // Pagination handlers
    const handlePageChange = useCallback((page) => {
        setCurrentPage(page);
        refetchData(); // Fetch data when page changes
    }, [refetchData]);

    const handlePageSizeChange = useCallback((event) => {
        setPageSize(Number(event.target.value));
        setCurrentPage(1);
        refetchData(); // Fetch data when page size changes
    }, [refetchData]);

    // Alert handlers
    const closeAlert = useCallback(() => {
        setAlert({ ...alert, isOpen: false });
    }, [alert]);

    const showAlert = useCallback((type, message) => {
        setAlert({ isOpen: true, type, message });
    }, []);

    return {
        // Data
        requests,
        stats,
        sites,
        contractTypes,
        directions,
        allDepartments,
        allServices,

        // Filters
        filters,
        handleFilterChange,
        handleFilterSubmit,
        handleResetFilters,

        // Pagination
        currentPage,
        pageSize,
        totalEntries,
        handlePageChange,
        handlePageSizeChange,

        // Loading states
        isLoading,

        // Alerts
        alert,
        closeAlert,
        showAlert,

        // Actions
        refetchData,
    };
};
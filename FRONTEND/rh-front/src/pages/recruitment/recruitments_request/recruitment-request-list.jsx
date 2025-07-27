"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Users, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp, X } from "lucide-react";
import { formatDate } from "utils/dateConverter";
import { fetchSites } from "services/site/site";
import { fetchContractTypes } from "services/contract/contract-type";
import { fetchDirections } from "services/direction/direction";
import { fetchDepartments } from "services/direction/department";
import { fetchServices } from "services/direction/service";
import { fetchRecruitmentRequests, fetchRecruitmentRequestStats } from "services/recruitment/recruitment-request-service/recruitment-request-service";
import Alert from "components/alert";
import "styles/generic-table-styles.css";

const RecruitmentRequestList = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({ total: 0, enAttente: 0, enCours: 0, approuvees: 0, rejetees: 0 });
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
  const [sites, setSites] = useState([]);
  const [contractTypes, setContractTypes] = useState([]);
  const [directions, setDirections] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" });
  
  // États pour contrôler l'affichage des filtres
  const [isMinimized, setIsMinimized] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  // Fetch additional data for filters and statistics
  useEffect(() => {
    fetchSites(setSites, setIsLoading, null, setAlert);
    fetchContractTypes(setContractTypes, setIsLoading, null, setAlert);
    fetchDirections(setDirections, setIsLoading, null, setAlert);
    fetchDepartments(setAllDepartments, setIsLoading, null, setAlert);
    fetchServices(setAllServices, setIsLoading, null, setAlert);
    fetchRecruitmentRequestStats(setStats, setIsLoading, setAlert);
  }, []);

  // Filtrer les départements et services en fonction de directionId et departmentId
  const filteredDepartments = useMemo(() => {
    if (filters.directionId) {
      return allDepartments.filter((dept) => dept.directionId === filters.directionId);
    }
    return allDepartments;
  }, [allDepartments, filters.directionId]);

  const filteredServices = useMemo(() => {
    if (filters.departmentId) {
      return allServices.filter((svc) => svc.departmentId === filters.departmentId);
    } else if (filters.directionId) {
      return allServices.filter((svc) => svc.directionId === filters.directionId);
    }
    return allServices;
  }, [allServices, filters.directionId, filters.departmentId]);

  // Optimize site lookup with a map
  const siteMap = useMemo(() => {
    const map = {};
    sites.forEach((site) => {
      map[site.siteId] = site.siteName;
    });
    return map;
  }, [sites]);

  // Fetch recruitment requests with filters
  const fetchRequests = useCallback((customFilters = null) => {
    setIsLoading((prev) => ({ ...prev, requests: true }));
    const filtersToUse = customFilters || filters;
    fetchRecruitmentRequests(
      setRequests,
      setIsLoading,
      setTotalEntries,
      filtersToUse,
      currentPage,
      pageSize,
      setAlert
    );
  }, [filters, currentPage, pageSize]);

  useEffect(() => {
    fetchRequests();
  }, [currentPage, pageSize]);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "directionId" && { departmentId: "", serviceId: "" }),
      ...(name === "departmentId" && { serviceId: "" }),
    }));
  };

  const handleFilterSubmit = (event) => {
    event.preventDefault();
    setCurrentPage(1);
    fetchRequests();
  };

  const handleResetFilters = () => {
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
    fetchRequests(resetFilters);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setCurrentPage(1);
  };

  const handleRowClick = (requestId) => {
    if (requestId) {
      navigate(`/recruitment/recruitment-request/details/${requestId}`);
    }
  };

  // Fonctions pour contrôler l'affichage des filtres
  const toggleMinimize = () => {
    setIsMinimized(prev => !prev);
  };

  const toggleHide = () => {
    setIsHidden(prev => !prev);
  };

  const totalPages = Math.ceil(totalEntries / pageSize);

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
    return <span className={`status-badge ${statusClass}`}>{status || "Inconnu"}</span>;
  };

  const isDataLoading = Object.values(isLoading).some((loading) => loading);

  const renderPagination = () => {
    const maxButtons = 5;
    const half = Math.floor(maxButtons / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxButtons - 1);

    if (end - start + 1 < maxButtons) {
      start = Math.max(1, end - maxButtons + 1);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-btn ${currentPage === i ? "active" : ""}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="dashboard-container">
      <Alert
        type={alert.type}
        message={alert.message}
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
      />
      
      {/* Cartes statistiques */}
      <div className="stats-container">
        <div className="stats-grid">
          <div className="stat-card stat-card-total">
            <div className="stat-icon">
              <Users className="w-6 h-6" />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total des demandes</div>
            </div>
          </div>
          <div className="stat-card stat-card-pending">
            <div className="stat-icon">
              <Clock className="w-6 h-6" />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.enAttente}</div>
              <div className="stat-label">Brouillon</div>
            </div>
          </div>
          <div className="stat-card stat-card-progress">
            <div className="stat-icon">
              <Clock className="w-6 h-6" />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.enCours}</div>
              <div className="stat-label">En Cours</div>
            </div>
          </div>
          <div className="stat-card stat-card-approved">
            <div className="stat-icon">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.approuvees}</div>
              <div className="stat-label">Approuvées</div>
            </div>
          </div>
          <div className="stat-card stat-card-rejected">
            <div className="stat-icon">
              <XCircle className="w-6 h-6" />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.rejetees}</div>
              <div className="stat-label">Rejetées</div>
            </div>
          </div>
        </div>
      </div>

      {/* Section des filtres */}
      {!isHidden && (
        <div className={`filters-container ${isMinimized ? 'minimized' : ''}`}>
          <div className="filters-header">
            <h2 className="filters-title">Filtres de Recherche</h2>
            <div className="filters-controls">
              <button 
                type="button" 
                className="filter-control-btn filter-minimize-btn"
                onClick={toggleMinimize}
                title={isMinimized ? "Développer" : "Réduire"}
              >
                {isMinimized ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
              <button 
                type="button" 
                className="filter-control-btn filter-close-btn"
                onClick={toggleHide}
                title="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {!isMinimized && (
            <div className="filters-section">
              <form onSubmit={handleFilterSubmit}>
                <table className="form-table-search">
                  <tbody>
                    <tr>
                      <th className="form-label-cell-search">
                        <label className="form-label-search">Intitulé du Poste</label>
                      </th>
                      <td className="form-input-cell-search">
                        <input
                          name="jobTitleKeyword"
                          type="text"
                          value={filters.jobTitleKeyword}
                          onChange={(e) => handleFilterChange("jobTitleKeyword", e.target.value)}
                          className="form-input-search"
                          placeholder="Recherche par poste"
                        />
                      </td>
                      <th className="form-label-cell-search">
                        <label className="form-label-search">Direction</label>
                      </th>
                      <td className="form-input-cell-search">
                        <select
                          name="directionId"
                          value={filters.directionId}
                          onChange={(e) => handleFilterChange("directionId", e.target.value)}
                          className="form-input-search"
                        >
                          <option value="">Toutes les directions</option>
                          {directions.map((dir) => (
                            <option key={dir.directionId} value={dir.directionId}>
                              {dir.directionName}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                    <tr>
                      <th className="form-label-cell-search">
                        <label className="form-label-search">Type de Contrat</label>
                      </th>
                      <td className="form-input-cell-search">
                        <select
                          name="contractTypeId"
                          value={filters.contractTypeId}
                          onChange={(e) => handleFilterChange("contractTypeId", e.target.value)}
                          className="form-input-search"
                        >
                          <option value="">Tous les contrats</option>
                          {contractTypes.map((ct) => (
                            <option key={ct.contractTypeId} value={ct.contractTypeId}>
                              {ct.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <th className="form-label-cell-search">
                        <label className="form-label-search">Site</label>
                      </th>
                      <td className="form-input-cell-search">
                        <select
                          name="siteId"
                          value={filters.siteId}
                          onChange={(e) => handleFilterChange("siteId", e.target.value)}
                          className="form-input-search"
                        >
                          <option value="">Tous les sites</option>
                          {sites.map((site) => (
                            <option key={site.siteId} value={site.siteId}>
                              {site.siteName}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                    <tr>
                      <th className="form-label-cell-search">
                        <label className="form-label-search">Département</label>
                      </th>
                      <td className="form-input-cell-search">
                        <select
                          name="departmentId"
                          value={filters.departmentId}
                          onChange={(e) => handleFilterChange("departmentId", e.target.value)}
                          className="form-input-search"
                          disabled={filters.directionId === ""}
                        >
                          <option value="">Tous les départements</option>
                          {filteredDepartments.map((dept) => (
                            <option key={dept.departmentId} value={dept.departmentId}>
                              {dept.departmentName}
                            </option>
                          ))}
                        </select>
                      </td>
                      <th className="form-label-cell-search">
                        <label className="form-label-search">Service</label>
                      </th>
                      <td className="form-input-cell-search">
                        <select
                          name="serviceId"
                          value={filters.serviceId}
                          onChange={(e) => handleFilterChange("serviceId", e.target.value)}
                          className="form-input-search"
                          disabled={filters.directionId === "" && filters.departmentId === ""}
                        >
                          <option value="">Tous les services</option>
                          {filteredServices.map((svc) => (
                            <option key={svc.serviceId} value={svc.serviceId}>
                              {svc.serviceName}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                    <tr>
                      <th className="form-label-cell-search">
                        <label className="form-label-search">Statut</label>
                      </th>
                      <td className="form-input-cell-search">
                        <select
                          name="status"
                          value={filters.status}
                          onChange={(e) => handleFilterChange("status", e.target.value)}
                          className="form-input-search"
                        >
                          <option value="">Tous les statuts</option>
                          <option value="BROUILLON">Brouillon</option>
                          <option value="En Cours">En Cours</option>
                          <option value="Approuvé">Approuvé</option>
                          <option value="Rejeté">Rejeté</option>
                        </select>
                      </td>
                      <th className="form-label-cell-search">
                        <label className="form-label-search">Date de début</label>
                      </th>
                      <td className="form-input-cell-search">
                        <input
                          name="requestDateMin"
                          type="date"
                          value={filters.requestDateMin}
                          onChange={(e) => handleFilterChange("requestDateMin", e.target.value)}
                          className="form-input-search"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th className="form-label-cell-search">
                        <label className="form-label-search">Date de fin</label>
                      </th>
                      <td className="form-input-cell-search">
                        <input
                          name="requestDateMax"
                          type="date"
                          value={filters.requestDateMax}
                          onChange={(e) => handleFilterChange("requestDateMax", e.target.value)}
                          className="form-input-search"
                        />
                      </td>
                      <th className="form-label-cell-search"></th>
                      <td className="form-input-cell-search"></td>
                    </tr>
                  </tbody>
                </table>

                <div className="filters-actions">
                  <button type="button" className="btn-reset" onClick={handleResetFilters}>
                    Réinitialiser
                  </button>
                  <button type="submit" className="btn-search">
                    Rechercher
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Bouton pour réafficher les filtres si cachés */}
      {isHidden && (
        <div className="filters-toggle">
          <button 
            type="button" 
            className="btn-show-filters"
            onClick={toggleHide}
          >
            Afficher les filtres
          </button>
        </div>
      )}

      {/* Section titre et bouton Nouvelle Demande */}
      <div className="table-header">
        <h2 className="table-title">Liste</h2>
        <button
          onClick={() => navigate("/recruitment/recruitment-request/create")}
          className="btn-new-request"
        >
          <Plus className="w-4 h-4" />
          Nouvelle demande
        </button>
      </div>

      {/* Tableau de données */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Poste</th>
              <th>Effectif</th>
              <th>Type Contrat</th>
              <th>Direction</th>
              <th>Département</th>
              <th>Service</th>
              <th>Site</th>
              <th>Statut</th>
              <th>Date de création</th>
            </tr>
          </thead>
          <tbody>
            {isDataLoading ? (
              <tr>
                <td colSpan={9}>Chargement...</td>
              </tr>
            ) : requests.length > 0 ? (
              requests.map((request) => (
                <tr
                  key={request.recruitmentRequestId}
                  onClick={() => handleRowClick(request.recruitmentRequestId)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{request.recruitmentRequest?.positionTitle || "Non spécifié"}</td>
                  <td>{request.recruitmentRequest?.positionCount || 0}</td>
                  <td>
                    {request.recruitmentRequest?.contractType?.label
                      ? `${request.recruitmentRequest.contractType.label} (${request.recruitmentRequest.contractType.code || ''})`
                      : "Non spécifié"}
                  </td>
                  <td>
                    {request.direction?.directionName
                      ? `${request.direction.directionName} (${request.direction.acronym || ''})`
                      : "Non spécifié"}
                  </td>
                  <td>{request.department?.departmentName || "Non spécifié"}</td>
                  <td>{request.service?.serviceName || "Non spécifié"}</td>
                  <td>{siteMap[request.recruitmentRequest?.siteId] || "Non spécifié"}</td>
                  <td>{getStatusBadge(request.recruitmentRequest?.status)}</td>
                  <td>{formatDate(request.recruitmentRequest?.createdAt) || "Non spécifié"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9}>Aucune donnée trouvée.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination-container">
        <div className="pagination-options">
          <label htmlFor="pageSize" className="pagination-label">Afficher par page :</label>
          <select
            id="pageSize"
            value={pageSize}
            onChange={handlePageSizeChange}
            className="pagination-select"
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
        <div className="pagination-info">
          Affichage des données {Math.min((currentPage - 1) * pageSize + 1, totalEntries)} à{" "}
          {Math.min(currentPage * pageSize, totalEntries)} sur {totalEntries} entrées
        </div>
        <div className="pagination-controls">{renderPagination()}</div>
      </div>
    </div>
  );
};

export default RecruitmentRequestList;
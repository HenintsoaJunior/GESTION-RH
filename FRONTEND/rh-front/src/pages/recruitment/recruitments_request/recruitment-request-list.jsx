"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Users, Clock, CheckCircle, XCircle } from "lucide-react";
import { formatDate, fetchData } from "utils/generalisation";
import "styles/generic-table-styles.css";
const RecruitmentRequestList = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [filters, setFilters] = useState({
    status: "",
    jobTitleKeyword: "",
    requestDateMin: "",
    requestDateMax: "",
    siteId: "",
    contractTypeId: "",
    directionId: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  const [totalEntries, setTotalEntries] = useState(0);
  const [isLoading, setIsLoading] = useState({
    requests: true,
    sites: true,
    contractTypes: true,
    directions: true,
  });
  const [sites, setSites] = useState([]);
  const [contractTypes, setContractTypes] = useState([]);
  const [directions, setDirections] = useState([]);

  // Fetch additional data for filters (sites, contract types, directions)
  useEffect(() => {
    fetchData(
      "/api/Site",
      setSites,
      setIsLoading,
      null,
      "sites",
      null,
      (site) => site.siteName,
      "les sites",
      () => {}
    );
    fetchData(
      "/api/ContractType",
      setContractTypes,
      setIsLoading,
      null,
      "contractTypes",
      null,
      (ct) => ct.code,
      "les types de contrat",
      () => {}
    );
    fetchData(
      "/api/Direction",
      setDirections,
      setIsLoading,
      null,
      "directions",
      null,
      (dir) => dir.directionName,
      "les directions",
      () => {}
    );
  }, []);

  // Calcul des statistiques
  const stats = useMemo(() => {
    const total = requests.length;
    const enAttente = requests.filter((req) => req.status === "BROUILLON").length;
    const enCours = requests.filter((req) => req.status === "En Cours").length;
    const approuvees = requests.filter((req) => req.status === "Approuvé").length;
    const rejetees = requests.filter((req) => req.status === "Rejeté").length;
    return { total, enAttente, enCours, approuvees, rejetees };
  }, [requests]);

  // Fetch recruitment requests
  const fetchRequests = useCallback(
    (filters = {}, page = 1) => {
      fetchData(
        "/api/RecruitmentRequest",
        (data) => {
          let filteredRequests = [...data];

          setTotalEntries(filteredRequests.length);
          
          const start = (page - 1) * pageSize;
          const paginatedRequests = filteredRequests.slice(start, start + pageSize);
          setRequests(paginatedRequests);
        },
        setIsLoading,
        null,
        "requests",
        null,
        null,
        "les demandes de recrutement",
        () => {}
      );
    },
    [pageSize]
  );

  useEffect(() => {
    fetchRequests(filters, currentPage);
  }, [fetchRequests, currentPage, filters]);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handleFilterSubmit = (event) => {
    event.preventDefault();
    setCurrentPage(1);
    fetchRequests(filters, 1);
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
    };
    setFilters(resetFilters);
    setCurrentPage(1);
    fetchRequests(resetFilters, 1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const totalPages = Math.ceil(totalEntries / pageSize);

  const getStatusBadge = (status) => {
    return (
      <span
        className={`status-badge ${
          status === "BROUILLON"
            ? "status-pending"
            : status === "En Cours"
            ? "status-progress"
            : status === "Approuvé"
            ? "status-approved"
            : status === "Rejeté"
            ? "status-rejected"
            : "status-pending"
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="dashboard-container">
      {/* Cartes statistiques */}
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

      {/* Section des filtres */}
      <div className="filters-section">
        <div className="filters-header">
          <h2 className="filters-title">Filtres de Recherche</h2>
          <button onClick={() => navigate("/recruitment/recruitment-request-form")} className="btn-new-request">
            <Plus className="w-4 h-4" />
            Nouvelle demande
          </button>
        </div>

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
                      {ct.code}
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
                  onChange={(e) => handleFilterChange("requestDateMinita", e.target.value)}
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
            </tr>
          </tbody>
        </table>

        <div className="filters-actions">
          <button type="button" className="btn-reset" onClick={handleResetFilters}>
            Réinitialiser
          </button>
          <button type="submit" className="btn-search" onClick={handleFilterSubmit}>
            Rechercher
          </button>
        </div>
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
              <th>Site</th>
              <th>Date Souhaitée</th>
              <th>Statut</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading.requests ? (
              <tr>
                <td colSpan={8}>Chargement...</td>
              </tr>
            ) : requests.length > 0 ? (
              requests.map((request) => (
                <tr key={request.recruitmentRequestId}>
                  <td>{request.positionTitle}</td>
                  <td>{request.positionCount}</td>
                  <td>{request.contractDuration || "Non spécifié"}</td>
                  <td>{request.recruitmentRequestDetail?.directionId || "Non spécifié"}</td>
                  <td>{request.siteId}</td>
                  <td>{formatDate(request.desiredStartDate)}</td>
                  <td>{getStatusBadge(request.status)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-action btn-modify"
                        onClick={() =>
                          navigate(`/recruitment/recruitment-request-form/${request.recruitmentRequestId}`)
                        }
                      >
                        Modifier
                      </button>
                      <button className="btn-action btn-delete">Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8}>Aucune donnée trouvée.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination-container">
        <div className="pagination-info">
          Affichage des données {Math.min((currentPage - 1) * pageSize + 1, totalEntries)} à{" "}
          {Math.min(currentPage * pageSize, totalEntries)} sur {totalEntries} entrées
        </div>
        <div className="pagination-controls">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`pagination-btn ${currentPage === page ? "active" : ""}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecruitmentRequestList;
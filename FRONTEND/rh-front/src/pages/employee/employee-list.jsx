"use client";

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Clock, Calendar, ChevronDown, ChevronUp, X, CheckCircle, List, XCircle, Edit2 } from "lucide-react";
import { formatDate } from "utils/dateConverter";
import {
  searchEmployees,
  deleteEmployee,
  fetchEmployeeStats,
} from "services/employee/employee";
import Alert from "components/alert";
import Pagination from "components/pagination";
import AutoCompleteInput from "components/auto-complete-input";
import { fetchSites } from "services/site/site";
import "styles/generic-table-styles.css";

const EmployeeList = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState({ total: 0, actif: 0, inactif: 0, departed: 0 });
  const [filters, setFilters] = useState({
    jobTitle: "",
    lastName: "",
    firstName: "",
    directionId: "",
    contractTypeId: "",
    employeeCode: "",
    siteId: "",
    site: "",
    status: "",
    genderId: "",
    departureDateMin: "",
    departureDateMax: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalEntries, setTotalEntries] = useState(0);
  const [isLoading, setIsLoading] = useState({
    employees: false,
    stats: false,
    sites: false,
  });
  const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "", fieldErrors: {} });
  const [isMinimized, setIsMinimized] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [sites, setSites] = useState([]);
  const [siteNames, setSiteNames] = useState([]);

  const handleError = useCallback((error) => {
    console.error('Error details:', error);
    setAlert({
      isOpen: true,
      type: "error",
      message: error.message || "Une erreur est survenue",
      fieldErrors: error.fieldErrors || {},
    });
  }, []);

  // Chargement des sites
  useEffect(() => {
    fetchSites(
      (data) => {
        console.log('Sites fetched:', data);
        setSites(data);
        setSiteNames(data.map((site) => site.siteName));
      },
      setIsLoading,
      (alertData) => setAlert(alertData),
      () => setTotalEntries(0)
    );
  }, []);

  // Chargement initial des données
  useEffect(() => {
    const initialFilters = {
      jobTitle: "",
      lastName: "",
      firstName: "",
      directionId: "",
      contractTypeId: "",
      employeeCode: "",
      siteId: "",
      status: "",
      genderId: "",
      departureDateMin: "",
      departureDateMax: "",
    };
    
    // Charger les employés et les statistiques
    searchEmployees(
      initialFilters, 
      currentPage, 
      pageSize, 
      setEmployees, 
      setTotalEntries, 
      setIsLoading, 
      handleError
    );
    fetchEmployeeStats(setStats, setIsLoading, handleError);
  }, [currentPage, pageSize, handleError]);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFilterSubmit = (event) => {
    event.preventDefault();
    setCurrentPage(1);
    searchEmployees(filters, 1, pageSize, setEmployees, setTotalEntries, setIsLoading, handleError);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      jobTitle: "",
      lastName: "",
      firstName: "",
      directionId: "",
      contractTypeId: "",
      employeeCode: "",
      siteId: "",
      site: "",
      status: "",
      genderId: "",
      departureDateMin: "",
      departureDateMax: "",
    };
    setFilters(resetFilters);
    setCurrentPage(1);
    searchEmployees(resetFilters, 1, pageSize, setEmployees, setTotalEntries, setIsLoading, handleError);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    searchEmployees(filters, page, pageSize, setEmployees, setTotalEntries, setIsLoading, handleError);
  };

  const handlePageSizeChange = (event) => {
    const newPageSize = Number(event.target.value);
    setPageSize(newPageSize);
    setCurrentPage(1);
    searchEmployees(filters, 1, newPageSize, setEmployees, setTotalEntries, setIsLoading, handleError);
  };

  const handleRowClick = (employeeId) => {
    if (employeeId) {
      navigate(`/employee/edit/${employeeId}`);
    }
  };

  const handleEditEmployee = (employeeId, e) => {
    e.stopPropagation();
    if (employeeId) {
      navigate(`/employee/edit/${employeeId}`);
    }
  };

  const handleDeleteEmployee = async (employeeId, e) => {
    e.stopPropagation();
    try {
      await deleteEmployee(
        employeeId,
        setIsLoading,
        (successAlert) => {
          setAlert(successAlert);
          // Recharger les données après suppression
          searchEmployees(filters, currentPage, pageSize, setEmployees, setTotalEntries, setIsLoading, handleError);
          fetchEmployeeStats(setStats, setIsLoading, handleError);
        },
        handleError
      );
    } catch (error) {
      // Error already handled in service
    }
  };

  const toggleMinimize = () => {
    setIsMinimized((prev) => !prev);
  };

  const toggleHide = () => {
    setIsHidden((prev) => !prev);
  };

  const getStatusBadge = (status) => {
    const statusClass =
      status === "Actif"
        ? "status-approved"
        : status === "Inactif"
        ? "status-cancelled"
        : "status-pending";
    return <span className={`status-badge ${statusClass}`}>{status || "Inconnu"}</span>;
  };

  return (
    <div className="dashboard-container">
      <Alert
        type={alert.type}
        message={alert.message}
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false, fieldErrors: {} })}
      />

      <div className="stats-container">
        <div className="stats-grid">
          <div className="stat-card stat-card-total">
            <div className="stat-icon">
              <Clock className="w-6 h-6" />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total des employés</div>
            </div>
          </div>
          <div className="stat-card stat-card-approved">
            <div className="stat-icon">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.actif}</div>
              <div className="stat-label">Actifs</div>
            </div>
          </div>
          <div className="stat-card stat-card-cancelled">
            <div className="stat-icon">
              <XCircle className="w-6 h-6" />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.inactif}</div>
              <div className="stat-label">Inactifs</div>
            </div>
          </div>
          <div className="stat-card stat-card-pending">
            <div className="stat-icon">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.departed}</div>
              <div className="stat-label">Départés</div>
            </div>
          </div>
        </div>
      </div>

      {!isHidden && (
        <div className={`filters-container ${isMinimized ? "minimized" : ""}`}>
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
                        <label className="form-label-search">Nom</label>
                      </th>
                      <td className="form-input-cell-search">
                        <input
                          name="lastName"
                          type="text"
                          value={filters.lastName}
                          onChange={(e) => handleFilterChange("lastName", e.target.value)}
                          className="form-input-search"
                          placeholder="Recherche par nom"
                        />
                      </td>
                      <th className="form-label-cell-search">
                        <label className="form-label-search">Prénom</label>
                      </th>
                      <td className="form-input-cell-search">
                        <input
                          name="firstName"
                          type="text"
                          value={filters.firstName}
                          onChange={(e) => handleFilterChange("firstName", e.target.value)}
                          className="form-input-search"
                          placeholder="Recherche par prénom"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th className="form-label-cell-search">
                        <label className="form-label-search">Titre du poste</label>
                      </th>
                      <td className="form-input-cell-search">
                        <input
                          name="jobTitle"
                          type="text"
                          value={filters.jobTitle}
                          onChange={(e) => handleFilterChange("jobTitle", e.target.value)}
                          className="form-input-search"
                          placeholder="Recherche par titre"
                        />
                      </td>
                      <th className="form-label-cell-search">
                        <label className="form-label-search">Code employé</label>
                      </th>
                      <td className="form-input-cell-search">
                        <input
                          name="employeeCode"
                          type="text"
                          value={filters.employeeCode}
                          onChange={(e) => handleFilterChange("employeeCode", e.target.value)}
                          className="form-input-search"
                          placeholder="Recherche par code"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th className="form-label-cell-search">
                        <label className="form-label-search">Site</label>
                      </th>
                      <td className="form-input-cell-search">
                        <AutoCompleteInput
                          value={filters.site}
                          onChange={(value) => {
                            const selectedSite = sites.find((s) => s.siteName === value);
                            console.log('Site selected:', value, 'Found:', selectedSite);
                            setFilters((prev) => ({
                              ...prev,
                              site: value,
                              siteId: selectedSite ? selectedSite.siteId : "",
                            }));
                          }}
                          suggestions={siteNames}
                          maxVisibleItems={3}
                          placeholder="Saisir ou sélectionner un site..."
                          disabled={isLoading.sites}
                          showAddOption={false}
                          fieldType="siteId"
                          fieldLabel="site"
                          className="form-input-search"
                        />
                      </td>
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
                          <option value="Actif">Actif</option>
                          <option value="Inactif">Inactif</option>
                        </select>
                      </td>
                    </tr>
                    <tr>
                      <th className="form-label-cell-search">
                        <label className="form-label-search">Date de départ min</label>
                      </th>
                      <td className="form-input-cell-search">
                        <input
                          name="departureDateMin"
                          type="date"
                          value={filters.departureDateMin}
                          onChange={(e) => handleFilterChange("departureDateMin", e.target.value)}
                          className="form-input-search"
                        />
                      </td>
                      <th className="form-label-cell-search">
                        <label className="form-label-search">Date de départ max</label>
                      </th>
                      <td className="form-input-cell-search">
                        <input
                          name="departureDateMax"
                          type="date"
                          value={filters.departureDateMax}
                          onChange={(e) => handleFilterChange("departureDateMax", e.target.value)}
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
                  <button type="submit" className="btn-search">
                    Rechercher
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {isHidden && (
        <div className="filters-toggle">
          <button type="button" className="btn-show-filters" onClick={toggleHide}>
            Afficher les filtres
          </button>
        </div>
      )}

      <div className="table-header">
        <h2 className="table-title">Liste des Employés</h2>
        <div className="view-toggle">
          <button
            onClick={() => navigate("/employee/create")}
            className="btn-new-request"
          >
            <Plus className="w-4 h-4" />
            Nouvel employé
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Prénom</th>
              <th>Titre du poste</th>
              <th>Code employé</th>
              <th>Site</th>
              <th>Statut</th>
              <th>Date d'embauche</th>
              {/* <th>Actions</th> */}
            </tr>
          </thead>
          <tbody>
            {isLoading.employees ? (
              <tr>
                <td colSpan={8}>Chargement...</td>
              </tr>
            ) : employees.length > 0 ? (
              employees.map((employee) => (
                <tr
                  key={employee.employeeId}
                  onClick={() => handleRowClick(employee.employeeId)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{employee.lastName || "Non spécifié"}</td>
                  <td>{employee.firstName || "Non spécifié"}</td>
                  <td>{employee.jobTitle || "Non spécifié"}</td>
                  <td>{employee.employeeCode || "Non spécifié"}</td>
                  <td>{employee.site?.siteName || "Non spécifié"}</td>
                  <td>{getStatusBadge(employee.status)}</td>
                  <td>{formatDate(employee.hireDate) || "Non spécifié"}</td>
                  {/* <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn-edit"
                        onClick={(e) => handleEditEmployee(employee.employeeId, e)}
                        title="Modifier"
                      >
                        <Edit2 className="w-4 h-4" /> Modifier
                      </button>
                      <button
                        className="btn-cancel"
                        onClick={(e) => handleDeleteEmployee(employee.employeeId, e)}
                        disabled={employee.status === "Inactif"}
                        title="Supprimer"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td> */}
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

      <Pagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalEntries={totalEntries}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
};

export default EmployeeList;
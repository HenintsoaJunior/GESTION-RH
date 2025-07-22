"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, MapPin, Clock, Calendar, ChevronDown, ChevronUp, X, CheckCircle } from "lucide-react";
import { formatDate } from "utils/generalisation";
import Alert from "components/alert";
import "styles/generic-table-styles.css";

// Données statiques pour simuler les assignations
const mockAssignedPersons = [
  {
    assignmentId: 1,
    missionId: 1,
    missionTitle: "Développement d'une application mobile",
    beneficiary: "Jean Dupont",
    matricule: "JD123",
    function: "Développeur",
    base: "Paris",
    direction: "IT",
    departmentService: "Développement",
    costCenter: "CC001",
    meansOfTransport: "Train",
    whoWillGo: "Paris",
    departureDate: "2025-06-01",
    departureTime: "08:00",
    missionDuration: 5,
    returnDate: "2025-06-06",
    returnTime: "18:00",
    status: "En Cours",
    createdAt: "2025-05-20",
  },
  {
    assignmentId: 2,
    missionId: 2,
    missionTitle: "Audit de sécurité informatique",
    beneficiary: "Marie Curie",
    matricule: "MC456",
    function: "Auditeur",
    base: "Lyon",
    direction: "Sécurité",
    departmentService: "Audit",
    costCenter: "CC002",
    meansOfTransport: "Avion",
    whoWillGo: "Lyon",
    departureDate: "2025-07-15",
    departureTime: "09:30",
    missionDuration: 3,
    returnDate: "2025-07-18",
    returnTime: "17:00",
    status: "Planifié",
    createdAt: "2025-05-25",
  },
  {
    assignmentId: 3,
    missionId: 3,
    missionTitle: "Formation des employés",
    beneficiary: "Paul Martin",
    matricule: "PM789",
    function: "Formateur",
    base: "Marseille",
    direction: "RH",
    departmentService: "Formation",
    costCenter: "CC003",
    meansOfTransport: "Voiture",
    whoWillGo: "Marseille",
    departureDate: "2025-08-01",
    departureTime: "07:00",
    missionDuration: 2,
    returnDate: "2025-08-03",
    returnTime: "19:00",
    status: "Terminé",
    createdAt: "2025-04-10",
  },
  {
    assignmentId: 4,
    missionId: 4,
    missionTitle: "Migration vers le cloud",
    beneficiary: "Sophie Leroy",
    matricule: "SL012",
    function: "Architecte Cloud",
    base: "Toulouse",
    direction: "IT",
    departmentService: "Infrastructure",
    costCenter: "CC004",
    meansOfTransport: "Train",
    whoWillGo: "Toulouse",
    departureDate: "2025-09-01",
    departureTime: "10:00",
    missionDuration: 7,
    returnDate: "2025-09-08",
    returnTime: "16:00",
    status: "En Cours",
    createdAt: "2025-06-05",
  },
  {
    assignmentId: 5,
    missionId: 5,
    missionTitle: "Optimisation des processus",
    beneficiary: "Lucie Bernard",
    matricule: "LB345",
    function: "Analyste",
    base: "Nice",
    direction: "Opérations",
    departmentService: "Processus",
    costCenter: "CC005",
    meansOfTransport: "Avion",
    whoWillGo: "Nice",
    departureDate: "2025-06-20",
    departureTime: "11:00",
    missionDuration: 4,
    returnDate: "2025-06-24",
    returnTime: "20:00",
    status: "Planifié",
    createdAt: "2025-05-15",
  },
];

const AssignedPersonsList = () => {
  const navigate = useNavigate();
  const [assignedPersons, setAssignedPersons] = useState([]);
  const [stats, setStats] = useState({ total: 0, enCours: 0, planifie: 0, termine: 0 });
  const [filters, setFilters] = useState({
    status: "",
    beneficiaryKeyword: "",
    missionTitleKeyword: "",
    departureDateMin: "",
    departureDateMax: "",
    base: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalEntries, setTotalEntries] = useState(0);
  const [isLoading, setIsLoading] = useState( false);
  const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" });
  const [isMinimized, setIsMinimized] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  // Simuler le chargement des données
  useEffect(() => {
    setIsLoading(true);
    // Simuler un appel API
    setTimeout(() => {
      setAssignedPersons(mockAssignedPersons);
      setTotalEntries(mockAssignedPersons.length);
      // Calculer les statistiques
      const stats = {
        total: mockAssignedPersons.length,
        enCours: mockAssignedPersons.filter((m) => m.status === "En Cours").length,
        planifie: mockAssignedPersons.filter((m) => m.status === "Planifié").length,
        termine: mockAssignedPersons.filter((m) => m.status === "Terminé").length,
      };
      setStats(stats);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filtrer les assignations
  const filteredAssignedPersons = useMemo(() => {
    let filtered = mockAssignedPersons;

    if (filters.beneficiaryKeyword) {
      filtered = filtered.filter((assignment) =>
        assignment.beneficiary.toLowerCase().includes(filters.beneficiaryKeyword.toLowerCase())
      );
    }

    if (filters.missionTitleKeyword) {
      filtered = filtered.filter((assignment) =>
        assignment.missionTitle.toLowerCase().includes(filters.missionTitleKeyword.toLowerCase())
      );
    }

    if (filters.base) {
      filtered = filtered.filter((assignment) =>
        assignment.base.toLowerCase().includes(filters.base.toLowerCase())
      );
    }

    if (filters.status) {
      filtered = filtered.filter((assignment) => assignment.status === filters.status);
    }

    if (filters.departureDateMin) {
      filtered = filtered.filter((assignment) => assignment.departureDate >= filters.departureDateMin);
    }

    if (filters.departureDateMax) {
      filtered = filtered.filter((assignment) => assignment.departureDate <= filters.departureDateMax);
    }

    return filtered;
  }, [filters]);

  // Pagination
  const paginatedAssignedPersons = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAssignedPersons.slice(start, start + pageSize);
  }, [filteredAssignedPersons, currentPage, pageSize]);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFilterSubmit = (event) => {
    event.preventDefault();
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      status: "",
      beneficiaryKeyword: "",
      missionTitleKeyword: "",
      departureDateMin: "",
      departureDateMax: "",
      base: "",
    };
    setFilters(resetFilters);
    setCurrentPage(1);
    setAlert({ isOpen: true, type: "info", message: "Filtres réinitialisés." });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setCurrentPage(1);
  };

  const handleRowClick = (assignmentId) => {
    if (assignmentId) {
      navigate(`/assignments/details/${assignmentId}`);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized((prev) => !prev);
  };

  const toggleHide = () => {
    setIsHidden((prev) => !prev);
  };

  const totalPages = Math.ceil(filteredAssignedPersons.length / pageSize);

  const getStatusBadge = (status) => {
    const statusClass =
      status === "En Cours"
        ? "status-progress"
        : status === "Planifié"
        ? "status-pending"
        : status === "Terminé"
        ? "status-approved"
        : "status-pending";
    return <span className={`status-badge ${statusClass}`}>{status || "Inconnu"}</span>;
  };

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
              <Clock className="w-6 h-6" />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total des assignations</div>
            </div>
  </div>
  <div className="stat-card stat-card-progress">
    <div className="stat-icon">
      <Clock className="w-6 h-6" />
    </div>
    <div  className="stat-content">
      <div className="stat-number">{stats.enCours}</div>
      <div className="stat-label">En Cours</div>
    </div>
  </div>
  <div className="stat-card stat-card-pending">
    <div className="stat-icon">
      <Calendar className="w-6 h-6" />
    </div>
    <div className="stat-content">
      <div className="stat-number">{stats.planifie}</div>
      <div className="stat-label">Planifié</div>
    </div>
  </div>
  <div className="stat-card stat-card-approved">
    <div className="stat-icon">
      <CheckCircle className="w-6 h-6" />
    </div>
    <div className="stat-content">
      <div className="stat-number">{stats.termine}</div>
      <div className="stat-label">Terminé</div>
    </div>
  </div>
</div>
</div>

      {/* Section des filtres */}
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
                        <label className="form-label-search">Bénéficiaire</label>
                      </th>
                      <td className="form-input-cell-search">
                        <input
                          name="beneficiaryKeyword"
                          type="text"
                          value={filters.beneficiaryKeyword}
                          onChange={(e) => handleFilterChange("beneficiaryKeyword", e.target.value)}
                          className="form-input-search"
                          placeholder="Recherche par bénéficiaire"
                        />
                      </td>
                      <th className="form-label-cell-search">
                        <label className="form-label-search">Intitulé de la Mission</label>
                      </th>
                      <td className="form-input-cell-search">
                        <input
                          name="missionTitleKeyword"
                          type="text"
                          value={filters.missionTitleKeyword}
                          onChange={(e) => handleFilterChange("missionTitleKeyword", e.target.value)}
                          className="form-input-search"
                          placeholder="Recherche par titre de mission"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th className="form-label-cell-search">
                        <label className="form-label-search">Base</label>
                      </th>
                      <td className="form-input-cell-search">
                        <input
                          name="base"
                          type="text"
                          value={filters.base}
                          onChange={(e) => handleFilterChange("base", e.target.value)}
                          className="form-input-search"
                          placeholder="Recherche par base"
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
                          <option value="En Cours">En Cours</option>
                          <option value="Planifié">Planifié</option>
                          <option value="Terminé">Terminé</option>
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

      {/* Bouton pour réafficher les filtres si cachés */}
      {isHidden && (
        <div className="filters-toggle">
          <button type="button" className="btn-show-filters" onClick={toggleHide}>
            Afficher les filtres
          </button>
        </div>
      )}

      {/* Section titre et bouton Nouvelle Assignation */}
      <div className="table-header">
        <h2 className="table-title">Liste des Assignations de Mission</h2>
        <button
          onClick={() => navigate("/assignments/create")}
          className="btn-new-request"
        >
          <Plus className="w-4 h-4" />
          Nouvelle assignation
        </button>
      </div>

      {/* Tableau de données */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Bénéficiaire</th>
              <th>Matricule</th>
              <th>Mission</th>
              <th>Fonction</th>
              <th>Base</th>
              <th>Date de départ</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7}>Chargement...</td>
              </tr>
            ) : paginatedAssignedPersons.length > 0 ? (
              paginatedAssignedPersons.map((assignment) => (
                <tr
                  key={assignment.assignmentId}
                  onClick={() => handleRowClick(assignment.assignmentId)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{assignment.beneficiary || "Non spécifié"}</td>
                  <td>{assignment.matricule || "Non spécifié"}</td>
                  <td>{assignment.missionTitle || "Non spécifié"}</td>
                  <td>{assignment.function || "Non spécifié"}</td>
                  <td>{assignment.base || "Non spécifié"}</td>
                  <td>{formatDate(assignment.departureDate) || "Non spécifié"}</td>
                  <td>{getStatusBadge(assignment.status)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7}>Aucune donnée trouvée.</td>
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
          Affichage des données {Math.min((currentPage - 1) * pageSize + 1, filteredAssignedPersons.length)} à{" "}
          {Math.min(currentPage * pageSize, filteredAssignedPersons.length)} sur {filteredAssignedPersons.length} entrées
        </div>
        <div className="pagination-controls">{renderPagination()}</div>
      </div>
    </div>
  );
};

export default AssignedPersonsList;
"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, Users, Clock, CheckCircle, XCircle } from "lucide-react"
import { formatDate } from "../../../utils/utils"
import "../../../styles/generic-table-styles.css"

// Données statiques
const staticRequests = [
  {
    recruitmentRequestId: "1",
    jobTitle: "Développeur Full Stack",
    requesterId: "EMP001",
    requestDate: "2025-06-01",
    status: "En Attente",
    priority: "Haute",
  },
  {
    recruitmentRequestId: "2",
    jobTitle: "Designer UX/UI",
    requesterId: "EMP002",
    requestDate: "2025-06-15",
    status: "Approuvé",
    priority: "Moyenne",
  },
  {
    recruitmentRequestId: "3",
    jobTitle: "Manager de Projet",
    requesterId: "EMP003",
    requestDate: "2025-07-01",
    status: "En Cours",
    priority: "Normale",
  },
  {
    recruitmentRequestId: "4",
    jobTitle: "Analyste Data",
    requesterId: "EMP004",
    requestDate: "2025-07-10",
    status: "Rejeté",
    priority: "Basse",
  },
]

const RecruitmentRequestList = () => {
  const navigate = useNavigate()
  const [requests, setRequests] = useState(staticRequests)
  const [filters, setFilters] = useState({
    status: "",
    jobTitleKeyword: "",
    requestDateMin: "",
    requestDateMax: "",
    approvalDateMin: "",
    approvalDateMax: "",
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [totalEntries, setTotalEntries] = useState(staticRequests.length)

  const recruitmentTypeHints = useMemo(
    () => ({
      recruitmentRequestId: "string",
      jobTitle: "string",
      description: "string",
      status: "string",
      requestDate: "date approvalDate: date",
      priority: "string",
      vacancyCount: "int",
      salary: "double",
    }),
    [],
  )

  // Calcul des statistiques
  const stats = useMemo(() => {
    const total = staticRequests.length
    const enAttente = staticRequests.filter((req) => req.status === "En Attente").length
    const approuvees = staticRequests.filter((req) => req.status === "Approuvé").length
    const rejetees = staticRequests.filter((req) => req.status === "Rejeté").length
    return { total, enAttente, approuvees, rejetees }
  }, [])

  const fetchRequests = useCallback(
    (filters = {}, page = 1) => {
      let filteredRequests = [...staticRequests]

      // Appliquer les filtres
      if (filters.status) {
        filteredRequests = filteredRequests.filter((req) => req.status === filters.status)
      }
      if (filters.jobTitleKeyword) {
        filteredRequests = filteredRequests.filter((req) =>
          req.jobTitle.toLowerCase().includes(filters.jobTitleKeyword.toLowerCase()),
        )
      }
      if (filters.requestDateMin) {
        filteredRequests = filteredRequests.filter(
          (req) => new Date(req.requestDate) >= new Date(filters.requestDateMin),
        )
      }
      if (filters.requestDateMax) {
        filteredRequests = filteredRequests.filter(
          (req) => new Date(req.requestDate) <= new Date(filters.requestDateMax),
        )
      }

      // Mettre à jour le nombre total d'entrées
      setTotalEntries(filteredRequests.length)

      // Pagination
      const start = (page - 1) * pageSize
      const paginatedRequests = filteredRequests.slice(start, start + pageSize)
      setRequests(paginatedRequests)
    },
    [pageSize],
  )

  useEffect(() => {
    fetchRequests(filters, currentPage)
  }, [fetchRequests, currentPage, filters])

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }))
    setCurrentPage(1)
  }

  const handleFilterSubmit = (event) => {
    event.preventDefault()
    setCurrentPage(1)
    fetchRequests(filters, 1)
  }

  const handleResetFilters = () => {
    const resetFilters = {
      status: "",
      jobTitleKeyword: "",
      requestDateMin: "",
      requestDateMax: "",
      approvalDateMin: "",
      approvalDateMax: "",
    }
    setFilters(resetFilters)
    setCurrentPage(1)
    fetchRequests(resetFilters, 1)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value))
    setCurrentPage(1)
    fetchRequests(filters, 1)
  }

  const totalPages = Math.ceil(totalEntries / pageSize)

  const getStatusBadge = (status) => {
    return (
      <span
        className={`status-badge ${
          status === "En Attente"
            ? "status-pending"
            : status === "Approuvé"
              ? "status-approved"
              : status === "Rejeté"
                ? "status-rejected"
                : status === "En Cours"
                  ? "status-progress"
                  : "status-pending"
        }`}
      >
        {status}
      </span>
    )
  }

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
            <div className="stat-label">En attente</div>
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
                <select className="form-input-search">
                  <option value="">Tous les direction</option>
                </select>
              </td>
            </tr>
            <tr>
              <th className="form-label-cell-search">
                <label className="form-label-search">Type de Contrat</label>
              </th>
              <td className="form-input-cell-search">
                <select className="form-input-search">
                  <option value="">Tous les Contrats</option>
                </select>
              </td>
              <th className="form-label-cell-search">
                <label className="form-label-search">Site</label>
              </th>
              <td className="form-input-cell-search">
                <select className="form-input-search">
                  <option value="">Recherche par poste</option>
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
                  <option value="En Attente">En Attente</option>
                  <option value="En Cours">En Cours</option>
                  <option value="Approuvé">Approuvé</option>
                  <option value="Rejeté">Rejeté</option>
                </select>
              </td>
              <th className="form-label-cell-search">
                <label className="form-label-search">Motif</label>
              </th>
              <td className="form-input-cell-search">
                <select className="form-input-search">
                  <option value="">Tous les motif</option>
                </select>
              </td>
            </tr>
            <tr>
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
            {requests.length > 0 ? (
              requests.map((request) => (
                <tr key={request.recruitmentRequestId}>
                  <td>{request.jobTitle}</td>
                  <td>1</td>
                  <td>CDI</td>
                  <td>Direction Technique</td>
                  <td>TNR</td>
                  <td>{formatDate(request.requestDate)}</td>
                  <td>{getStatusBadge(request.status)}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-action btn-modify">Modifier</button>
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
        <div className="pagination-info">Showing data 1 to 8 of 256K entries</div>
        <div className="pagination-controls">
          <button className={`pagination-btn ${currentPage === 1 ? "active" : ""}`} onClick={() => handlePageChange(1)}>
            1
          </button>
          <button className="pagination-btn" onClick={() => handlePageChange(2)}>
            2
          </button>
          <span className="pagination-dots">...</span>
          <button className="pagination-btn" onClick={() => handlePageChange(8)}>
            8
          </button>
        </div>
      </div>
    </div>
  )
}

export default RecruitmentRequestList

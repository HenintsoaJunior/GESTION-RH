import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Download } from 'lucide-react';
import { formatDate } from '../../../utils/utils';
import '../../../styles/generic-table-styles.css';

// Données statiques
const staticRequests = [
  {
    recruitmentRequestId: '1',
    jobTitle: 'Développeur Full Stack',
    requesterId: 'EMP001',
    requestDate: '2025-06-01',
    status: 'En Attente',
    priority: 'Haute',
  },
  {
    recruitmentRequestId: '2',
    jobTitle: 'Designer UX/UI',
    requesterId: 'EMP002',
    requestDate: '2025-06-15',
    status: 'Approuvé',
    priority: 'Moyenne',
  },
  {
    recruitmentRequestId: '3',
    jobTitle: 'Manager de Projet',
    requesterId: 'EMP003',
    requestDate: '2025-07-01',
    status: 'En Cours',
    priority: 'Normale',
  },
  {
    recruitmentRequestId: '4',
    jobTitle: 'Analyste Data',
    requesterId: 'EMP004',
    requestDate: '2025-07-10',
    status: 'Rejeté',
    priority: 'Basse',
  },
];

const RecruitmentRequestList = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState(staticRequests);
  const [filters, setFilters] = useState({
    status: '',
    jobTitleKeyword: '',
    requestDateMin: '',
    requestDateMax: '',
    approvalDateMin: '',
    approvalDateMax: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalEntries, setTotalEntries] = useState(staticRequests.length);

  const recruitmentTypeHints = useMemo(() => ({
    recruitmentRequestId: 'string',
    jobTitle: 'string',
    description: 'string',
    status: 'string',
    requestDate: 'date approvalDate: date',
    priority: 'string',
    vacancyCount: 'int',
    salary: 'double',
  }), []);

  const fetchRequests = useCallback(
    (filters = {}, page = 1) => {
      let filteredRequests = [...staticRequests];

      // Appliquer les filtres
      if (filters.status) {
        filteredRequests = filteredRequests.filter(
          (req) => req.status === filters.status
        );
      }
      if (filters.jobTitleKeyword) {
        filteredRequests = filteredRequests.filter((req) =>
          req.jobTitle.toLowerCase().includes(filters.jobTitleKeyword.toLowerCase())
        );
      }
      if (filters.requestDateMin) {
        filteredRequests = filteredRequests.filter(
          (req) => new Date(req.requestDate) >= new Date(filters.requestDateMin)
        );
      }
      if (filters.requestDateMax) {
        filteredRequests = filteredRequests.filter(
          (req) => new Date(req.requestDate) <= new Date(filters.requestDateMax)
        );
      }

      // Mettre à jour le nombre total d'entrées
      setTotalEntries(filteredRequests.length);

      // Pagination
      const start = (page - 1) * pageSize;
      const paginatedRequests = filteredRequests.slice(start, start + pageSize);

      setRequests(paginatedRequests);
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
      status: '',
      jobTitleKeyword: '',
      requestDateMin: '',
      requestDateMax: '',
      approvalDateMin: '',
      approvalDateMax: '',
    };
    setFilters(resetFilters);
    setCurrentPage(1);
    fetchRequests(resetFilters, 1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setCurrentPage(1);
    fetchRequests(filters, 1);
  };

  const totalPages = Math.ceil(totalEntries / pageSize);

  const getStatusBadge = (status) => {
    return (
      <span
        className={`ascii-status ascii-status-${
          status === 'En Attente' ? 'info' :
          status === 'Approuvé' ? 'success' :
          status === 'Rejeté' ? 'danger' :
          status === 'En Cours' ? 'warning' : 'info'
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="ascii-page">
      <div className="ascii-container">
        {/* En-tête */}
        <div className="ascii-header flex justify-between items-center mb-6">
          <div>
            <p className="ascii-text-muted mt-1">Gérez toutes les demandes de recrutement</p>
          </div>
          <div className="ascii-actions">
            <button className="ascii-btn-secondary">
              <Download className="w-4 h-4" />
              Exporter
            </button>
            <button
              onClick={() => navigate('/recruitment/recruitment-request-form')}
              className="ascii-btn-primary"
            >
              <Plus className="w-4 h-4" />
              Ajouter un élément
            </button>
          </div>
        </div>

        {/* Formulaire de filtres */}
        <div className="ascii-filter-container">
          <div className="ascii-filter-header">
            <div className="ascii-filter-icon">☙</div>
            <h2 className="ascii-filter-title">Recherche</h2>
          </div>
          <div className="ascii-filter-form">
            <table className="ascii-filter-table">
              <tbody>
                <tr>
                  <th className="ascii-label-cell">
                    <label className="ascii-label ascii-label-required">
                      Status
                    </label>
                  </th>
                  <td>
                    <select
                      name="status"
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="ascii-select"
                    >
                      <option value="">Tous</option>
                      <option value="En Attente">En Attente</option>
                      <option value="En Cours">En Cours</option>
                      <option value="Approuvé">Approuvé</option>
                      <option value="Rejeté">Rejeté</option>
                    </select>
                  </td>
                  <th className="ascii-label-cell">
                    <label className="ascii-label ascii-label-required">
                      Mot-clé du titre
                    </label>
                  </th>
                  <td>
                    <input
                      name="jobTitleKeyword"
                      type="text"
                      value={filters.jobTitleKeyword}
                      onChange={(e) => handleFilterChange('jobTitleKeyword', e.target.value)}
                      className="ascii-input"
                    />
                  </td>
                </tr>
                <tr>
                  <th className="ascii-label-cell">
                    <label className="ascii-label ascii-label-required">
                      Date de demande min
                    </label>
                  </th>
                  <td>
                    <input
                      name="requestDateMin"
                      type="date"
                      value={filters.requestDateMin}
                      onChange={(e) => handleFilterChange('requestDateMin', e.target.value)}
                      className="ascii-input"
                    />
                  </td>
                  <th className="ascii-label-cell">
                    <label className="ascii-label ascii-label-required">
                      Date de demande max
                    </label>
                  </th>
                  <td>
                    <input
                      name="requestDateMax"
                      type="date"
                      value={filters.requestDateMax}
                      onChange={(e) => handleFilterChange('requestDateMax', e.target.value)}
                      className="ascii-input"
                    />
                  </td>
                </tr>
                <tr>
                  <th className="ascii-label-cell">
                    <label className="ascii-label ascii-label-required">
                      Date d'approbation min
                    </label>
                  </th>
                  <td>
                    <input
                      name="approvalDateMin"
                      type="date"
                      value={filters.approvalDateMin}
                      onChange={(e) => handleFilterChange('approvalDateMin', e.target.value)}
                      className="ascii-input"
                    />
                  </td>
                  <th className="ascii-label-cell">
                    <label className="ascii-label ascii-label-required">
                      Date d'approbation max
                    </label>
                  </th>
                  <td>
                    <input
                      name="approvalDateMax"
                      type="date"
                      value={filters.approvalDateMax}
                      onChange={(e) => handleFilterChange('approvalDateMax', e.target.value)}
                      className="ascii-input"
                    />
                  </td>
                </tr>
                <tr>
                  <td colSpan={4}>
                    <div className="flex gap-md justify-end">
                      <button type="submit" className="ascii-filter-submit" onClick={handleFilterSubmit}>
                        Rechercher
                      </button>
                      <button type="button" className="ascii-btn-secondary" onClick={handleResetFilters}>
                        Réinitialiser
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Tableau de données */}
        <div className="ascii-table-wrapper">
          <table className="ascii-data-table">
            <thead>
              <tr>
                <th>Poste</th>
                <th>Demandeur</th>
                <th>Date de création</th>
                <th>Statut</th>
                <th>Priorité</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length > 0 ? (
                requests.map((request) => (
                  <tr key={request.recruitmentRequestId}>
                    <td>
                      <div className="ascii-cell-content">
                        <div className="ascii-cell-title">{request.jobTitle}</div>
                        <div className="ascii-cell-subtitle">ID: {request.recruitmentRequestId}</div>
                      </div>
                    </td>
                    <td>{request.requesterId || 'N/A'}</td>
                    <td>{formatDate(request.requestDate)}</td>
                    <td>{getStatusBadge(request.status)}</td>
                    <td>
                      <span className="ascii-status ascii-status-warning">
                        {request.priority || 'Normale'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-sm">
                        <button
                          className="ascii-action-btn ascii-btn-small"
                          onClick={() => navigate(`/recruitment/recruitment-request/${request.recruitmentRequestId}/files`)}
                        >
                          <FileText className="w-3 h-3" />
                          Documents
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>Aucune donnée trouvée.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="ascii-pagination">
          <div className="ascii-pagination-info">
            Affichage de {(currentPage - 1) * pageSize + 1} à{' '}
            {Math.min(currentPage * pageSize, totalEntries)} sur {totalEntries} entrées
          </div>
          <div className="ascii-pagination-controls flex items-center gap-md">
            <select
              value={pageSize}
              onChange={handlePageSizeChange}
              className="ascii-select w-24"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <button
              className="ascii-pagination-btn"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Précédent
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={page === currentPage ? 'ascii-pagination-btn-active' : 'ascii-pagination-btn'}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}
            <button
              className="ascii-pagination-btn"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruitmentRequestList;
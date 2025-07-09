import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { NativeSelect, NativeSelectItem } from '../../../components/Select';
import { FileText, Plus, Download } from 'lucide-react';
import { BASE_URL } from '../../../config/apiConfig';
import { parseData, formatDate, cleanFilters, hasActiveFilters } from '../../../utils/utils';
import '../../../styles/generic-table-styles.css';
import '../../../styles/generic-search-styles.css';

const RecruitmentRequestList = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    jobTitleKeyword: '',
    requestDateMin: '',
    requestDateMax: '',
    approvalDateMin: '',
    approvalDateMax: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); // Default to 5 items per page
  const [totalEntries, setTotalEntries] = useState(0);

  const recruitmentTypeHints = useMemo(() => ({
    recruitmentRequestId: 'string',
    jobTitle: 'string',
    description: 'string',
    status: 'string',
    requestDate: 'date',
    approvalDate: 'date',
    priority: 'string',
    vacancyCount: 'int',
    salary: 'double',
  }), []);

  const fetchRequests = useCallback(
    async (filters = {}, page = 1) => {
      try {
        setLoading(true);
        const cleanedFilters = cleanFilters(filters);
        const hasFilters = hasActiveFilters(cleanedFilters);
        const start = (page - 1) * pageSize;

        let totalResponse, paginatedResponse;

        // Fetch total entries
        if (hasFilters) {
          totalResponse = await fetch(`${BASE_URL}/api/RecruitmentRequest/search`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': '*/*',
            },
            body: JSON.stringify(cleanedFilters), // No start/count for total
          });
        } else {
          totalResponse = await fetch(`${BASE_URL}/api/RecruitmentRequest`, {
            headers: { 'Accept': '*/*' },
          });
        }

        if (!totalResponse.ok) {
          throw new Error(`Erreur lors de la récupération du total: ${totalResponse.status}`);
        }

        const totalData = await totalResponse.json();
        console.log('Total API Response:', totalData); // Debug: Log total response
        const total = Number(totalData.totalEntries || totalData.length || 0);
        setTotalEntries(total);
        console.log('Total Entries Set:', total); // Debug: Log totalEntries

        // Fetch paginated data
        if (hasFilters) {
          paginatedResponse = await fetch(`${BASE_URL}/api/RecruitmentRequest/search`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': '*/*',
            },
            body: JSON.stringify({ ...cleanedFilters, start, count: pageSize }),
          });
        } else {
          paginatedResponse = await fetch(
            `${BASE_URL}/api/RecruitmentRequest/requests/paginated?start=${start}&count=${pageSize}`,
            {
              headers: { 'Accept': '*/*' },
            }
          );
        }

        if (!paginatedResponse.ok) {
          throw new Error(`Erreur lors de la récupération des données paginées: ${paginatedResponse.status}`);
        }

        const paginatedData = await paginatedResponse.json();
        console.log('Paginated API Response:', paginatedData); // Debug: Log paginated response

        const parsedData = parseData(paginatedData.requests || paginatedData, recruitmentTypeHints);
        console.log('Parsed Data:', parsedData); // Debug: Log parsed data
        console.log('Parsed Data Length:', parsedData.length); // Debug: Log number of items

        setRequests(parsedData);
      } catch (err) {
        console.error('Fetch Error:', err); // Debug: Log any errors
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [recruitmentTypeHints, pageSize]
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

  const handlePageSizeChange = (value) => {
    setPageSize(Number(value));
    setCurrentPage(1);
    fetchRequests(filters, 1);
  };

  const totalPages = Math.ceil(totalEntries / pageSize);
  console.log('Pagination Info:', { currentPage, pageSize, totalEntries, totalPages }); // Debug: Log pagination state

  const getStatusBadge = (status) => {
    return (
      <span
        className={`status-badge status-badge-${
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

  if (loading) {
    return (
      <div className="table-page">
        <div className="table-container">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p>Chargement des demandes...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="table-page">
        <div className="table-container">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center text-red-500">
              <p className="text-lg font-semibold">Erreur</p>
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="table-page">
      <div className="table-container">
        {/* En-tête */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-gray-600 mt-1">Gérez toutes les demandes de recrutement</p>
          </div>
          <div className="action-buttons-container">
            <Button className="btn-secondary">
              <Download className="w-4 h-4" />
              Exporter
            </Button>
            <Button
              onClick={() => navigate('/recruitment/recruitment-request-form')}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" />
              Ajouter un élément
            </Button>
          </div>
        </div>

        {/* Formulaire de filtres */}
        <div className="form-container-filter">
          <div className="table-header">
            <div className="table-icon">☙</div>
            <h2 className="table-title">Recherche</h2>
          </div>
          <div className="generic-form-filter">
            <table className="form-table-filter">
              <tbody>
                <tr>
                  <th className="form-label-cell-filter">
                    <label className="form-label-filter form-label-required-filter">
                      Status
                    </label>
                  </th>
                  <td>
                    <NativeSelect
                      name="status"
                      value={filters.status}
                      onValueChange={(value) => handleFilterChange('status', value)}
                      className="form-select-filter"
                    >
                      <NativeSelectItem value="">Tous</NativeSelectItem>
                      <NativeSelectItem value="En Attente">En Attente</NativeSelectItem>
                      <NativeSelectItem value="En Cours">En Cours</NativeSelectItem>
                      <NativeSelectItem value="Approuvé">Approuvé</NativeSelectItem>
                      <NativeSelectItem value="Rejeté">Rejeté</NativeSelectItem>
                    </NativeSelect>
                  </td>
                  <th className="form-label-cell-filter">
                    <label className="form-label-filter form-label-required-filter">
                      Mot-clé du titre
                    </label>
                  </th>
                  <td>
                    <Input
                      name="jobTitleKeyword"
                      type="text"
                      value={filters.jobTitleKeyword}
                      onChange={(e) => handleFilterChange('jobTitleKeyword', e.target.value)}
                      className="form-input-filter"
                    />
                  </td>
                </tr>
                <tr>
                  <th className="form-label-cell-filter">
                    <label className="form-label-filter form-label-required-filter">
                      Date de demande min
                    </label>
                  </th>
                  <td>
                    <Input
                      name="requestDateMin"
                      type="date"
                      value={filters.requestDateMin}
                      onChange={(e) => handleFilterChange('requestDateMin', e.target.value)}
                      className="form-input-filter"
                    />
                  </td>
                  <th className="form-label-cell-filter">
                    <label className="form-label-filter form-label-required-filter">
                      Date de demande max
                    </label>
                  </th>
                  <td>
                    <Input
                      name="requestDateMax"
                      type="date"
                      value={filters.requestDateMax}
                      onChange={(e) => handleFilterChange('requestDateMax', e.target.value)}
                      className="form-input-filter"
                    />
                  </td>
                </tr>
                <tr>
                  <th className="form-label-cell-filter">
                    <label className="form-label-filter form-label-required-filter">
                      Date d'approbation min
                    </label>
                  </th>
                  <td>
                    <Input
                      name="approvalDateMin"
                      type="date"
                      value={filters.approvalDateMin}
                      onChange={(e) => handleFilterChange('approvalDateMin', e.target.value)}
                      className="form-input-filter"
                    />
                  </td>
                  <th className="form-label-cell-filter">
                    <label className="form-label-filter form-label-required-filter">
                      Date d'approbation max
                    </label>
                  </th>
                  <td>
                    <Input
                      name="approvalDateMax"
                      type="date"
                      value={filters.approvalDateMax}
                      onChange={(e) => handleFilterChange('approvalDateMax', e.target.value)}
                      className="form-input-filter"
                    />
                  </td>
                </tr>
                <tr>
                  <td colSpan={4}>
                    <div className="flex gap-md justify-end">
                      <Button type="submit" className="filter-submit-btn-filter" onClick={handleFilterSubmit}>
                        Rechercher
                      </Button>
                      <Button type="button" className="btn-secondary-filter" onClick={handleResetFilters}>
                        Réinitialiser
                      </Button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Tableau de données */}
        <div className="data-table-wrapper">
          <table className="data-table">
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
                      <div className="cell-content">
                        <div className="cell-title">{request.jobTitle}</div>
                        <div className="cell-subtitle">ID: {request.recruitmentRequestId}</div>
                      </div>
                    </td>
                    <td>{request.requesterId || 'N/A'}</td>
                    <td>{formatDate(request.requestDate)}</td>
                    <td>{getStatusBadge(request.status)}</td>
                    <td>
                      <span className="status-badge status-badge-warning">
                        {request.priority || 'Normale'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-sm">
                        <Button
                          size="sm"
                          className="action-btn btn-small"
                          onClick={() => navigate(`/recruitment/recruitment-request/${request.recruitmentRequestId}/files`)}
                        >
                          <FileText className="w-3 h-3" />
                          Documents
                        </Button>
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
        <div className="pagination">
          <div className="pagination-info">
            Affichage de {(currentPage - 1) * pageSize + 1} à{' '}
            {Math.min(currentPage * pageSize, totalEntries)} sur {totalEntries} entrées
          </div>
          <div className="pagination-controls flex items-center gap-md">
            <NativeSelect
              value={pageSize}
              onValueChange={handlePageSizeChange}
              className="w-24"
            >
              <NativeSelectItem value={5}>5</NativeSelectItem>
              <NativeSelectItem value={10}>10</NativeSelectItem>
              <NativeSelectItem value={25}>25</NativeSelectItem>
              <NativeSelectItem value={50}>50</NativeSelectItem>
            </NativeSelect>
            <Button
              variant="outline"
              size="sm"
              className="pagination-btn"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Précédent
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant="outline"
                size="sm"
                className={page === currentPage ? 'pagination-btn-active' : 'pagination-btn'}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="pagination-btn"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Suivant
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruitmentRequestList;
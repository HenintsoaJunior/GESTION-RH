"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { NativeSelect, NativeSelectItem } from '../../../components/Select';
import { FileText, Plus, Download } from 'lucide-react';
import { BASE_URL } from '../../../config/apiConfig';
import { parseData, formatDate, cleanFilters, hasActiveFilters } from '../../../utils/utils';
import '../../../styles/generic-table-styles.css';

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
    async (filters = {}) => {
      try {
        setLoading(true);
        const cleanedFilters = cleanFilters(filters);
        const hasFilters = hasActiveFilters(cleanedFilters);

        let response;
        if (hasFilters) {
          response = await fetch(`${BASE_URL}/api/RecruitmentRequest/search`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': '*/*',
            },
            body: JSON.stringify(cleanedFilters),
          });
        } else {
          response = await fetch(`${BASE_URL}/api/RecruitmentRequest`, {
            headers: { 'Accept': '*/*' },
          });
        }

        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des demandes');
        }

        const data = await response.json();
        const parsedData = parseData(data, recruitmentTypeHints);
        setRequests(parsedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [recruitmentTypeHints]
  );

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterSubmit = (event) => {
    event.preventDefault();
    fetchRequests(filters);
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
    fetchRequests(resetFilters);
  };

  const getStatusBadge = (status) => {
    return (
      <span className={`status-badge status-badge-${
        status === 'En Attente' ? 'info' : 
        status === 'Approuvé' ? 'success' : 
        status === 'Rejeté' ? 'danger' : 
        status === 'En Cours' ? 'warning' : 'info'
      }`}>
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
            <h1 className="text-3xl font-bold text-gray-900">Demandes de recrutement</h1>
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
        <div className="filter-form">
          <form onSubmit={handleFilterSubmit}>
            <table className="filter-table">
              <tbody>
                <tr>
                  <td>
                    <label className="filter-label">Statut</label>
                    <NativeSelect
                      name="status"
                      value={filters.status}
                      onValueChange={(value) => handleFilterChange('status', value)}
                    >
                      <NativeSelectItem value="">Tous</NativeSelectItem>
                      <NativeSelectItem value="En Attente">En Attente</NativeSelectItem>
                      <NativeSelectItem value="En Cours">En Cours</NativeSelectItem>
                      <NativeSelectItem value="Approuvé">Approuvé</NativeSelectItem>
                      <NativeSelectItem value="Rejeté">Rejeté</NativeSelectItem>
                    </NativeSelect>
                  </td>
                  <td>
                    <label className="filter-label">Mot-clé du titre</label>
                    <Input
                      name="jobTitleKeyword"
                      type="text"
                      value={filters.jobTitleKeyword}
                      onChange={(e) => handleFilterChange('jobTitleKeyword', e.target.value)}
                      className="flex-1"
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    <label className="filter-label">Date de demande min</label>
                    <Input
                      name="requestDateMin"
                      type="date"
                      value={filters.requestDateMin}
                      onChange={(e) => handleFilterChange('requestDateMin', e.target.value)}
                      className="flex-1"
                    />
                  </td>
                  <td>
                    <label className="filter-label">Date de demande max</label>
                    <Input
                      name="requestDateMax"
                      type="date"
                      value={filters.requestDateMax}
                      onChange={(e) => handleFilterChange('requestDateMax', e.target.value)}
                      className="flex-1"
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    <label className="filter-label">Date d'approbation min</label>
                    <Input
                      name="approvalDateMin"
                      type="date"
                      value={filters.approvalDateMin}
                      onChange={(e) => handleFilterChange('approvalDateMin', e.target.value)}
                      className="flex-1"
                    />
                  </td>
                  <td>
                    <label className="filter-label">Date d'approbation max</label>
                    <Input
                      name="approvalDateMax"
                      type="date"
                      value={filters.approvalDateMax}
                      onChange={(e) => handleFilterChange('approvalDateMax', e.target.value)}
                      className="flex-1"
                    />
                  </td>
                </tr>
                <tr>
                  <td colSpan={2}>
                    <div className="flex gap-md">
                      <Button type="submit" className="filter-submit-btn">Rechercher</Button>
                      <Button type="button" className="btn-secondary" onClick={handleResetFilters}>
                        Réinitialiser
                      </Button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </form>
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
            Affichage de 1 à {requests.length} sur {requests.length} entrées
          </div>
          <div className="pagination-controls">
            <Button variant="outline" size="sm" className="pagination-btn-active">
              1
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruitmentRequestList;
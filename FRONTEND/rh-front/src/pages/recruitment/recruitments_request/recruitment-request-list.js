"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "../../../components/Button";
import { Input } from "../../../components/Input";
import { NativeSelect, NativeSelectItem } from "../../../components/Select";
import { Download, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import "../../../styles/generic-table-styles.css";
import { BASE_URL } from "../../../config/apiConfig";
import { parseData, formatDate, cleanFilters, hasActiveFilters } from "../../../utils/utils";

export default function RecruitmentRequestList() {
  const [filters, setFilters] = useState({
    status: "",
    jobTitleKeyword: "",
    requestDateMin: "",
    requestDateMax: "",
    approvalDateMin: "",
    approvalDateMax: "",
  });
  const [requests, setRequests] = useState([]);

  const recruitmentTypeHints = useMemo(() => ({
    recruitmentRequestId: "string",
    jobTitle: "string",
    description: "string",
    status: "string",
    requestDate: "date",
    approvalDate: "date",
    priority: "string",
    vacancyCount: "int",
    salary: "double",
  }), []);

  const fetchRequests = useCallback(
    async (filters = {}) => {
      try {
        const cleanedFilters = cleanFilters(filters);
        const hasFilters = hasActiveFilters(cleanedFilters);

        let response;

        if (hasFilters) {
          response = await fetch(`${BASE_URL}/api/RecruitmentRequest/search`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "*/*",
            },
            body: JSON.stringify(cleanedFilters),
          });
        } else {
          response = await fetch(`${BASE_URL}/api/RecruitmentRequest`, {
            headers: { Accept: "*/*" },
          });
        }

        const data = await response.json();
        const parsedData = parseData(data, recruitmentTypeHints);
        setRequests(parsedData);
      } catch (error) {
        console.error("Erreur lors de la récupération des demandes :", error);
        setRequests([]);
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
      status: "",
      jobTitleKeyword: "",
      requestDateMin: "",
      requestDateMax: "",
      approvalDateMin: "",
      approvalDateMax: "",
    };
    setFilters(resetFilters);
    fetchRequests(resetFilters);
  };

  return (
    <div className="table-page">
      <div className="table-container">
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
                      onValueChange={(value) => handleFilterChange("status", value)}
                    >
                      <NativeSelectItem value="">Tous</NativeSelectItem>
                      <NativeSelectItem value="En Attente">En Attente</NativeSelectItem>
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
                      onChange={(e) => handleFilterChange("jobTitleKeyword", e.target.value)}
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
                      onChange={(e) => handleFilterChange("requestDateMin", e.target.value)}
                      className="flex-1"
                    />
                  </td>
                  <td>
                    <label className="filter-label">Date de demande max</label>
                    <Input
                      name="requestDateMax"
                      type="date"
                      value={filters.requestDateMax}
                      onChange={(e) => handleFilterChange("requestDateMax", e.target.value)}
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
                      onChange={(e) => handleFilterChange("approvalDateMin", e.target.value)}
                      className="flex-1"
                    />
                  </td>
                  <td>
                    <label className="filter-label">Date d'approbation max</label>
                    <Input
                      name="approvalDateMax"
                      type="date"
                      value={filters.approvalDateMax}
                      onChange={(e) => handleFilterChange("approvalDateMax", e.target.value)}
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

        {/* Boutons d'action */}
        <div className="action-buttons-container">
          <Button className="btn-secondary">
            <Download className="w-4 h-4" />
            Exporter
          </Button>
          <Link to="/recruitment/recruitment-request-form">
            <Button className="btn-primary">
              <Plus className="w-4 h-4" />
              Ajouter un élément
            </Button>
          </Link>
        </div>

        {/* Tableau de données */}
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Catégorie</th>
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
                        <div className="cell-subtitle">{request.description}</div>
                      </div>
                    </td>
                    <td>Développement</td>
                    <td>{formatDate(request.requestDate)}</td>
                    <td>
                      <span className={`status-badge status-badge-${
                        request.status === "En Attente" ? "info" : "success"
                      }`}>
                        {request.status}
                      </span>
                    </td>
                    <td>
                      <span className="status-badge status-badge-warning">{request.priority || 'Normale'}</span>
                    </td>
                    <td>
                      <div className="flex gap-sm">
                        <Button size="sm" className="action-btn btn-small">
                          <Download className="w-3 h-3" />
                          Télécharger
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
}
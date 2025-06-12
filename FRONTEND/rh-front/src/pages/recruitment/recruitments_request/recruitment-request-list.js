"use client";

import { useState } from "react";
import { Button } from "../../../components/Button";
import { Input } from "../../../components/Input";
import { NativeSelect, NativeSelectItem } from "../../../components/Select";
import { Download, Plus, Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import "../../../styles/generic-table-styles.css";

export default function RecruitmentRequestList() {
  const [filters, setFilters] = useState({
    statut: "actif",
    dateStart: "2024-01-01",
    dateEnd: "2024-12-31",
    categorie: "tous",
  });

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterSubmit = (event) => {
    event.preventDefault();
    console.log("Filtres appliqués :", filters);
    // TODO: Appliquer les filtres au tableau ou effectuer une requête API
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
                      name="statut"
                      value={filters.statut}
                      onValueChange={(value) => handleFilterChange("statut", value)}
                      placeholder="Sélectionner un statut"
                    >
                      <NativeSelectItem value="actif">Actif</NativeSelectItem>
                      <NativeSelectItem value="inactif">Inactif</NativeSelectItem>
                      <NativeSelectItem value="en-attente">En attente</NativeSelectItem>
                    </NativeSelect>
                  </td>
                  <td>
                    <label className="filter-label">Date de création entre</label>
                    <div className="date-range">
                      <Input
                        name="date-start"
                        type="date"
                        value={filters.dateStart}
                        onChange={(e) => handleFilterChange("dateStart", e.target.value)}
                        className="flex-1"
                      />
                      <span className="date-range-separator">et</span>
                      <Input
                        name="date-end"
                        type="date"
                        value={filters.dateEnd}
                        onChange={(e) => handleFilterChange("dateEnd", e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </td>
                  <td>
                    <label className="filter-label">Catégorie</label>
                    <NativeSelect
                      name="categorie"
                      value={filters.categorie}
                      onValueChange={(value) => handleFilterChange("categorie", value)}
                      placeholder="Sélectionner une catégorie"
                    >
                      <NativeSelectItem value="tous">Tous</NativeSelectItem>
                      <NativeSelectItem value="produit">Produit</NativeSelectItem>
                      <NativeSelectItem value="service">Service</NativeSelectItem>
                    </NativeSelect>
                  </td>
                </tr>
                <tr>
                  <td colSpan={3}>
                    <Button type="submit" className="filter-submit-btn">Rechercher</Button>
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
              <tr>
                <td>
                  <div className="cell-content">
                    <div className="cell-title">Projet Alpha</div>
                    <div className="cell-subtitle">Description du projet</div>
                  </div>
                </td>
                <td>Développement</td>
                <td>15/03/2024</td>
                <td>
                  <span className="status-badge status-badge-success">Actif</span>
                </td>
                <td>
                  <span className="status-badge status-badge-warning">Haute</span>
                </td>
                <td>
                  <div className="flex gap-sm">
                    <Button size="sm" className="action-btn btn-small">
                      <Edit className="w-3 h-3" />
                      Modifier
                    </Button>
                    <Button size="sm" className="action-btn action-btn-secondary btn-small">
                      <Trash2 className="w-3 h-3" />
                      Supprimer
                    </Button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="cell-content">
                    <div className="cell-title">Projet Beta</div>
                    <div className="cell-subtitle">Autre description</div>
                  </div>
                </td>
                <td>Design</td>
                <td>20/03/2024</td>
                <td>
                  <span className="status-badge status-badge-info">En cours</span>
                </td>
                <td>
                  <span className="status-badge status-badge-success">Normale</span>
                </td>
                <td>
                  <div className="flex gap-sm">
                    <Button size="sm" className="action-btn btn-small">
                      <Edit className="w-3 h-3" />
                      Modifier
                    </Button>
                    <Button size="sm" className="action-btn action-btn-secondary btn-small">
                      <Trash2 className="w-3 h-3" />
                      Supprimer
                    </Button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="cell-content">
                    <div className="cell-title">Projet Gamma</div>
                    <div className="cell-subtitle">Troisième projet</div>
                  </div>
                </td>
                <td>Marketing</td>
                <td>25/03/2024</td>
                <td>
                  <span className="status-badge status-badge-danger">Suspendu</span>
                </td>
                <td>
                  <span className="status-badge status-badge-info">Basse</span>
                </td>
                <td>
                  <div className="flex gap-sm">
                    <Button size="sm" className="action-btn btn-small">
                      <Edit className="w-3 h-3" />
                      Modifier
                    </Button>
                    <Button size="sm" className="action-btn action-btn-secondary btn-small">
                      <Trash2 className="w-3 h-3" />
                      Supprimer
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination">
          <div className="pagination-info">Affichage de 1 à 10 sur 156 entrées</div>
          <div className="pagination-controls">
            <Button variant="outline" size="sm" className="pagination-btn-active">
              1
            </Button>
            <Button variant="outline" size="sm" className="pagination-btn">
              2
            </Button>
            <Button variant="outline" size="sm" className="pagination-btn">
              3
            </Button>
            <Button variant="outline" size="sm" className="pagination-btn">
              ...
            </Button>
            <Button variant="outline" size="sm" className="pagination-btn">
              16
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
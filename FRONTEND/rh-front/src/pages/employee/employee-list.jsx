"use client";

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Clock, Calendar, ChevronDown, ChevronUp, X, CheckCircle, XCircle, Edit2, Trash2 } from "lucide-react";
import { formatDate } from "utils/dateConverter";
import {
  searchEmployees,
  deleteEmployee,
  fetchEmployeeStats,
} from "services/employee/employee";
import Modal from "components/modal";
import Pagination from "components/pagination";
import AutoCompleteInput from "components/auto-complete-input";
import { fetchSites } from "services/site/site";
import {
  DashboardContainer,
  StatsContainer,
  StatsGrid,
  StatCard,
  StatIcon,
  StatContent,
  StatNumber,
  StatLabel,
  FiltersContainer,
  FiltersHeader,
  FiltersTitle,
  FiltersControls,
  FilterControlButton,
  FiltersSection,
  FormTableSearch,
  FormRow,
  FormFieldCell,
  FormLabelSearch,
  FormInputSearch,
  StyledAutoCompleteInput,
  FiltersActions,
  ButtonReset,
  ButtonSearch,
  ButtonAdd,
  ButtonUpdate,
  ButtonCancel,
  ButtonConfirm,
  FiltersToggle,
  ButtonShowFilters,
  TableHeader,
  TableTitle,
  TableContainer,
  DataTable,
  TableHeadCell,
  TableRow,
  TableCell,
  StatusBadge,
  ActionButtons,
  ModalActions,
  Loading,
  NoDataMessage
} from "styles/generaliser/table-container";

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

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
      navigate(`/employee/details/${employeeId}`);
    }
  };

  const handleEditEmployee = (employeeId, e) => {
    e.stopPropagation();
    if (employeeId) {
      navigate(`/employee/edit/${employeeId}`);
    }
  };

  const handleDeleteClick = (employeeId, e) => {
    e.stopPropagation();
    setEmployeeToDelete(employeeId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (employeeToDelete) {
      try {
        await deleteEmployee(
          employeeToDelete,
          setIsLoading,
          (successAlert) => {
            setAlert(successAlert);
            searchEmployees(filters, currentPage, pageSize, setEmployees, setTotalEntries, setIsLoading, handleError);
            fetchEmployeeStats(setStats, setIsLoading, handleError);
          },
          handleError
        );
      } catch (error) {
        // Error already handled in service
      }
    }
    setShowDeleteModal(false);
    setEmployeeToDelete(null);
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
    return <StatusBadge className={statusClass}>{status || "Inconnu"}</StatusBadge>;
  };

  return (
    <DashboardContainer>
      <Modal
        type={alert.type}
        message={alert.message}
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false, fieldErrors: {} })}
        title="Notification"
      />

      <Modal
        type="warning"
        message="Êtes-vous sûr de vouloir supprimer cet employé ? Cette action est irréversible."
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setEmployeeToDelete(null);
        }}
        title="Confirmer la suppression"
      >
        <ModalActions>
          <ButtonCancel
            onClick={() => {
              setShowDeleteModal(false);
              setEmployeeToDelete(null);
            }}
          >
            Annuler
          </ButtonCancel>
          <ButtonConfirm onClick={handleConfirmDelete}>
            Confirmer
          </ButtonConfirm>
        </ModalActions>
      </Modal>

      <StatsContainer>
        <StatsGrid>
          <StatCard className="stat-card-total">
            <StatIcon>
              <Clock size={24} />
            </StatIcon>
            <StatContent>
              <StatNumber>{stats.total}</StatNumber>
              <StatLabel>Total des employés</StatLabel>
            </StatContent>
          </StatCard>
          <StatCard className="stat-card-approved">
            <StatIcon>
              <CheckCircle size={24} />
            </StatIcon>
            <StatContent>
              <StatNumber>{stats.actif}</StatNumber>
              <StatLabel>Actifs</StatLabel>
            </StatContent>
          </StatCard>
          <StatCard className="stat-card-cancelled">
            <StatIcon>
              <XCircle size={24} />
            </StatIcon>
            <StatContent>
              <StatNumber>{stats.inactif}</StatNumber>
              <StatLabel>Inactifs</StatLabel>
            </StatContent>
          </StatCard>
          <StatCard className="stat-card-pending">
            <StatIcon>
              <Calendar size={24} />
            </StatIcon>
            <StatContent>
              <StatNumber>{stats.departed}</StatNumber>
              <StatLabel>Départés</StatLabel>
            </StatContent>
          </StatCard>
        </StatsGrid>
      </StatsContainer>

      {!isHidden && (
        <FiltersContainer $isMinimized={isMinimized}>
          <FiltersHeader>
            <FiltersTitle>Filtres de Recherche</FiltersTitle>
            <FiltersControls>
              <FilterControlButton
                $isMinimized
                onClick={toggleMinimize}
                title={isMinimized ? "Développer" : "Réduire"}
              >
                {isMinimized ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </FilterControlButton>
              <FilterControlButton $isClose onClick={toggleHide} title="Fermer">
                <X size={16} />
              </FilterControlButton>
            </FiltersControls>
          </FiltersHeader>

          {!isMinimized && (
            <FiltersSection>
              <form onSubmit={handleFilterSubmit}>
                <FormTableSearch>
                  <tbody>
                    <FormRow>
                      <FormFieldCell>
                        <FormLabelSearch>Nom</FormLabelSearch>
                        <FormInputSearch
                          name="lastName"
                          type="text"
                          value={filters.lastName}
                          onChange={(e) => handleFilterChange("lastName", e.target.value)}
                          placeholder="Recherche par nom"
                        />
                      </FormFieldCell>
                      <FormFieldCell>
                        <FormLabelSearch>Prénom</FormLabelSearch>
                        <FormInputSearch
                          name="firstName"
                          type="text"
                          value={filters.firstName}
                          onChange={(e) => handleFilterChange("firstName", e.target.value)}
                          placeholder="Recherche par prénom"
                        />
                      </FormFieldCell>
                    </FormRow>
                    <FormRow>
                      <FormFieldCell>
                        <FormLabelSearch>Titre du poste</FormLabelSearch>
                        <FormInputSearch
                          name="jobTitle"
                          type="text"
                          value={filters.jobTitle}
                          onChange={(e) => handleFilterChange("jobTitle", e.target.value)}
                          placeholder="Recherche par titre"
                        />
                      </FormFieldCell>
                      <FormFieldCell>
                        <FormLabelSearch>Code employé</FormLabelSearch>
                        <FormInputSearch
                          name="employeeCode"
                          type="text"
                          value={filters.employeeCode}
                          onChange={(e) => handleFilterChange("employeeCode", e.target.value)}
                          placeholder="Recherche par code"
                        />
                      </FormFieldCell>
                    </FormRow>
                    <FormRow>
                      <FormFieldCell>
                        <FormLabelSearch>Site</FormLabelSearch>
                        <StyledAutoCompleteInput
                          value={filters.site}
                          onChange={(value) => {
                            const selectedSite = sites.find((s) => s.siteName === value);
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
                        />
                      </FormFieldCell>
                      <FormFieldCell>
                        <FormLabelSearch>Statut</FormLabelSearch>
                        <FormInputSearch
                          as="select"
                          name="status"
                          value={filters.status}
                          onChange={(e) => handleFilterChange("status", e.target.value)}
                        >
                          <option value="">Tous les statuts</option>
                          <option value="Actif">Actif</option>
                          <option value="Inactif">Inactif</option>
                        </FormInputSearch>
                      </FormFieldCell>
                    </FormRow>
                    <FormRow>
                      <FormFieldCell>
                        <FormLabelSearch>Date de départ min</FormLabelSearch>
                        <FormInputSearch
                          name="departureDateMin"
                          type="date"
                          value={filters.departureDateMin}
                          onChange={(e) => handleFilterChange("departureDateMin", e.target.value)}
                        />
                      </FormFieldCell>
                      <FormFieldCell>
                        <FormLabelSearch>Date de départ max</FormLabelSearch>
                        <FormInputSearch
                          name="departureDateMax"
                          type="date"
                          value={filters.departureDateMax}
                          onChange={(e) => handleFilterChange("departureDateMax", e.target.value)}
                        />
                      </FormFieldCell>
                    </FormRow>
                  </tbody>
                </FormTableSearch>

                <FiltersActions>
                  <ButtonReset type="button" onClick={handleResetFilters}>
                    Réinitialiser
                  </ButtonReset>
                  <ButtonSearch type="submit">Rechercher</ButtonSearch>
                </FiltersActions>
              </form>
            </FiltersSection>
          )}
        </FiltersContainer>
      )}

      {isHidden && (
        <FiltersToggle>
          <ButtonShowFilters type="button" onClick={toggleHide}>
            Afficher les filtres
          </ButtonShowFilters>
        </FiltersToggle>
      )}

      <TableHeader>
        <TableTitle>Liste des Employés</TableTitle>
        <ButtonAdd onClick={() => navigate("/employee/create")}>
          <Plus size={16} style={{ marginRight: "var(--spacing-sm)" }} />
          Nouvel employé
        </ButtonAdd>
      </TableHeader>

      <TableContainer>
        <DataTable>
          <thead>
            <tr>
              <TableHeadCell>Nom</TableHeadCell>
              <TableHeadCell>Prénom</TableHeadCell>
              <TableHeadCell>Titre du poste</TableHeadCell>
              <TableHeadCell>Code employé</TableHeadCell>
              <TableHeadCell>Site</TableHeadCell>
              <TableHeadCell>Statut</TableHeadCell>
              <TableHeadCell>Date d'embauche</TableHeadCell>
              <TableHeadCell>Actions</TableHeadCell>
            </tr>
          </thead>
          <tbody>
            {isLoading.employees ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <Loading>Chargement...</Loading>
                </TableCell>
              </TableRow>
            ) : employees.length > 0 ? (
              employees.map((employee) => (
                <TableRow
                  key={employee.employeeId}
                  $clickable
                  onClick={() => handleRowClick(employee.employeeId)}
                >
                  <TableCell>{employee.lastName || "Non spécifié"}</TableCell>
                  <TableCell>{employee.firstName || "Non spécifié"}</TableCell>
                  <TableCell>{employee.jobTitle || "Non spécifié"}</TableCell>
                  <TableCell>{employee.employeeCode || "Non spécifié"}</TableCell>
                  <TableCell>{employee.site?.siteName || "Non spécifié"}</TableCell>
                  <TableCell>{getStatusBadge(employee.status)}</TableCell>
                  <TableCell>{formatDate(employee.hireDate) || "Non spécifié"}</TableCell>
                  <TableCell>
                    <ActionButtons>
                      <ButtonUpdate
                        onClick={(e) => handleEditEmployee(employee.employeeId, e)}
                      >
                        <Edit2 size={16} />
                      </ButtonUpdate>
                      <ButtonCancel
                        onClick={(e) => handleDeleteClick(employee.employeeId, e)}
                        disabled={employee.status === "Inactif"}
                      >
                        <Trash2 size={16} />
                      </ButtonCancel>
                    </ActionButtons>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8}>
                  <NoDataMessage>Aucune donnée trouvée.</NoDataMessage>
                </TableCell>
              </TableRow>
            )}
          </tbody>
        </DataTable>
      </TableContainer>

      <Pagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalEntries={totalEntries}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        disabled={isLoading.employees}
      />
    </DashboardContainer>
  );
};

export default EmployeeList;
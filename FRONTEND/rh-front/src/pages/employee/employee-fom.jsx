import "styles/generic-form-styles.css";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Alert from "components/alert";
import Modal from "components/modal";
import * as FaIcons from "react-icons/fa";
import AutoCompleteInput from "components/auto-complete-input";
import { createEmployee, updateEmployee, fetchEmployeeById } from "services/employee/employee";
import { fetchUnits } from "services/direction/unit";
import { fetchServices } from "services/direction/service";
import { fetchDepartments } from "services/direction/department";
import { fetchDirections } from "services/direction/direction";
import { fetchWorkingTimeTypes } from "services/employee/working-time-type";
import { fetchContractTypes } from "services/contract/contract-type";
import { fetchGenders } from "services/employee/gender";
import { fetchMaritalStatuses } from "services/employee/marital-status";
import { fetchSites } from "services/site/site";

export default function EmployeeForm() {
  const { employeeId } = useParams();
  const isEditMode = !!employeeId;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    employeeCode: "",
    birthDate: "",
    birthPlace: "",
    childrenCount: 0,
    cinNumber: "",
    cinDate: "",
    cinPlace: "",
    cnapsNumber: "",
    address: "",
    addressComplement: "",
    bankCode: "",
    branchCode: "",
    accountNumber: "",
    ribKey: "",
    hireDate: "",
    jobTitle: "",
    grade: "",
    isExecutive: false,
    contractEndDate: "",
    status: "Actif",
    unit: "",
    service: "",
    department: "",
    direction: "",
    workingTimeType: "",
    contractType: "",
    gender: "",
    maritalStatus: "",
    site: "",
    unitId: "",
    serviceId: "",
    departmentId: "",
    directionId: "",
    workingTimeTypeId: "",
    contractTypeId: "",
    genderId: "",
    maritalStatusId: "",
    siteId: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" });
  const [modal, setModal] = useState({ isOpen: false, type: "info", message: "" });
  const [isLoading, setIsLoading] = useState({
    units: false,
    services: false,
    departments: false,
    directions: false,
    workingTimeTypes: false,
    contractTypes: false,
    genders: false,
    maritalStatuses: false,
    sites: false,
    employee: false,
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [references, setReferences] = useState({
    units: [],
    services: [],
    departments: [],
    directions: [],
    workingTimeTypes: [],
    contractTypes: [],
    genders: [],
    maritalStatuses: [],
    sites: [],
  });
  const [suggestions, setSuggestions] = useState({
    unit: [],
    service: [],
    department: [],
    direction: [],
    workingTimeType: [],
    contractType: [],
    gender: [],
    maritalStatus: [],
    site: [],
  });

  // Fetch employee data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      fetchEmployeeById(
        employeeId,
        (data) => {
          setFormData({
            lastName: data.lastName || "",
            firstName: data.firstName || "",
            employeeCode: data.employeeCode || "",
            birthDate: data.birthDate ? data.birthDate.split("T")[0] : "",
            birthPlace: data.birthPlace || "",
            childrenCount: data.childrenCount || 0,
            cinNumber: data.cinNumber || "",
            cinDate: data.cinDate ? data.cinDate.split("T")[0] : "",
            cinPlace: data.cinPlace || "",
            cnapsNumber: data.cnapsNumber || "",
            address: data.address || "",
            addressComplement: data.addressComplement || "",
            bankCode: data.bankCode || "",
            branchCode: data.branchCode || "",
            accountNumber: data.accountNumber || "",
            ribKey: data.ribKey || "",
            hireDate: data.hireDate ? data.hireDate.split("T")[0] : "",
            jobTitle: data.jobTitle || "",
            grade: data.grade || "",
            isExecutive: data.isExecutive || false,
            contractEndDate: data.contractEndDate ? data.contractEndDate.split("T")[0] : "",
            status: data.status || "Actif",
            unit: data.unit?.unitName || "",
            service: data.service?.serviceName || "",
            department: data.department?.departmentName || "",
            direction: data.direction?.directionName || "",
            workingTimeType: data.workingTimeType?.label || "",
            contractType: data.contractType?.label || "",
            gender: data.gender?.label || "",
            maritalStatus: data.maritalStatus?.label || "",
            site: data.site?.siteName || "",
            unitId: data.unitId || "",
            serviceId: data.serviceId || "",
            departmentId: data.departmentId || "",
            directionId: data.directionId || "",
            workingTimeTypeId: data.workingTimeTypeId || "",
            contractTypeId: data.contractTypeId || "",
            genderId: data.genderId || "",
            maritalStatusId: data.maritalStatusId || "",
            siteId: data.siteId || "",
          });
        },
        setIsLoading,
        (error) => setAlert({ isOpen: true, type: "error", message: error.message })
      );
    }
  }, [employeeId, isEditMode]);

  // Fetch reference data for autocomplete fields
  useEffect(() => {
    const fetchAllReferences = async () => {
      const fetchConfig = [
        { fetchFn: fetchUnits, key: "units", suggestionKey: "unit", mapFn: (item) => `${item.unitName}${item.description ? `/${item.description}` : ''}`, idField: "unitId", nameField: "unitName" },
        { fetchFn: fetchServices, key: "services", suggestionKey: "service", mapFn: (item) => `${item.serviceName}${item.description ? `/${item.description}` : ''}`, idField: "serviceId", nameField: "serviceName" },
        { fetchFn: fetchDepartments, key: "departments", suggestionKey: "department", mapFn: (item) => `${item.departmentName}${item.description ? `/${item.description}` : ''}`, idField: "departmentId", nameField: "departmentName" },
        { fetchFn: fetchDirections, key: "directions", suggestionKey: "direction", mapFn: (item) => `${item.directionName}${item.description ? `/${item.description}` : ''}`, idField: "directionId", nameField: "directionName" },
        { fetchFn: fetchWorkingTimeTypes, key: "workingTimeTypes", suggestionKey: "workingTimeType", mapFn: (item) => item.label, idField: "workingTimeTypeId", nameField: "label" },
        { fetchFn: fetchContractTypes, key: "contractTypes", suggestionKey: "contractType", mapFn: (item) => item.label, idField: "contractTypeId", nameField: "label" },
        { fetchFn: fetchGenders, key: "genders", suggestionKey: "gender", mapFn: (item) => item.label, idField: "genderId", nameField: "label" },
        { fetchFn: fetchMaritalStatuses, key: "maritalStatuses", suggestionKey: "maritalStatus", mapFn: (item) => item.label, idField: "maritalStatusId", nameField: "label" },
        { fetchFn: fetchSites, key: "sites", suggestionKey: "site", mapFn: (item) => `${item.siteName}${item.location ? `/${item.location}` : ''}`, idField: "siteId", nameField: "siteName" },
      ];

      for (const config of fetchConfig) {
        await config.fetchFn(
          (data) => {
            setReferences((prev) => ({ ...prev, [config.key]: data }));
            setSuggestions((prev) => ({
              ...prev,
              [config.suggestionKey]: data.map(config.mapFn),
            }));
          },
          setIsLoading,
          (alert) => setAlert(alert)
        );
      }
    };

    fetchAllReferences();
  }, []);

  // Update suggestions for cascading dropdowns
  useEffect(() => {
    const updateCascadingSuggestions = () => {
      // Filter departments based on selected direction
      const selectedDirection = references.directions.find((dir) => dir.directionName === formData.direction);
      const filteredDepartments = selectedDirection
        ? references.departments.filter((dep) => dep.directionId === selectedDirection.directionId)
        : references.departments;
      setSuggestions((prev) => ({
        ...prev,
        department: filteredDepartments.map((item) => `${item.departmentName}${item.description ? `/${item.description}` : ''}`),
      }));

      // Filter services based on selected department
      const selectedDepartment = filteredDepartments.find((dep) => dep.departmentName === formData.department);
      const filteredServices = selectedDepartment
        ? references.services.filter((serv) => serv.departmentId === selectedDepartment.departmentId)
        : references.services;
      setSuggestions((prev) => ({
        ...prev,
        service: filteredServices.map((item) => `${item.serviceName}${item.description ? `/${item.description}` : ''}`),
      }));

      // Filter units based on selected service
      const selectedService = filteredServices.find((serv) => serv.serviceName === formData.service);
      const filteredUnits = selectedService
        ? references.units.filter((unit) => unit.serviceId === selectedService.serviceId)
        : references.units;
      setSuggestions((prev) => ({
        ...prev,
        unit: filteredUnits.map((item) => `${item.unitName}${item.description ? `/${item.description}` : ''}`),
      }));
    };

    updateCascadingSuggestions();
  }, [formData.direction, formData.department, formData.service, references]);

  const showAlert = (type, message) => {
    setAlert({ isOpen: true, type, message });
  };

  // Handle adding new suggestions for autocomplete fields
  const handleAddNewSuggestion = (field, value) => {
    const config = {
      unit: { key: "units", idField: "unitId", nameField: "unitName", suggestionKey: "unit" },
      service: { key: "services", idField: "serviceId", nameField: "serviceName", suggestionKey: "service" },
      department: { key: "departments", idField: "departmentId", nameField: "departmentName", suggestionKey: "department" },
      direction: { key: "directions", idField: "directionId", nameField: "directionName", suggestionKey: "direction" },
      workingTimeType: { key: "workingTimeTypes", idField: "workingTimeTypeId", nameField: "label", suggestionKey: "workingTimeType" },
      contractType: { key: "contractTypes", idField: "contractTypeId", nameField: "label", suggestionKey: "contractType" },
      gender: { key: "genders", idField: "genderId", nameField: "label", suggestionKey: "gender" },
      maritalStatus: { key: "maritalStatuses", idField: "maritalStatusId", nameField: "label", suggestionKey: "maritalStatus" },
      site: { key: "sites", idField: "siteId", nameField: "siteName", suggestionKey: "site" },
    }[field];

    const newItem = { [config.nameField]: value, [config.idField]: `temp-${Date.now()}` };
    setReferences((prev) => ({
      ...prev,
      [config.key]: [...prev[config.key], newItem],
    }));
    setSuggestions((prev) => ({
      ...prev,
      [config.suggestionKey]: [...prev[config.suggestionKey], value],
    }));
    setFormData((prev) => ({ ...prev, [field]: value, [config.idField]: newItem[config.idField] }));
    setFieldErrors((prev) => ({ ...prev, [config.idField]: undefined }));
    showAlert("success", `"${value}" ajouté aux suggestions pour ${field}`);
  };

  // Handle input changes for text, number, date, and checkbox fields
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      // Reset dependent fields when a parent field changes
      ...(name === "direction" ? { department: "", service: "", unit: "", departmentId: "", serviceId: "", unitId: "" } : {}),
      ...(name === "department" ? { service: "", unit: "", serviceId: "", unitId: "" } : {}),
      ...(name === "service" ? { unit: "", unitId: "" } : {}),
    }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  // Handle autocomplete field changes
  const handleAutoCompleteChange = (field, value) => {
    const config = {
      unit: { key: "units", idField: "unitId", nameField: "unitName" },
      service: { key: "services", idField: "serviceId", nameField: "serviceName" },
      department: { key: "departments", idField: "departmentId", nameField: "departmentName" },
      direction: { key: "directions", idField: "directionId", nameField: "directionName" },
      workingTimeType: { key: "workingTimeTypes", idField: "workingTimeTypeId", nameField: "label" },
      contractType: { key: "contractTypes", idField: "contractTypeId", nameField: "label" },
      gender: { key: "genders", idField: "genderId", nameField: "label" },
      maritalStatus: { key: "maritalStatuses", idField: "maritalStatusId", nameField: "label" },
      site: { key: "sites", idField: "siteId", nameField: "siteName" },
    }[field];

    const realValue = value.includes('/') ? value.split('/')[0] : value;
    const selectedItem = references[config.key].find((item) => item[config.nameField] === realValue);
    setFormData((prev) => ({
      ...prev,
      [field]: realValue,
      [config.idField]: selectedItem ? selectedItem[config.idField] : "",
      // Reset dependent fields
      ...(field === "direction" ? { department: "", service: "", unit: "", departmentId: "", serviceId: "", unitId: "" } : {}),
      ...(field === "department" ? { service: "", unit: "", serviceId: "", unitId: "" } : {}),
      ...(field === "service" ? { unit: "", unitId: "" } : {}),
    }));
    setFieldErrors((prev) => ({ ...prev, [config.idField]: undefined }));
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});

    try {
      const employeeData = {
        lastName: formData.lastName,
        firstName: formData.firstName,
        employeeCode: formData.employeeCode,
        birthDate: formData.birthDate || null,
        birthPlace: formData.birthPlace,
        childrenCount: parseInt(formData.childrenCount) || 0,
        cinNumber: formData.cinNumber,
        cinDate: formData.cinDate || null,
        cinPlace: formData.cinPlace,
        cnapsNumber: formData.cnapsNumber,
        address: formData.address,
        addressComplement: formData.addressComplement,
        bankCode: formData.bankCode,
        branchCode: formData.branchCode,
        accountNumber: formData.accountNumber,
        ribKey: formData.ribKey,
        hireDate: formData.hireDate || null,
        jobTitle: formData.jobTitle,
        grade: formData.grade,
        isExecutive: formData.isExecutive,
        contractEndDate: formData.contractEndDate || null,
        status: formData.status,
        unitId: formData.unitId,
        serviceId: formData.serviceId,
        departmentId: formData.departmentId,
        directionId: formData.directionId,
        workingTimeTypeId: formData.workingTimeTypeId,
        contractTypeId: formData.contractTypeId,
        genderId: formData.genderId,
        maritalStatusId: formData.maritalStatusId,
        siteId: formData.siteId,
      };

      if (isEditMode) {
        await updateEmployee(
          employeeId,
          employeeData,
          setIsLoading,
          (success) => {
            setAlert(success);
            navigate("/employee/list");
          },
          (error) => {
            setModal({ isOpen: true, type: "error", message: error.message });
            setFieldErrors(error.fieldErrors || {});
          }
        );
      } else {
        await createEmployee(
          employeeData,
          setIsLoading,
          (success) => {
            setAlert(success);
            navigate("/employee/list");
          },
          (error) => {
            setModal({ isOpen: true, type: "error", message: error.message });
            setFieldErrors(error.fieldErrors || {});
          }
        );
      }
    } catch (error) {
      console.error("Erreur dans handleSubmit :", error);
      setModal({ isOpen: true, type: "error", message: "Une erreur inattendue s'est produite." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form to initial state
  const handleReset = () => {
    setFormData({
      lastName: "",
      firstName: "",
      employeeCode: "",
      birthDate: "",
      birthPlace: "",
      childrenCount: 0,
      cinNumber: "",
      cinDate: "",
      cinPlace: "",
      cnapsNumber: "",
      address: "",
      addressComplement: "",
      bankCode: "",
      branchCode: "",
      accountNumber: "",
      ribKey: "",
      hireDate: "",
      jobTitle: "",
      grade: "",
      isExecutive: false,
      contractEndDate: "",
      status: "Actif",
      unit: "",
      service: "",
      department: "",
      direction: "",
      workingTimeType: "",
      contractType: "",
      gender: "",
      maritalStatus: "",
      site: "",
      unitId: "",
      serviceId: "",
      departmentId: "",
      directionId: "",
      workingTimeTypeId: "",
      contractTypeId: "",
      genderId: "",
      maritalStatusId: "",
      siteId: "",
    });
    setFieldErrors({});
    showAlert("info", "Formulaire réinitialisé.");
  };

  const isAnyLoading = Object.values(isLoading).some((loading) => loading);

  return (
    <div className="form-container">
      <Modal
        type={modal.type}
        message={modal.message}
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
      />
      <Alert
        type={alert.type}
        message={alert.message}
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
      />
      <div className="table-header">
        <h2 className="table-title">{isEditMode ? "Modification d'un Employé" : "Création d'un Employé"}</h2>
      </div>

      <form id="employeeForm" className="generic-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <table className="form-table">
            <tbody>
              <tr>
                <th className="form-label-cell">
                  <label htmlFor="lastName" className="form-label form-label-required">
                    Nom
                  </label>
                </th>
                <td className="form-input-cell">
                  <input
                    id="lastName"
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Saisir le nom..."
                    className={`form-input ${fieldErrors.LastName ? "error" : ""}`}
                    disabled={isSubmitting || isAnyLoading}
                  />
                  {fieldErrors.LastName && (
                    <span className="error-message">{fieldErrors.LastName.join(", ")}</span>
                  )}
                </td>
                <th className="form-label-cell">
                  <label htmlFor="firstName" className="form-label form-label-required">
                    Prénom
                  </label>
                </th>
                <td className="form-input-cell">
                  <input
                    id="firstName"
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Saisir le prénom..."
                    className={`form-input ${fieldErrors.FirstName ? "error" : ""}`}
                    disabled={isSubmitting || isAnyLoading}
                  />
                  {fieldErrors.FirstName && (
                    <span className="error-message">{fieldErrors.FirstName.join(", ")}</span>
                  )}
                </td>
                <th className="form-label-cell">
                  <label htmlFor="employeeCode" className="form-label">
                    Code Employé
                  </label>
                </th>
                <td className="form-input-cell">
                  <input
                    id="employeeCode"
                    type="text"
                    name="employeeCode"
                    value={formData.employeeCode}
                    onChange={handleInputChange}
                    placeholder="Saisir le code employé..."
                    className={`form-input ${fieldErrors.EmployeeCode ? "error" : ""}`}
                    disabled={isSubmitting || isAnyLoading}
                  />
                  {fieldErrors.EmployeeCode && (
                    <span className="error-message">{fieldErrors.EmployeeCode.join(", ")}</span>
                  )}
                </td>
              </tr>
              <tr>
                <th className="form-label-cell">
                  <label htmlFor="birthDate" className="form-label">
                    Date de Naissance
                  </label>
                </th>
                <td className="form-input-cell">
                  <input
                    id="birthDate"
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    className={`form-input ${fieldErrors.BirthDate ? "error" : ""}`}
                    disabled={isSubmitting || isAnyLoading}
                  />
                  {fieldErrors.BirthDate && (
                    <span className="error-message">{fieldErrors.BirthDate.join(", ")}</span>
                  )}
                </td>
                <th className="form-label-cell">
                  <label htmlFor="birthPlace" className="form-label">
                    Lieu de Naissance
                  </label>
                </th>
                <td className="form-input-cell">
                  <input
                    id="birthPlace"
                    type="text"
                    name="birthPlace"
                    value={formData.birthPlace}
                    onChange={handleInputChange}
                    placeholder="Saisir le lieu de naissance..."
                    className={`form-input ${fieldErrors.BirthPlace ? "error" : ""}`}
                    disabled={isSubmitting || isAnyLoading}
                  />
                  {fieldErrors.BirthPlace && (
                    <span className="error-message">{fieldErrors.BirthPlace.join(", ")}</span>
                  )}
                </td>
                <th className="form-label-cell">
                  <label htmlFor="childrenCount" className="form-label">
                    Nombre d'Enfants
                  </label>
                </th>
                <td className="form-input-cell">
                  <input
                    id="childrenCount"
                    type="number"
                    name="childrenCount"
                    value={formData.childrenCount}
                    onChange={handleInputChange}
                    placeholder="Saisir le nombre d'enfants..."
                    className={`form-input ${fieldErrors.ChildrenCount ? "error" : ""}`}
                    disabled={isSubmitting || isAnyLoading}
                    min="0"
                  />
                  {fieldErrors.ChildrenCount && (
                    <span className="error-message">{fieldErrors.ChildrenCount.join(", ")}</span>
                  )}
                </td>
              </tr>
              <tr>
                <th className="form-label-cell">
                  <label htmlFor="cinNumber" className="form-label">
                    Numéro CIN
                  </label>
                </th>
                <td className="form-input-cell">
                  <input
                    id="cinNumber"
                    type="text"
                    name="cinNumber"
                    value={formData.cinNumber}
                    onChange={handleInputChange}
                    placeholder="Saisir le numéro CIN..."
                    className={`form-input ${fieldErrors.CINNumber ? "error" : ""}`}
                    disabled={isSubmitting || isAnyLoading}
                  />
                  {fieldErrors.CINNumber && (
                    <span className="error-message">{fieldErrors.CINNumber.join(", ")}</span>
                  )}
                </td>
                <th className="form-label-cell">
                  <label htmlFor="cinDate" className="form-label">
                    Date CIN
                  </label>
                </th>
                <td className="form-input-cell">
                  <input
                    id="cinDate"
                    type="date"
                    name="cinDate"
                    value={formData.cinDate}
                    onChange={handleInputChange}
                    className={`form-input ${fieldErrors.CINDate ? "error" : ""}`}
                    disabled={isSubmitting || isAnyLoading}
                  />
                  {fieldErrors.CINDate && (
                    <span className="error-message">{fieldErrors.CINDate.join(", ")}</span>
                  )}
                </td>
                <th className="form-label-cell">
                  <label htmlFor="cinPlace" className="form-label">
                    Lieu CIN
                  </label>
                </th>
                <td className="form-input-cell">
                  <input
                    id="cinPlace"
                    type="text"
                    name="cinPlace"
                    value={formData.cinPlace}
                    onChange={handleInputChange}
                    placeholder="Saisir le lieu CIN..."
                    className={`form-input ${fieldErrors.CINPlace ? "error" : ""}`}
                    disabled={isSubmitting || isAnyLoading}
                  />
                  {fieldErrors.CINPlace && (
                    <span className="error-message">{fieldErrors.CINPlace.join(", ")}</span>
                  )}
                </td>
              </tr>
              <tr>
                <th className="form-label-cell">
                  <label htmlFor="cnapsNumber" className="form-label">
                    Numéro CNAPS
                  </label>
                </th>
                <td className="form-input-cell">
                  <input
                    id="cnapsNumber"
                    type="text"
                    name="cnapsNumber"
                    value={formData.cnapsNumber}
                    onChange={handleInputChange}
                    placeholder="Saisir le numéro CNAPS..."
                    className={`form-input ${fieldErrors.CNAPSNumber ? "error" : ""}`}
                    disabled={isSubmitting || isAnyLoading}
                  />
                  {fieldErrors.CNAPSNumber && (
                    <span className="error-message">{fieldErrors.CNAPSNumber.join(", ")}</span>
                  )}
                </td>
                <th className="form-label-cell">
                  <label htmlFor="address" className="form-label">
                    Adresse
                  </label>
                </th>
                <td className="form-input-cell">
                  <input
                    id="address"
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Saisir l'adresse..."
                    className={`form-input ${fieldErrors.Address ? "error" : ""}`}
                    disabled={isSubmitting || isAnyLoading}
                  />
                  {fieldErrors.Address && (
                    <span className="error-message">{fieldErrors.Address.join(", ")}</span>
                  )}
                </td>
                <th className="form-label-cell">
                  <label htmlFor="addressComplement" className="form-label">
                    Complément d'Adresse
                  </label>
                </th>
                <td className="form-input-cell">
                  <input
                    id="addressComplement"
                    type="text"
                    name="addressComplement"
                    value={formData.addressComplement}
                    onChange={handleInputChange}
                    placeholder="Saisir le complément d'adresse..."
                    className={`form-input ${fieldErrors.AddressComplement ? "error" : ""}`}
                    disabled={isSubmitting || isAnyLoading}
                  />
                  {fieldErrors.AddressComplement && (
                    <span className="error-message">{fieldErrors.AddressComplement.join(", ")}</span>
                  )}
                </td>
              </tr>
              <tr>
                <th className="form-label-cell">
                  <label htmlFor="bankCode" className="form-label">
                    Code Banque
                  </label>
                </th>
                <td className="form-input-cell">
                  <input
                    id="bankCode"
                    type="text"
                    name="bankCode"
                    value={formData.bankCode}
                    onChange={handleInputChange}
                    placeholder="Saisir le code banque..."
                    className={`form-input ${fieldErrors.BankCode ? "error" : ""}`}
                    disabled={isSubmitting || isAnyLoading}
                  />
                  {fieldErrors.BankCode && (
                    <span className="error-message">{fieldErrors.BankCode.join(", ")}</span>
                  )}
                </td>
                <th className="form-label-cell">
                  <label htmlFor="branchCode" className="form-label">
                    Code Agence
                  </label>
                </th>
                <td className="form-input-cell">
                  <input
                    id="branchCode"
                    type="text"
                    name="branchCode"
                    value={formData.branchCode}
                    onChange={handleInputChange}
                    placeholder="Saisir le code agence..."
                    className={`form-input ${fieldErrors.BranchCode ? "error" : ""}`}
                    disabled={isSubmitting || isAnyLoading}
                  />
                  {fieldErrors.BranchCode && (
                    <span className="error-message">{fieldErrors.BranchCode.join(", ")}</span>
                  )}
                </td>
                <th className="form-label-cell">
                  <label htmlFor="accountNumber" className="form-label">
                    Numéro de Compte
                  </label>
                </th>
                <td className="form-input-cell">
                  <input
                    id="accountNumber"
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleInputChange}
                    placeholder="Saisir le numéro de compte..."
                    className={`form-input ${fieldErrors.AccountNumber ? "error" : ""}`}
                    disabled={isSubmitting || isAnyLoading}
                  />
                  {fieldErrors.AccountNumber && (
                    <span className="error-message">{fieldErrors.AccountNumber.join(", ")}</span>
                  )}
                </td>
              </tr>
              <tr>
                <th className="form-label-cell">
                  <label htmlFor="ribKey" className="form-label">
                    Clé RIB
                  </label>
                </th>
                <td className="form-input-cell">
                  <input
                    id="ribKey"
                    type="text"
                    name="ribKey"
                    value={formData.ribKey}
                    onChange={handleInputChange}
                    placeholder="Saisir la clé RIB..."
                    className={`form-input ${fieldErrors.RibKey ? "error" : ""}`}
                    disabled={isSubmitting || isAnyLoading}
                  />
                  {fieldErrors.RibKey && (
                    <span className="error-message">{fieldErrors.RibKey.join(", ")}</span>
                  )}
                </td>
                <th className="form-label-cell">
                  <label htmlFor="hireDate" className="form-label form-label-required">
                    Date d'Embauche
                  </label>
                </th>
                <td className="form-input-cell">
                  <input
                    id="hireDate"
                    type="date"
                    name="hireDate"
                    value={formData.hireDate}
                    onChange={handleInputChange}
                    className={`form-input ${fieldErrors.HireDate ? "error" : ""}`}
                    disabled={isSubmitting || isAnyLoading}
                  />
                  {fieldErrors.HireDate && (
                    <span className="error-message">{fieldErrors.HireDate.join(", ")}</span>
                  )}
                </td>
                <th className="form-label-cell">
                  <label htmlFor="jobTitle" className="form-label">
                    Poste
                  </label>
                </th>
                <td className="form-input-cell">
                  <input
                    id="jobTitle"
                    type="text"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    placeholder="Saisir le poste..."
                    className={`form-input ${fieldErrors.JobTitle ? "error" : ""}`}
                    disabled={isSubmitting || isAnyLoading}
                  />
                  {fieldErrors.JobTitle && (
                    <span className="error-message">{fieldErrors.JobTitle.join(", ")}</span>
                  )}
                </td>
              </tr>
              <tr>
                <th className="form-label-cell">
                  <label htmlFor="grade" className="form-label">
                    Grade
                  </label>
                </th>
                <td className="form-input-cell">
                  <input
                    id="grade"
                    type="text"
                    name="grade"
                    value={formData.grade}
                    onChange={handleInputChange}
                    placeholder="Saisir le grade..."
                    className={`form-input ${fieldErrors.Grade ? "error" : ""}`}
                    disabled={isSubmitting || isAnyLoading}
                  />
                  {fieldErrors.Grade && (
                    <span className="error-message">{fieldErrors.Grade.join(", ")}</span>
                  )}
                </td>
                <th className="form-label-cell">
                  <label htmlFor="isExecutive" className="form-label">
                    Cadre
                  </label>
                </th>
                <td className="form-input-cell">
                  <input
                    id="isExecutive"
                    type="checkbox"
                    name="isExecutive"
                    checked={formData.isExecutive}
                    onChange={handleInputChange}
                    className="form-checkbox"
                    disabled={isSubmitting || isAnyLoading}
                  />
                </td>
                <th className="form-label-cell">
                  <label htmlFor="contractEndDate" className="form-label">
                    Date de Fin de Contrat
                  </label>
                </th>
                <td className="form-input-cell">
                  <input
                    id="contractEndDate"
                    type="date"
                    name="contractEndDate"
                    value={formData.contractEndDate}
                    onChange={handleInputChange}
                    className={`form-input ${fieldErrors.ContractEndDate ? "error" : ""}`}
                    disabled={isSubmitting || isAnyLoading}
                  />
                  {fieldErrors.ContractEndDate && (
                    <span className="error-message">{fieldErrors.ContractEndDate.join(", ")}</span>
                  )}
                </td>
              </tr>
              <tr>
                <th className="form-label-cell">
                  <label htmlFor="status" className="form-label">
                    Statut
                  </label>
                </th>
                <td className="form-input-cell">
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className={`form-input ${fieldErrors.Status ? "error" : ""}`}
                    disabled={isSubmitting || isAnyLoading}
                  >
                    <option value="Actif">Actif</option>
                    <option value="Inactif">Inactif</option>
                    <option value="Départ">Départ</option>
                  </select>
                  {fieldErrors.Status && (
                    <span className="error-message">{fieldErrors.Status.join(", ")}</span>
                  )}
                </td>
                <th className="form-label-cell">
                  <label htmlFor="direction" className="form-label form-label-required">
                    Direction
                  </label>
                </th>
                <td className="form-input-cell">
                  <AutoCompleteInput
                    value={formData.direction}
                    onChange={(value) => handleAutoCompleteChange("direction", value)}
                    suggestions={suggestions.direction}
                    maxVisibleItems={3}
                    placeholder="Saisir ou sélectionner une direction..."
                    disabled={isSubmitting || isAnyLoading}
                    onAddNew={(value) => handleAddNewSuggestion("direction", value)}
                    showAddOption={true}
                    fieldType="direction"
                    fieldLabel="direction"
                    addNewRoute="/direction/create"
                    className={`form-input ${fieldErrors.DirectionId ? "error" : ""}`}
                  />
                  {fieldErrors.DirectionId && (
                    <span className="error-message">{fieldErrors.DirectionId.join(", ")}</span>
                  )}
                </td>
                <th className="form-label-cell">
                  <label htmlFor="department" className="form-label">
                    Département
                  </label>
                </th>
                <td className="form-input-cell">
                  <AutoCompleteInput
                    value={formData.department}
                    onChange={(value) => handleAutoCompleteChange("department", value)}
                    suggestions={suggestions.department}
                    maxVisibleItems={3}
                    placeholder="Saisir ou sélectionner un département..."
                    disabled={isSubmitting || isAnyLoading || !formData.direction}
                    onAddNew={(value) => handleAddNewSuggestion("department", value)}
                    showAddOption={true}
                    fieldType="department"
                    fieldLabel="département"
                    addNewRoute="/department/create"
                    className={`form-input ${fieldErrors.DepartmentId ? "error" : ""}`}
                  />
                  {fieldErrors.DepartmentId && (
                    <span className="error-message">{fieldErrors.DepartmentId.join(", ")}</span>
                  )}
                </td>
              </tr>
              <tr>
                <th className="form-label-cell">
                  <label htmlFor="service" className="form-label">
                    Service
                  </label>
                </th>
                <td className="form-input-cell">
                  <AutoCompleteInput
                    value={formData.service}
                    onChange={(value) => handleAutoCompleteChange("service", value)}
                    suggestions={suggestions.service}
                    maxVisibleItems={3}
                    placeholder="Saisir ou sélectionner un service..."
                    disabled={isSubmitting || isAnyLoading || !formData.department}
                    onAddNew={(value) => handleAddNewSuggestion("service", value)}
                    showAddOption={true}
                    fieldType="service"
                    fieldLabel="service"
                    addNewRoute="/service/create"
                    className={`form-input ${fieldErrors.ServiceId ? "error" : ""}`}
                  />
                  {fieldErrors.ServiceId && (
                    <span className="error-message">{fieldErrors.ServiceId.join(", ")}</span>
                  )}
                </td>
                <th className="form-label-cell">
                  <label htmlFor="unit" className="form-label">
                    Unité
                  </label>
                </th>
                <td className="form-input-cell">
                  <AutoCompleteInput
                    value={formData.unit}
                    onChange={(value) => handleAutoCompleteChange("unit", value)}
                    suggestions={suggestions.unit}
                    maxVisibleItems={3}
                    placeholder="Saisir ou sélectionner une unité..."
                    disabled={isSubmitting || isAnyLoading || !formData.service}
                    onAddNew={(value) => handleAddNewSuggestion("unit", value)}
                    showAddOption={true}
                    fieldType="unit"
                    fieldLabel="unité"
                    addNewRoute="/unit/create"
                    className={`form-input ${fieldErrors.UnitId ? "error" : ""}`}
                  />
                  {fieldErrors.UnitId && (
                    <span className="error-message">{fieldErrors.UnitId.join(", ")}</span>
                  )}
                </td>
                <th className="form-label-cell">
                  <label htmlFor="workingTimeType" className="form-label form-label-required">
                    Type de Temps de Travail
                  </label>
                </th>
                <td className="form-input-cell">
                  <AutoCompleteInput
                    value={formData.workingTimeType}
                    onChange={(value) => handleAutoCompleteChange("workingTimeType", value)}
                    suggestions={suggestions.workingTimeType}
                    maxVisibleItems={3}
                    placeholder="Saisir ou sélectionner un type de temps de travail..."
                    disabled={isSubmitting || isAnyLoading}
                    onAddNew={(value) => handleAddNewSuggestion("workingTimeType", value)}
                    showAddOption={true}
                    fieldType="workingTimeType"
                    fieldLabel="type de temps de travail"
                    addNewRoute="/workingTimeType/create"
                    className={`form-input ${fieldErrors.WorkingTimeTypeId ? "error" : ""}`}
                  />
                  {fieldErrors.WorkingTimeTypeId && (
                    <span className="error-message">{fieldErrors.WorkingTimeTypeId.join(", ")}</span>
                  )}
                </td>
              </tr>
              <tr>
                <th className="form-label-cell">
                  <label htmlFor="contractType" className="form-label form-label-required">
                    Type de Contrat
                  </label>
                </th>
                <td className="form-input-cell">
                  <AutoCompleteInput
                    value={formData.contractType}
                    onChange={(value) => handleAutoCompleteChange("contractType", value)}
                    suggestions={suggestions.contractType}
                    maxVisibleItems={3}
                    placeholder="Saisir ou sélectionner un type de contrat..."
                    disabled={isSubmitting || isAnyLoading}
                    onAddNew={(value) => handleAddNewSuggestion("contractType", value)}
                    showAddOption={true}
                    fieldType="contractType"
                    fieldLabel="type de contrat"
                    addNewRoute="/contractType/create"
                    className={`form-input ${fieldErrors.ContractTypeId ? "error" : ""}`}
                  />
                  {fieldErrors.ContractTypeId && (
                    <span className="error-message">{fieldErrors.ContractTypeId.join(", ")}</span>
                  )}
                </td>
                <th className="form-label-cell">
                  <label htmlFor="gender" className="form-label form-label-required">
                    Genre
                  </label>
                </th>
                <td className="form-input-cell">
                  <AutoCompleteInput
                    value={formData.gender}
                    onChange={(value) => handleAutoCompleteChange("gender", value)}
                    suggestions={suggestions.gender}
                    maxVisibleItems={3}
                    placeholder="Saisir ou sélectionner un genre..."
                    disabled={isSubmitting || isAnyLoading}
                    onAddNew={(value) => handleAddNewSuggestion("gender", value)}
                    showAddOption={true}
                    fieldType="gender"
                    fieldLabel="genre"
                    addNewRoute="/gender/create"
                    className={`form-input ${fieldErrors.GenderId ? "error" : ""}`}
                  />
                  {fieldErrors.GenderId && (
                    <span className="error-message">{fieldErrors.GenderId.join(", ")}</span>
                  )}
                </td>
                <th className="form-label-cell">
                  <label htmlFor="maritalStatus" className="form-label form-label-required">
                    Statut Marital
                  </label>
                </th>
                <td className="form-input-cell">
                  <AutoCompleteInput
                    value={formData.maritalStatus}
                    onChange={(value) => handleAutoCompleteChange("maritalStatus", value)}
                    suggestions={suggestions.maritalStatus}
                    maxVisibleItems={3}
                    placeholder="Saisir ou sélectionner un statut marital..."
                    disabled={isSubmitting || isAnyLoading}
                    onAddNew={(value) => handleAddNewSuggestion("maritalStatus", value)}
                    showAddOption={true}
                    fieldType="maritalStatus"
                    fieldLabel="statut marital"
                    addNewRoute="/maritalStatus/create"
                    className={`form-input ${fieldErrors.MaritalStatusId ? "error" : ""}`}
                  />
                  {fieldErrors.MaritalStatusId && (
                    <span className="error-message">{fieldErrors.MaritalStatusId.join(", ")}</span>
                  )}
                </td>
              </tr>
              <tr>
                <th className="form-label-cell">
                  <label htmlFor="site" className="form-label form-label-required">
                    Site
                  </label>
                </th>
                <td className="form-input-cell">
                  <AutoCompleteInput
                    value={formData.site}
                    onChange={(value) => handleAutoCompleteChange("site", value)}
                    suggestions={suggestions.site}
                    maxVisibleItems={3}
                    placeholder="Saisir ou sélectionner un site..."
                    disabled={isSubmitting || isAnyLoading}
                    onAddNew={(value) => handleAddNewSuggestion("site", value)}
                    showAddOption={true}
                    fieldType="site"
                    fieldLabel="site"
                    addNewRoute="/site/create"
                    className={`form-input ${fieldErrors.SiteId ? "error" : ""}`}
                  />
                  {fieldErrors.SiteId && (
                    <span className="error-message">{fieldErrors.SiteId.join(", ")}</span>
                  )}
                </td>
                <th className="form-label-cell"></th>
                <td className="form-input-cell"></td>
                <th className="form-label-cell"></th>
                <td className="form-input-cell"></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting || isAnyLoading}
            title={isEditMode ? "Mettre à jour l'employé" : "Enregistrer l'employé"}
          >
            {isSubmitting ? "Envoi en cours..." : isEditMode ? "Mettre à jour" : "Enregistrer"}
            <FaIcons.FaArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="reset-btn"
            onClick={handleReset}
            disabled={isSubmitting || isAnyLoading}
            title="Réinitialiser le formulaire"
          >
            <FaIcons.FaTrash className="w-4 h-4" />
            Réinitialiser
          </button>
        </div>
      </form>
    </div>
  );
}
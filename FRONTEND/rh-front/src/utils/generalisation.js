import { BASE_URL } from "../config/apiConfig";

// Generic fetch function
export const fetchData = async (
  endpoint,
  setData,
  setIsLoading,
  setSuggestions,
  loadingKey,
  suggestionKey,
  mapField,
  alertMessage,
  showAlert
) => {
  try {
    setIsLoading((prev) => ({ ...prev, [loadingKey]: true }));
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "GET",
      headers: { accept: "application/json" },
    });
    if (response.ok) {
      const data = await response.json();
      setData(data);
      if (suggestionKey && mapField) {
        setSuggestions((prev) => ({
          ...prev,
          [suggestionKey]: data.map(mapField),
        }));
      }
    } else {
      showAlert("warning", `Impossible de charger ${alertMessage}.`);
      if (suggestionKey) {
        setSuggestions((prev) => ({ ...prev, [suggestionKey]: [] }));
      }
    }
  } catch (error) {
    console.error(`Erreur lors du chargement de ${alertMessage}:`, error);
    showAlert("warning", `Erreur de connexion pour ${alertMessage}.`);
    if (suggestionKey) {
      setSuggestions((prev) => ({ ...prev, [suggestionKey]: [] }));
    }
  } finally {
    setIsLoading((prev) => ({ ...prev, [loadingKey]: false }));
  }
};

// Helper functions to map names to IDs
export const getContractTypeId = (label, contractTypes) => {
  const contractType = contractTypes.find((ct) => ct.code === label);
  return contractType ? contractType.contractTypeId : null;
};

export const getSiteId = (siteName, sites) => {
  const site = sites.find((s) => s.siteName === siteName);
  return site ? site.siteId : null;
};

export const getRecruitmentReasonId = (reasonName, recruitmentReasons) => {
  const reason = recruitmentReasons.find((r) => r.name === reasonName);
  return reason ? reason.recruitmentReasonId : null;
};

export const getReplacementReasonId = (reasonName, replacementReasons) => {
  const reason = replacementReasons.find((r) => r.name === reasonName);
  return reason ? reason.replacementReasonId : null;
};

export const getDirectionId = (directionName, directions) => {
  const direction = directions.find((d) => d.directionName === directionName);
  return direction ? direction.directionId : null;
};

export const getDepartmentId = (departmentName, departments) => {
  const department = departments.find((d) => d.departmentName === departmentName);
  return department ? department.departmentId : null;
};

export const getServiceId = (serviceName, services) => {
  const service = services.find((s) => s.serviceName === serviceName);
  return service ? service.serviceId : null;
};

export const getSupervisorId = (supervisorName, employees) => {
  const employee = employees.find((e) => `${e.firstName} ${e.lastName}` === supervisorName);
  return employee ? employee.employeeId : null;
};

// Alert handling
export const showAlert = (setAlert, type, message) => {
  setAlert({ isOpen: true, type, message });
};

// Handle adding new suggestions
export const handleAddNewSuggestion = (setSuggestions, showAlert, field, value) => {
  setSuggestions((prev) => ({
    ...prev,
    [field]: [...prev[field], value],
  }));
  showAlert("success", `"${value}" ajouté aux suggestions`);
};

// Format date function
export const formatDate = (dateInput) => {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};
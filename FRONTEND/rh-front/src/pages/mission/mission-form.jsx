import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "components/alert";
import Modal from "components/modal";
import * as FaIcons from "react-icons/fa";
import NewMissionForm from "./new-mission";
import ExistingMissionForm from "./existing-mission";
import BeneficiaryPopup from "./benificiary-mission";
import { fetchAllRegions } from "services/lieu/lieu";
import { createMission, fetchAllMissions, createMissionAssignation } from "services/mission/mission";
import { fetchAllTransports } from "services/transport/transport";
import { fetchEmployees } from "services/employee/employee";
import "styles/generic-form-styles.css";
import "styles/mission/beneficiary-details-popup.css"

const MissionForm = () => {
  const [formData, setFormData] = useState({
    missionTitle: "",
    description: "",
    location: "",
    startDate: null,
    endDate: null,
    missionId: "",
    beneficiaries: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" });
  const [modal, setModal] = useState({ isOpen: false, type: "info", message: "" });
  const [regions, setRegions] = useState([]);
  const [regionNames, setRegionNames] = useState([]);
  const [regionDisplayNames, setRegionDisplayNames] = useState([]);
  const [missions, setMissions] = useState([]);
  const [suggestions, setSuggestions] = useState({
    beneficiary: [],
    transport: [],
    mission: [],
  });
  const [isLoading, setIsLoading] = useState({
    regions: false,
    employees: true,
    transports: true,
    missions: true,
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [missionMode, setMissionMode] = useState("new");
  const [editingBeneficiary, setEditingBeneficiary] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [newBeneficiary, setNewBeneficiary] = useState({
    beneficiary: "",
    employeeId: "",
    matricule: "",
    function: "",
    base: "",
    direction: "",
    department: "",
    service: "",
    costCenter: "",
    transport: "",
    transportId: null,
    departureDate: "",
    departureTime: "",
    missionDuration: "",
    returnDate: "",
    returnTime: "",
  });
  const navigate = useNavigate();

  const calculateMissionDuration = useCallback((departureDate, returnDate, missionStartDate) => {
    if (!departureDate || !returnDate) {
      return { missionDuration: "", error: "La date de départ et la date de retour doivent être fournies." };
    }

    const departure = new Date(departureDate);
    const returnD = new Date(returnDate);
    const missionStart = missionStartDate ? new Date(missionStartDate) : null;

    if (isNaN(departure.getTime()) || isNaN(returnD.getTime())) {
      return { missionDuration: "", error: "Les dates de départ ou de retour sont invalides." };
    }

    if (returnD < departure) {
      return { missionDuration: "", error: "La date de retour doit être postérieure ou égale à la date de départ." };
    }

    if (missionStart && departure < missionStart) {
      return {
        missionDuration: "",
        error: "La date de départ doit être supérieure ou égale à la date de début de la mission.",
      };
    }

    const durationMs = returnD - departure;
    const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));

    if (durationDays <= 0) {
      return { missionDuration: "", error: "La durée doit être un nombre positif." };
    }

    return { missionDuration: durationDays.toString(), error: null };
  }, []);

  useEffect(() => {
    fetchAllRegions(
      (data) => {
        setRegions(data);
        setRegionNames(data.map((lieu) => lieu.nom));
        setRegionDisplayNames(data.map((lieu) => `${lieu.nom}${lieu.pays ? `/${lieu.pays}` : ''}`));
        setIsLoading((prev) => ({ ...prev, regions: false }));
      },
      setIsLoading,
      (alert) => setAlert(alert)
    );

    fetchAllTransports(
      (transports) => {
        setSuggestions((prev) => ({
          ...prev,
          transport: transports.map((transport) => ({
            id: transport.transportId,
            type: transport.type,
          })),
        }));
        setIsLoading((prev) => ({ ...prev, transports: false }));
      },
      setIsLoading,
      () => {},
      (error) => setModal({ isOpen: true, type: "error", message: error.message })
    );

    fetchEmployees(
      null,
      (employees) => {
        const employeeArray = Array.isArray(employees) ? employees : [];
        setSuggestions((prev) => ({
          ...prev,
          beneficiary: employeeArray.map((emp) => ({
            id: emp.employeeId,
            name: `${emp.lastName} ${emp.firstName}`,
            displayName: `${emp.lastName} ${emp.firstName} (${emp.direction?.acronym || "N/A"})`,
            employeeCode: emp.employeeCode,
            jobTitle: emp.jobTitle,
            site: emp.site?.siteName,
            direction: emp.direction?.directionName,
            department: emp.department?.departmentName,
            service: emp.service?.serviceName,
            costCenter: emp.costCenter,
            acronym: emp.direction?.acronym || "N/A",
          })),
        }));
        setIsLoading((prev) => ({ ...prev, employees: false }));
      },
      setIsLoading,
      setSuggestions,
      (error) => setModal({ isOpen: true, type: "error", message: error.message })
    );

    fetchAllMissions(
      (missions) => {
        setMissions(missions);
        setSuggestions((prev) => ({
          ...prev,
          mission: missions.map((mission) => ({
            id: mission.missionId,
            name: mission.name,
            displayName: `${mission.name} (${mission.lieu.nom}, ${new Date(mission.startDate).toLocaleDateString('fr-FR')} - ${mission.endDate ? new Date(mission.endDate).toLocaleDateString('fr-FR') : 'N/A'})`,
            startDate: mission.startDate,
            endDate: mission.endDate,
            lieuId: mission.lieuId,
            location: mission.lieu.nom,
            description: mission.description,
          })),
        }));
        setIsLoading((prev) => ({ ...prev, missions: false }));
      },
      setIsLoading,
      () => {},
      (error) => setModal({ isOpen: true, type: "error", message: error.message })
    );
  }, []);

  useEffect(() => {
    if (suggestions.beneficiary.length === 0) return;

    setFormData((prev) => {
      const newBeneficiaries = prev.beneficiaries.map((beneficiary) => {
        if (beneficiary.beneficiary) {
          const selectedEmployee = suggestions.beneficiary.find(
            (emp) => emp.displayName === beneficiary.beneficiary
          );
          if (selectedEmployee) {
            return {
              ...beneficiary,
              employeeId: selectedEmployee.id || "",
              matricule: selectedEmployee.employeeCode || "",
              function: selectedEmployee.jobTitle || "",
              base: selectedEmployee.site || "",
              direction: selectedEmployee.direction || "",
              department: selectedEmployee.department || "",
              service: selectedEmployee.service || "",
              costCenter: selectedEmployee.costCenter || "",
            };
          }
        }
        return {
          ...beneficiary,
          employeeId: "",
          matricule: "",
          function: "",
          base: "",
          direction: "",
          department: "",
          service: "",
          costCenter: "",
        };
      });

      return prev.beneficiaries !== newBeneficiaries ? { ...prev, beneficiaries: newBeneficiaries } : prev;
    });
  }, [suggestions.beneficiary]);

  useEffect(() => {
    if (newBeneficiary.beneficiary && suggestions.beneficiary.length > 0) {
      const selectedEmployee = suggestions.beneficiary.find(
        (emp) => emp.displayName === newBeneficiary.beneficiary
      );
      if (selectedEmployee) {
        setNewBeneficiary((prev) => ({
          ...prev,
          employeeId: selectedEmployee.id || "",
          matricule: selectedEmployee.employeeCode || "",
          function: selectedEmployee.jobTitle || "",
          base: selectedEmployee.site || "",
          direction: selectedEmployee.direction || "",
          department: selectedEmployee.department || "",
          service: selectedEmployee.service || "",
          costCenter: selectedEmployee.costCenter || "",
        }));
      }
    } else if (!newBeneficiary.beneficiary) {
      setNewBeneficiary((prev) => ({
        ...prev,
        employeeId: "",
        matricule: "",
        function: "",
        base: "",
        direction: "",
        department: "",
        service: "",
        costCenter: "",
      }));
    }
  }, [newBeneficiary.beneficiary, suggestions.beneficiary]);

  useEffect(() => {
    if (suggestions.transport.length === 0) return;

    setFormData((prev) => {
      const newBeneficiaries = prev.beneficiaries.map((beneficiary) => {
        if (beneficiary.transport) {
          const selectedTransport = suggestions.transport.find((t) => t.type === beneficiary.transport);
          return {
            ...beneficiary,
            transportId: selectedTransport ? selectedTransport.id : null,
          };
        }
        return { ...beneficiary, transportId: null };
      });

      return prev.beneficiaries !== newBeneficiaries ? { ...prev, beneficiaries: newBeneficiaries } : prev;
    });
  }, [suggestions.transport]);

  useEffect(() => {
    if (newBeneficiary.transport && suggestions.transport.length > 0) {
      const selectedTransport = suggestions.transport.find((t) => t.type === newBeneficiary.transport);
      setNewBeneficiary((prev) => ({
        ...prev,
        transportId: selectedTransport ? selectedTransport.id : null,
      }));
    } else if (!newBeneficiary.transport) {
      setNewBeneficiary((prev) => ({ ...prev, transportId: null }));
    }
  }, [newBeneficiary.transport, suggestions.transport]);

  useEffect(() => {
    if (missionMode === "existing" && formData.missionId) {
      const selectedMission = suggestions.mission.find((m) => m.id === formData.missionId);
      if (selectedMission) {
        setFormData((prev) => ({
          ...prev,
          missionTitle: selectedMission.name || "",
          description: selectedMission.description || "",
          location: selectedMission.location || "",
          startDate: selectedMission.startDate ? new Date(selectedMission.startDate).toISOString().split('T')[0] : null,
          endDate: selectedMission.endDate ? new Date(selectedMission.endDate).toISOString().split('T')[0] : null,
          lieuId: selectedMission.lieuId || "",
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        missionTitle: "",
        description: "",
        location: "",
        startDate: null,
        endDate: null,
        missionId: "",
        lieuId: "",
      }));
    }
  }, [formData.missionId, missionMode, suggestions.mission]);

  const showAlert = (type, message) => {
    setAlert({ isOpen: true, type, message });
  };

  const showModal = (type, message) => {
    setModal({ isOpen: true, type, message });
  };

  const handleAddNewSuggestion = (field, value) => {
    if (field === "location") {
      const newRegion = { nom: value };
      setRegions((prev) => [...prev, newRegion]);
      setRegionNames((prev) => [...prev, value]);
      setRegionDisplayNames((prev) => [...prev, value]);
      setFormData((prev) => ({ ...prev, location: value }));
      showAlert("success", `"${value}" ajouté aux suggestions pour ${field}`);
      setFieldErrors((prev) => ({ ...prev, lieuId: undefined }));
    } else if (field === "transport") {
      setSuggestions((prev) => ({
        ...prev,
        transport: [...prev.transport, { id: value, type: value }],
      }));
      setNewBeneficiary((prev) => ({ ...prev, transport: value }));
      showAlert("success", `"${value}" ajouté aux suggestions pour ${field}`);
      setFieldErrors((prev) => ({ ...prev, transportId: undefined }));
    }
  };

  const handleInputChange = (e, index) => {
    const { name, value } = e.target;

    if (index !== undefined) {
      setNewBeneficiary((prev) => {
        const updatedBeneficiary = { ...prev, [name]: value || "" };

        if (name === "departureDate" || name === "returnDate") {
          const missionStart =
            missionMode === "existing" && formData.missionId
              ? suggestions.mission.find((m) => m.id === formData.missionId)?.startDate
              : formData.startDate;
          const { missionDuration, error } = calculateMissionDuration(
            updatedBeneficiary.departureDate,
            updatedBeneficiary.returnDate,
            missionStart
          );

          setFieldErrors((prevErrors) => ({
            ...prevErrors,
            [`beneficiaries[${formData.beneficiaries.length}].departureDate`]: error ? [error] : undefined,
            [`beneficiaries[${formData.beneficiaries.length}].returnDate`]: error ? [error] : undefined,
          }));

          return { ...updatedBeneficiary, missionDuration };
        }

        return updatedBeneficiary;
      });

      setFieldErrors((prev) => ({
        ...prev,
        [`beneficiaries[${index}].${name}`]: undefined,
      }));
    } else {
      setFormData((prev) => {
        const updatedFormData = {
          ...prev,
          [name]: name === "startDate" || name === "endDate" || name === "missionId" ? (value || null) : value,
        };

        if (name === "startDate") {
          const newBeneficiaries = prev.beneficiaries.map((beneficiary, idx) => {
            const { missionDuration, error } = calculateMissionDuration(
              beneficiary.departureDate,
              beneficiary.returnDate,
              value
            );
            setFieldErrors((prevErrors) => ({
              ...prevErrors,
              [`beneficiaries[${idx}].departureDate`]: error ? [error] : undefined,
              [`beneficiaries[${idx}].returnDate`]: error ? [error] : undefined,
            }));
            return { ...beneficiary, missionDuration };
          });
          return { ...updatedFormData, beneficiaries: newBeneficiaries };
        }

        return updatedFormData;
      });

      setFieldErrors((prev) => ({
        ...prev,
        [name === "missionTitle" ? "name" : name === "location" ? "lieuId" : name]: undefined,
      }));
    }
  };

  const addBeneficiary = () => {
    setEditingBeneficiary(null);
    setEditingIndex(null);
    setNewBeneficiary({
      beneficiary: "",
      employeeId: "",
      matricule: "",
      function: "",
      base: "",
      direction: "",
      department: "",
      service: "",
      costCenter: "",
      transport: "",
      transportId: null,
      departureDate: "",
      departureTime: "",
      missionDuration: "",
      returnDate: "",
      returnTime: "",
    });
    setIsPopupOpen(true);
  };

  const editBeneficiary = (index) => {
    const beneficiary = formData.beneficiaries[index];
    setEditingBeneficiary(beneficiary);
    setEditingIndex(index);
    setNewBeneficiary(beneficiary);
    setIsPopupOpen(true);
  };

  const handlePopupSubmit = (beneficiary) => {
    if (editingIndex !== null) {
      // Mode édition
      setFormData((prev) => ({
        ...prev,
        beneficiaries: prev.beneficiaries.map((item, index) => 
          index === editingIndex ? beneficiary : item
        ),
      }));
      showAlert("success", "Bénéficiaire modifié avec succès.");
    } else {
      // Mode ajout
      setFormData((prev) => ({
        ...prev,
        beneficiaries: [...prev.beneficiaries, beneficiary],
      }));
      showAlert("success", "Bénéficiaire ajouté avec succès.");
    }
    
    setNewBeneficiary({
      beneficiary: "",
      employeeId: "",
      matricule: "",
      function: "",
      base: "",
      direction: "",
      department: "",
      service: "",
      costCenter: "",
      transport: "",
      transportId: null,
      departureDate: "",
      departureTime: "",
      missionDuration: "",
      returnDate: "",
      returnTime: "",
    });
    setEditingBeneficiary(null);
    setEditingIndex(null);
    setIsPopupOpen(false);
  };

  const removeBeneficiary = (index) => {
    setFormData((prev) => ({
      ...prev,
      beneficiaries: prev.beneficiaries.filter((_, i) => i !== index),
    }));
    setFieldErrors((prev) => {
      const newErrors = { ...prev };
      Object.keys(prev).forEach((key) => {
        if (key.startsWith(`beneficiaries[${index}]`)) {
          delete newErrors[key];
        }
      });
      return newErrors;
    });
    showAlert("success", "Bénéficiaire supprimé avec succès.");
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString('fr-FR');
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "-";
    return timeStr;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});

    const selectedRegion = regions.find((region) => region.nom === formData.location);
    const selectedMission = missionMode === "existing" ? suggestions.mission.find((m) => m.id === formData.missionId) : null;

    if (missionMode === "new") {
      if (formData.location && !selectedRegion) {
        showModal("error", "Veuillez sélectionner un lieu valide parmi les régions de Madagascar.");
        setIsSubmitting(false);
        return;
      }
    }

    const selectedEmployeeIds = new Set();
    for (let i = 0; i < formData.beneficiaries.length; i++) {
      const beneficiary = formData.beneficiaries[i];
      const selectedEmployee = suggestions.beneficiary.find((emp) => emp.displayName === beneficiary.beneficiary);
      
      if (!selectedEmployee && beneficiary.beneficiary) {
        showModal("error", `Veuillez sélectionner un employé valide pour le bénéficiaire ${i + 1}.`);
        setIsSubmitting(false);
        return;
      }
      if (selectedEmployee) {
        if (selectedEmployeeIds.has(selectedEmployee.id)) {
          showModal("error", `L'employé ${selectedEmployee.name} est sélectionné plusieurs fois.`);
          setIsSubmitting(false);
          return;
        }
        selectedEmployeeIds.add(selectedEmployee.id);
      }

      if (!beneficiary.departureDate) {
        setFieldErrors((prev) => ({
          ...prev,
          [`beneficiaries[${i}].departureDate`]: ["La date de départ est requise."],
        }));
        setIsSubmitting(false);
        return;
      }
      if (!beneficiary.returnDate) {
        setFieldErrors((prev) => ({
          ...prev,
          [`beneficiaries[${i}].returnDate`]: ["La date de retour est requise."],
        }));
        setIsSubmitting(false);
        return;
      }

      const missionStart = missionMode === "existing" && selectedMission ? selectedMission.startDate : formData.startDate;
      if (beneficiary.departureDate && missionStart) {
        const departure = new Date(beneficiary.departureDate);
        const returnD = new Date(beneficiary.returnDate);
        const missionStartDate = new Date(missionStart);
        if (departure < missionStartDate) {
          showModal("error", `La date de départ du bénéficiaire ${i + 1} doit être supérieure ou égale à la date de début de la mission.`);
          setIsSubmitting(false);
          return;
        }
        if (returnD < departure) {
          showModal("error", `La date de retour du bénéficiaire ${i + 1} doit être postérieure ou égale à la date de départ.`);
          setIsSubmitting(false);
          return;
        }
      }
    }

    try {
      if (missionMode === "existing") {
        for (const beneficiary of formData.beneficiaries) {
          const selectedEmployee = suggestions.beneficiary.find((emp) => emp.displayName === beneficiary.beneficiary);
          const selectedTransport = beneficiary.transport
            ? suggestions.transport.find((t) => t.type === beneficiary.transport)
            : null;

          const assignationData = {
            employeeId: selectedEmployee?.id || "",
            missionId: formData.missionId,
            transportId: selectedTransport ? selectedTransport.id : null,
            departureDate: beneficiary.departureDate ? new Date(beneficiary.departureDate).toISOString() : null,
            departureTime: beneficiary.departureTime || null,
            returnDate: beneficiary.returnDate ? new Date(beneficiary.returnDate).toISOString() : null,
            returnTime: beneficiary.returnTime || null,
            duration: parseInt(beneficiary.missionDuration, 10) || null,
          };

          await createMissionAssignation(
            assignationData,
            (loading) => setIsSubmitting(loading.missionAssignation),
            (alert) => setAlert(alert),
            (error) => {
              setModal(error);
              setFieldErrors(error.fieldErrors || {});
              throw error;
            }
          );
        }
        showAlert("success", "Bénéficiaires assignés à la mission avec succès.");
        navigate("/mission/list");
      } else {
        const missionData = {
          name: formData.missionTitle,
          description: formData.description,
          startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
          endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
          lieuId: selectedRegion ? selectedRegion.lieuId : formData.lieuId,
          assignations: formData.beneficiaries.map((beneficiary) => {
            const selectedEmployee = suggestions.beneficiary.find((emp) => emp.displayName === beneficiary.beneficiary);
            const selectedTransport = beneficiary.transport
              ? suggestions.transport.find((t) => t.type === beneficiary.transport)
              : null;
            return {
              employeeId: selectedEmployee?.id || "",
              missionId: formData.missionId,
              transportId: selectedTransport ? selectedTransport.id : null,
              departureDate: beneficiary.departureDate ? new Date(beneficiary.departureDate).toISOString() : null,
              departureTime: beneficiary.departureTime || null,
              returnDate: beneficiary.returnDate ? new Date(beneficiary.returnDate).toISOString() : null,
              returnTime: beneficiary.returnTime || null,
              duration: parseInt(beneficiary.missionDuration, 10) || null,
            };
          }),
        };

        await createMission(
          missionData,
          (loading) => setIsSubmitting(loading.mission),
          (alert) => setAlert(alert),
          (error) => {
            setModal(error);
            setFieldErrors(error.fieldErrors || {});
            throw error;
          }
        );
        showAlert("success", "Mission créée et assignée avec succès.");
        navigate("/mission/list");
      }
    } catch (error) {
      console.error("Erreur dans handleSubmit :", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      missionTitle: "",
      description: "",
      location: "",
      startDate: null,
      endDate: null,
      missionId: "",
      beneficiaries: [],
    });
    setMissionMode("new");
    setFieldErrors({});
    showAlert("info", "Formulaire réinitialisé.");
  };

  return (
    <div className="form-container max-w-5xl mx-auto p-6">
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
      <BeneficiaryPopup
        isOpen={isPopupOpen}
        onClose={() => {
          setIsPopupOpen(false);
          setEditingBeneficiary(null);
          setEditingIndex(null);
          setNewBeneficiary({
            beneficiary: "",
            employeeId: "",
            matricule: "",
            function: "",
            base: "",
            direction: "",
            department: "",
            service: "",
            costCenter: "",
            transport: "",
            transportId: null,
            departureDate: "",
            departureTime: "",
            missionDuration: "",
            returnDate: "",
            returnTime: "",
          });
        }}
        onSubmit={handlePopupSubmit}
        beneficiary={newBeneficiary}
        suggestions={suggestions}
        isSubmitting={isSubmitting}
        fieldErrors={fieldErrors}
        handleInputChange={handleInputChange}
        handleAddNewSuggestion={handleAddNewSuggestion}
        index={editingIndex !== null ? editingIndex : formData.beneficiaries.length}
        isEditing={editingIndex !== null}
      />
      <div className="table-header mb-6">
        <h2 className="table-title text-2xl font-bold">Création et Assignation d'une Mission</h2>
      </div>

      <form id="combinedMissionForm" className="generic-form" onSubmit={handleSubmit}>
        <div className="form-section mb-6">
          <h3 className="form-section-title text-lg font-semibold mb-4">Type de Mission</h3>
          <table className="form-table w-full border-collapse">
            <tbody>
              <tr className="form-row">
                <td className="form-field-cell p-2 align-top w-1/4">
                  <label className="form-label form-label-required">Mode</label>
                </td>
                <td className="form-field-cell p-2 align-top">
                  <select
                    name="missionMode"
                    value={missionMode}
                    onChange={(e) => setMissionMode(e.target.value)}
                    className="form-table w-full"
                    disabled={isSubmitting || isLoading.missions}
                  >
                    <option value="new">Nouvelle Mission</option>
                    <option value="existing">Mission Existante</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {missionMode === "existing" ? (
          <ExistingMissionForm
            formData={formData}
            fieldErrors={fieldErrors}
            isSubmitting={isSubmitting}
            isLoading={isLoading}
            suggestions={suggestions}
            handleInputChange={handleInputChange}
          />
        ) : (
          <NewMissionForm
            formData={formData}
            fieldErrors={fieldErrors}
            isSubmitting={isSubmitting}
            isLoading={isLoading}
            regionDisplayNames={regionDisplayNames}
            handleInputChange={handleInputChange}
            handleAddNewSuggestion={handleAddNewSuggestion}
          />
        )}

        <div className="form-section mb-6">
          <h3 className="form-section-title text-lg font-semibold mb-4">Détails des Assignations</h3>
          
          {formData.beneficiaries.length > 0 ? (
            <div className="beneficiaries-table-container">
              <table className="beneficiaries-table">
                <thead>
                  <tr>
                    <th className="col-id">ID</th>
                    <th className="col-beneficiary">Bénéficiaire</th>
                    <th className="col-matricule">Matricule</th>
                    <th className="col-fonction">Fonction</th>
                    <th className="col-direction">Direction</th>
                    <th className="col-transport">Transport</th>
                    <th className="col-dates">Départ</th>
                    <th className="col-dates">Retour</th>
                    <th className="col-duree">Durée</th>
                    <th className="col-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.beneficiaries.map((beneficiary, index) => (
                    <tr key={index}>
                      <td className="col-id">{index + 1}</td>
                      <td className="col-beneficiary" title={beneficiary.beneficiary}>
                        {beneficiary.beneficiary}
                      </td>
                      <td className="col-matricule" title={beneficiary.matricule}>
                        {beneficiary.matricule || "-"}
                      </td>
                      <td className="col-fonction" title={beneficiary.function}>
                        {beneficiary.function || "-"}
                      </td>
                      <td className="col-direction" title={beneficiary.direction}>
                        {beneficiary.direction || "-"}
                      </td>
                      <td className="col-transport" title={beneficiary.transport}>
                        {beneficiary.transport || "-"}
                      </td>
                      <td className="col-dates">
                        <div className="date-info">{formatDate(beneficiary.departureDate)}</div>
                        <div className="date-info">{formatTime(beneficiary.departureTime)}</div>
                      </td>
                      <td className="col-dates">
                        <div className="date-info">{formatDate(beneficiary.returnDate)}</div>
                        <div className="date-info">{formatTime(beneficiary.returnTime)}</div>
                      </td>
                      <td className="col-duree">
                        {beneficiary.missionDuration ? (
                          <span className="duration-badge">{beneficiary.missionDuration}j</span>
                        ) : "-"}
                      </td>
                      <td className="col-actions">
                        <button
                          type="button"
                          className="table-action-btn edit-btn"
                          onClick={() => editBeneficiary(index)}
                          disabled={isSubmitting}
                          title="Modifier ce bénéficiaire"
                        >
                          <FaIcons.FaEdit />
                        </button>
                        <button
                          type="button"
                          className="table-action-btn delete-btn"
                          onClick={() => removeBeneficiary(index)}
                          disabled={isSubmitting}
                          title="Supprimer ce bénéficiaire"
                        >
                          <FaIcons.FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-beneficiaries">
              <p>Aucun bénéficiaire ajouté. Cliquez sur "Ajouter un Bénéficiaire" pour commencer.</p>
            </div>
          )}

          <button
            type="button"
            className="add-btn"
            onClick={addBeneficiary}
            disabled={isSubmitting}
            title="Ajouter un nouveau bénéficiaire"
          >
            <FaIcons.FaPlus className="w-4 h-4" />
            <span>Ajouter un Bénéficiaire</span>
          </button>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting || isLoading.regions || isLoading.employees || isLoading.transports || isLoading.missions}
            title={missionMode === "existing" ? "Assigner à la mission" : "Créer et assigner la mission"}
          >
            <span>{isSubmitting ? "Envoi en cours..." : missionMode === "existing" ? "Assigner" : "Créer et Assigner"}</span>
            <FaIcons.FaArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="reset-btn"
            onClick={handleReset}
            disabled={isSubmitting || isLoading.regions || isLoading.employees || isLoading.transports || isLoading.missions}
            title="Réinitialiser le formulaire"
          >
            <FaIcons.FaTrash className="w-4 h-4" />
            <span>Réinitialiser</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default MissionForm;
import { useState, useEffect, useCallback } from "react";
import { fetchAllRegions } from "services/lieu/lieu";
import { fetchEmployees } from "services/employee/employee";
import { fetchAllTransports } from "services/transport/transport";
import { 
    createMission, 
    updateMission, 
    fetchMissionById,
} from "services/mission/mission"; 

const useMissionForm = ({ isOpen, onClose, missionId, initialStartDate, onFormSuccess }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        missionTitle: "",
        description: "",
        location: "",
        startDate: initialStartDate || null,
        endDate: null,
        missionType: "national",
        beneficiary: {
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
        },
        lieuId: "",
        type: "Indemnité",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasClickedSubmit, setHasClickedSubmit] = useState(false);
    const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" });
    const [errorModal, setErrorModal] = useState({ isOpen: false, message: "" });
    const [regions, setRegions] = useState([]);
    const [regionNames, setRegionNames] = useState([]);
    const [regionDisplayNames, setRegionDisplayNames] = useState([]);
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
        missionDetail: false,
    });
    const [fieldErrors, setFieldErrors] = useState({});

    // Debug fieldErrors changes
    useEffect(() => {
    }, [fieldErrors]);

    // ----------------------------------------------------------------------
    // Utilitaires et Validation
    // ----------------------------------------------------------------------

    const showAlert = (type, message, errors = {}) => {
        if (type === "error") {
            setErrorModal({ isOpen: true, message });
            // Merge new errors with existing ones instead of overwriting
            setFieldErrors((prev) => ({
                ...prev,
                ...errors,
            }));
        } else {
            setAlert({ isOpen: true, type, message });
        }
    };

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
        let durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
        
        if (durationDays === 0 && departure.toDateString() === returnD.toDateString()) {
            durationDays = 1;
        }

        if (durationDays <= 0) {
            return { missionDuration: "", error: "La durée calculée n'est pas valide." };
        }

        return { missionDuration: durationDays.toString(), error: null };
    }, []);

    const validateStep1 = () => {
        let errors = {};
        if (!formData.missionTitle) errors.name = ["Le titre de la mission est requis."];
        if (!formData.location) errors.lieuId = ["Le lieu est requis."];
        if (!formData.startDate) errors.startDate = ["La date de début est requise."];
        if (!formData.endDate) errors.endDate = ["La date de fin est requise."];
        if (!formData.missionType) errors.missionType = ["Le type de mission est requis."];
        if (formData.endDate && formData.startDate) {
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            if (end < start) {
                errors.endDate = ["La date de fin doit être postérieure ou égale à la date de début."];
            }
        }

        setFieldErrors((prev) => {
            const updatedErrors = { ...prev, ...errors };
            Object.keys(updatedErrors).forEach((key) => {
                if (Array.isArray(updatedErrors[key]) && updatedErrors[key].length === 0) {
                    delete updatedErrors[key];
                }
            });
            return updatedErrors;
        });

        return Object.keys(errors).length === 0;
    };

    const validateStep2 = () => {
        let errors = {};
        const beneficiary = formData.beneficiary;

        if (!beneficiary.beneficiary) errors["beneficiary.employeeId"] = ["Le bénéficiaire est requis."];
        if (!beneficiary.departureDate) errors["beneficiary.departureDate"] = ["La date de départ est requise."];
        if (!beneficiary.returnDate) errors["beneficiary.returnDate"] = ["La date de retour est requise."];
        if (!beneficiary.departureTime) errors["beneficiary.departureTime"] = ["L'heure de départ est requise."];
        if (!beneficiary.returnTime) errors["beneficiary.returnTime"] = ["L'heure de retour est requise."];
        if (!beneficiary.missionDuration) errors["beneficiary.missionDuration"] = ["La durée de la mission est requise."];

        if (beneficiary.departureDate && beneficiary.returnDate && formData.startDate) {
            const { error } = calculateMissionDuration(beneficiary.departureDate, beneficiary.returnDate, formData.startDate);
            if (error) {
                errors["beneficiary.departureDate"] = [...(errors["beneficiary.departureDate"] || []), error];
                errors["beneficiary.returnDate"] = [...(errors["beneficiary.returnDate"] || []), error];
                errors["beneficiary.missionDuration"] = [...(errors["beneficiary.missionDuration"] || []), error];
            }
        }

        if (beneficiary.returnDate && formData.endDate) {
            const returnDate = new Date(beneficiary.returnDate);
            const endDate = new Date(formData.endDate);
            if (returnDate > endDate) {
                const endDateError = "La date de retour doit être antérieure ou égale à la date de fin de la mission.";
                errors["beneficiary.returnDate"] = [...(errors["beneficiary.returnDate"] || []).filter(e => e !== endDateError), endDateError];
            }
        }

        const fieldsToClean = ["beneficiary.employeeId", "beneficiary.departureDate", "beneficiary.returnDate", "beneficiary.departureTime", "beneficiary.returnTime", "beneficiary.missionDuration"];
        fieldsToClean.forEach(field => {
            const formKey = field.split(".")[1];
            const formValue = field.includes('.') ? formData.beneficiary[formKey] : formData[formKey];
            if (formValue) {
                errors[field] = (errors[field] || []).filter(e => !e.includes("est requis"));
                if (errors[field].length === 0) delete errors[field];
            }
        });

        setFieldErrors((prev) => {
            const updatedErrors = { ...prev, ...errors };
            Object.keys(updatedErrors).forEach((key) => {
                if (Array.isArray(updatedErrors[key]) && updatedErrors[key].length === 0) {
                    delete updatedErrors[key];
                }
            });
            return updatedErrors;
        });
        return Object.keys(errors).length === 0;
    };

    const validateStep3 = () => {
        let errors = {};
        if (!formData.type) {
            errors.type = ["Le type de compensation est requis."];
        }

        setFieldErrors((prev) => {
            const updatedErrors = { ...prev, ...errors };
            Object.keys(updatedErrors).forEach((key) => {
                if (Array.isArray(updatedErrors[key]) && updatedErrors[key].length === 0) {
                    delete updatedErrors[key];
                }
            });
            return updatedErrors;
        });
        return Object.keys(errors).length === 0;
    };

    // ----------------------------------------------------------------------
    // Fonctions de Manipulation d'État
    // ----------------------------------------------------------------------

    const handleAddNewSuggestion = (field, value) => {
        if (field === "location") {
            const newRegion = { nom: value, lieuId: `temp-${Date.now()}`, pays: "Madagascar" };
            setRegions((prev) => [...prev, newRegion]);
            setRegionNames((prev) => [...prev, value]);
            setRegionDisplayNames((prev) => [...prev, `${value}/Madagascar`]);
            setFormData((prev) => ({ ...prev, location: `${value}/Madagascar`, lieuId: newRegion.lieuId }));
            showAlert("success", `"${value}" ajouté aux suggestions pour ${field}`);
            setFieldErrors((prev) => ({ ...prev, lieuId: undefined }));
        } else if (field === "transport") {
            const newTransport = { id: `temp-${Date.now()}`, type: value };
            setSuggestions((prev) => ({
                ...prev,
                transport: [...prev.transport, newTransport],
            }));
            setFormData((prev) => ({
                ...prev,
                beneficiary: { ...prev.beneficiary, transport: value, transportId: newTransport.id },
            }));
            showAlert("success", `"${value}" ajouté aux suggestions pour ${field}`);
            setFieldErrors((prev) => ({ ...prev, transportId: undefined }));
        }
    };

    const handleInputChange = (e, section) => {
        const { name, value } = e.target;

        if (section === "beneficiary") {
            setFormData((prev) => {
                const updatedBeneficiary = { ...prev.beneficiary, [name]: value || "" };

                if (name === "beneficiary") {
                    const selectedEmployee = suggestions.beneficiary.find((emp) => emp.displayName === value);
                    if (selectedEmployee) {
                        updatedBeneficiary.employeeId = selectedEmployee.id || "";
                        updatedBeneficiary.matricule = selectedEmployee.employeeCode || "";
                        updatedBeneficiary.function = selectedEmployee.jobTitle || "";
                        updatedBeneficiary.base = selectedEmployee.site || "";
                        updatedBeneficiary.direction = selectedEmployee.direction || "";
                        updatedBeneficiary.department = selectedEmployee.department || "";
                        updatedBeneficiary.service = selectedEmployee.service || "";
                        updatedBeneficiary.costCenter = selectedEmployee.costCenter || "";
                    } else {
                        updatedBeneficiary.employeeId = "";
                        updatedBeneficiary.matricule = "";
                        updatedBeneficiary.function = "";
                        updatedBeneficiary.base = "";
                        updatedBeneficiary.direction = "";
                        updatedBeneficiary.department = "";
                        updatedBeneficiary.service = "";
                        updatedBeneficiary.costCenter = "";
                    }
                }

                if (name === "transport") {
                    const selectedTransport = suggestions.transport.find((t) => t.type === value);
                    updatedBeneficiary.transportId = selectedTransport ? selectedTransport.id : null;
                }

                if (name === "departureDate" || name === "returnDate") {
                    const { missionDuration, error } = calculateMissionDuration(
                        name === "departureDate" ? value : updatedBeneficiary.departureDate,
                        name === "returnDate" ? value : updatedBeneficiary.returnDate,
                        prev.startDate
                    );

                    setFieldErrors((prevErrors) => {
                        const updatedErrors = { ...prevErrors };
                        if (error) {
                            updatedErrors["beneficiary.departureDate"] = [error];
                            updatedErrors["beneficiary.returnDate"] = [error];
                            updatedErrors["beneficiary.missionDuration"] = [error];
                        } else {
                            delete updatedErrors["beneficiary.departureDate"];
                            delete updatedErrors["beneficiary.returnDate"];
                            delete updatedErrors["beneficiary.missionDuration"];
                        }
                        return updatedErrors;
                    });

                    return { ...prev, beneficiary: { ...updatedBeneficiary, missionDuration } };
                }

                return { ...prev, beneficiary: updatedBeneficiary };
            });

            setFieldErrors((prev) => {
                const updatedErrors = { ...prev };
                if (value) {
                    delete updatedErrors[`beneficiary.${name}`];
                } else {
                    updatedErrors[`beneficiary.${name}`] = [`${name} est requis.`];
                }
                return updatedErrors;
            });
        } else if (section === "compensation") {
            setFormData((prev) => ({
                ...prev,
                type: value,
            }));
            setFieldErrors((prev) => ({
                ...prev,
                type: value ? [] : ["Le type de compensation est requis."],
            }));
        } else {
            setFormData((prev) => {
                const updatedFormData = {
                    ...prev,
                    [name]: name === "startDate" || name === "endDate" || name === "missionType" ? (value || "") : value,
                };

                if (name === "location") {
                    const selectedRegion = regions.find((region) => `${region.nom}${region.pays ? `/${region.pays}` : ""}` === value);
                    updatedFormData.lieuId = selectedRegion ? selectedRegion.lieuId : "";
                }

                if (name === "startDate") {
                    const { missionDuration, error } = calculateMissionDuration(
                        prev.beneficiary.departureDate,
                        prev.beneficiary.returnDate,
                        value
                    );
                    setFieldErrors((prevErrors) => {
                        const updatedErrors = { ...prevErrors };
                        if (error) {
                            updatedErrors["beneficiary.departureDate"] = [error];
                            updatedErrors["beneficiary.returnDate"] = [error];
                            updatedErrors["beneficiary.missionDuration"] = [error];
                        } else {
                            delete updatedErrors["beneficiary.departureDate"];
                            delete updatedErrors["beneficiary.returnDate"];
                            delete updatedErrors["beneficiary.missionDuration"];
                        }
                        return updatedErrors;
                    });
                    return {
                        ...updatedFormData,
                        beneficiary: { ...prev.beneficiary, missionDuration },
                    };
                }

                return updatedFormData;
            });

            setFieldErrors((prev) => {
                const updatedErrors = { ...prev };
                if (value) {
                    delete updatedErrors[name];
                } else {
                    updatedErrors[name] = [`${name} est requis.`];
                }
                return updatedErrors;
            });
        }
    };

    // ----------------------------------------------------------------------
    // Fonctions de Navigation et de Soumission
    // ----------------------------------------------------------------------

    const handleNext = () => {
        if (currentStep === 1) {
            const isValid = validateStep1();
            if (isValid) {
                setCurrentStep(2);
            } else {
                // Pass the current fieldErrors to showAlert
                showAlert("error", "Veuillez corriger les erreurs avant de continuer.", fieldErrors);
            }
        } else if (currentStep === 2) {
            const isValid = validateStep2();
            if (isValid) {
                setCurrentStep(3);
            } else {
                showAlert("error", "Veuillez corriger les erreurs avant de continuer.", fieldErrors);
            }
        }
    };

    const handlePrevious = () => {
        if (currentStep === 2) {
            setCurrentStep(1);
        } else if (currentStep === 3) {
            setCurrentStep(2);
        }
    };

    const handleReset = () => {
        setFormData({
            missionTitle: "",
            description: "",
            location: "",
            startDate: initialStartDate || null,
            endDate: null,
            missionType: "national",
            beneficiary: {
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
            },
            lieuId: "",
            type: "Indemnité",
        });
        setFieldErrors({});
        setCurrentStep(1);
        showAlert("info", "Formulaire réinitialisé.");
    };

    const handleCancel = () => {
        handleReset();
        onClose();
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (hasClickedSubmit || isSubmitting) {
            return;
        }

        const isStep1Valid = validateStep1();
        const isStep2Valid = validateStep2();
        const isStep3Valid = validateStep3();

        if (!isStep1Valid || !isStep2Valid || !isStep3Valid) {
            showAlert("error", "Veuillez corriger toutes les erreurs avant de soumettre.", fieldErrors);
            return;
        }

        setHasClickedSubmit(true);
        setIsSubmitting(true);
        setFieldErrors({});

        try {
            const locationName = formData.location.split("/")[0];
            const selectedRegion = regions.find((region) => region.nom === locationName);
            const beneficiary = formData.beneficiary;
            const selectedEmployee = suggestions.beneficiary.find((emp) => emp.id === beneficiary.employeeId);

            if (formData.location && !selectedRegion && !formData.lieuId) {
                setErrorModal({ isOpen: true, message: "Le lieu sélectionné n'est pas valide ou n'a pas d'ID." });
                return;
            }
            if (!beneficiary.employeeId || !selectedEmployee) {
                setErrorModal({ isOpen: true, message: "Le bénéficiaire sélectionné n'est pas valide." });
                return;
            }

            const missionData = {
                name: formData.missionTitle,
                description: formData.description,
                startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
                endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
                lieuId: selectedRegion ? selectedRegion.lieuId : formData.lieuId,
                missionType: formData.missionType,
                type: formData.type,
                assignations: [
                    {
                        employeeId: selectedEmployee.id,
                        transportId: beneficiary.transport
                            ? suggestions.transport.find((t) => t.type === beneficiary.transport)?.id
                            : null,
                        departureDate: beneficiary.departureDate ? new Date(beneficiary.departureDate).toISOString() : null,
                        departureTime: beneficiary.departureTime || null,
                        returnDate: beneficiary.returnDate ? new Date(beneficiary.returnDate).toISOString() : null,
                        returnTime: beneficiary.returnTime || null,
                        duration: parseInt(beneficiary.missionDuration, 10) || null,
                        type: formData.type,
                    },
                ],
            };

            let successMessage;

            if (missionId) {
                await updateMission(
                    missionId,
                    missionData,
                    (loading) => setIsLoading((prev) => ({ ...prev, mission: loading })),
                    (alert) => showAlert(alert.type, alert.message),
                    (error) => {
                        setErrorModal({ isOpen: true, message: error.message });
                        setFieldErrors(error.fieldErrors || {});
                        throw error;
                    }
                );
                successMessage = "Mission mise à jour avec succès.";
            } else {
                await createMission(
                    missionData,
                    (loading) => setIsLoading((prev) => ({ ...prev, mission: loading })),
                    (alert) => showAlert(alert.type, alert.message),
                    (error) => {
                        setErrorModal({ isOpen: true, message: error.message });
                        setFieldErrors(error.fieldErrors || {});
                        throw error;
                    }
                );
                successMessage = "Mission créée et assignée avec succès.";
            }

            onFormSuccess("success", successMessage);
            showAlert("success", successMessage);

            setHasClickedSubmit(false);
            setIsSubmitting(false);

            onClose();
        } catch (error) {
            setHasClickedSubmit(false);
            setIsSubmitting(false);
        }
    };

    // ----------------------------------------------------------------------
    // Effets
    // ----------------------------------------------------------------------

    useEffect(() => {
        if (!isOpen) return;

        fetchAllRegions(
            (data) => {
                setRegions(data);
                setRegionNames(data.map((lieu) => lieu.nom));
                setRegionDisplayNames(data.map((lieu) => `${lieu.nom}${lieu.pays ? `/${lieu.pays}` : ""}`));
                setIsLoading((prev) => ({ ...prev, regions: false }));
            },
            setIsLoading,
            () => {}
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
            (error) => console.error("Erreur transports:", error.message)
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
            (error) => console.error("Erreur employés:", error.message)
        );
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen || !missionId || regions.length === 0 || suggestions.beneficiary.length === 0) return;

        const loadMission = async () => {
            try {
                setIsLoading((prev) => ({ ...prev, missionDetail: true }));

                await fetchMissionById(
                    missionId,
                    (data) => {
                        const missionData = data.mission || data;
                        const assignationData = data.assignationId ? data : data.assignations?.[0] || {};
                        const employeeData = assignationData.employee || {};
                        const transportData = assignationData.transport || {};

                        const selectedEmployee = suggestions.beneficiary.find(e => e.id === employeeData.employeeId);
                        const selectedTransport = suggestions.transport.find(t => t.id === transportData.transportId);
                        const selectedRegion = regions.find(r => r.lieuId === missionData.lieuId);

                        setFormData((prev) => {
                            const name = missionData.name || missionData.missionTitle || "";
                            const location = selectedRegion 
                                ? `${selectedRegion.nom}${selectedRegion.pays ? `/${selectedRegion.pays}` : ""}` 
                                : missionData.lieu?.nom || "";

                            const beneficiaryDetails = selectedEmployee ? {
                                beneficiary: selectedEmployee.displayName || `${employeeData.lastName} ${employeeData.firstName}`,
                                employeeId: selectedEmployee.id || "",
                                matricule: selectedEmployee.employeeCode || "",
                                function: selectedEmployee.jobTitle || "",
                                base: selectedEmployee.site || "",
                                direction: selectedEmployee.direction || "",
                                department: selectedEmployee.department || "",
                                service: selectedEmployee.service || "",
                                costCenter: selectedEmployee.costCenter || "",
                                transport: selectedTransport?.type || transportData.type || "",
                                transportId: selectedTransport?.id || transportData.transportId || null,
                                departureDate: assignationData.departureDate?.substring(0, 10) || "",
                                departureTime: assignationData.departureTime || "",
                                missionDuration: assignationData.duration?.toString() || "",
                                returnDate: assignationData.returnDate?.substring(0, 10) || "",
                                returnTime: assignationData.returnTime || "",
                                type: assignationData.type || "Indemnité",
                            } : prev.beneficiary;

                            return {
                                ...prev,
                                missionTitle: name,
                                description: missionData.description || "",
                                location: location,
                                lieuId: missionData.lieuId || "",
                                startDate: missionData.startDate?.substring(0, 10) || null,
                                endDate: missionData.endDate?.substring(0, 10) || null,
                                missionType: missionData.missionType || "national",
                                type: assignationData.type || "Indemnité",
                                beneficiary: beneficiaryDetails,
                            };
                        });
                    },
                    (isLoad) => setIsLoading((prev) => ({ ...prev, missionDetail: isLoad })),
                    (error) => {
                        showAlert("error", `Impossible de charger les détails de la mission : ${error.message}`);
                    }
                );
            } catch (error) {
                // Géré par le callback onError
            } finally {
                setIsLoading((prev) => ({ ...prev, missionDetail: false }));
            }
        };

        if (regions.length > 0 && suggestions.beneficiary.length > 0 && suggestions.transport.length > 0) {
            loadMission();
        }
    }, [isOpen, missionId, regions, suggestions.beneficiary, suggestions.transport]);

    useEffect(() => {
        if (suggestions.beneficiary.length === 0 || suggestions.transport.length === 0) return;

        setFormData((prev) => {
            let updatedBeneficiary = { ...prev.beneficiary };
            let changed = false;

            if (prev.beneficiary.transport) {
                const selectedTransport = suggestions.transport.find((t) => t.type === prev.beneficiary.transport);
                if (updatedBeneficiary.transportId !== (selectedTransport ? selectedTransport.id : null)) {
                    updatedBeneficiary = {
                        ...updatedBeneficiary,
                        transportId: selectedTransport ? selectedTransport.id : null,
                    };
                    changed = true;
                }
            }

            return changed ? { ...prev, beneficiary: updatedBeneficiary } : prev;
        });
    }, [suggestions.beneficiary, suggestions.transport]);

    useEffect(() => {
        if (alert.isOpen) {
            const timer = setTimeout(() => {
                setAlert({ ...alert, isOpen: false });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [alert]);

    return {
        currentStep,
        setCurrentStep,
        handleNext,
        handlePrevious,
        formData,
        setFormData,
        handleInputChange,
        handleAddNewSuggestion,
        isSubmitting,
        hasClickedSubmit,
        handleSubmit,
        isLoading,
        regions,
        regionNames,
        regionDisplayNames,
        suggestions,
        alert,
        setAlert,
        errorModal,
        setErrorModal,
        fieldErrors,
        calculateMissionDuration,
        validateStep1,
        validateStep2,
        validateStep3,
        handleReset,
        handleCancel,
    };
};

export default useMissionForm;
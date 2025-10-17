import { useState, useEffect, useCallback, useMemo } from "react";
import { useLieux, type Lieu } from "@/api/lieu/services";
import { useEmployees, type Employee } from "@/api/collaborator/services";
import { useTransports, type Transport } from "@/api/transport/services";
import {
  useCreateMission,
  useUpdateMission,
  useGetMissionAssignationByMissionId,
  type MissionDTOForm,
  type MissionAssignationDTOForm,
  type CreateMissionResponseData,
  type UpdateMissionResponseData,
  type ApiResponse,
} from "@/api/mission/services";

interface MissionFormProps {
  isOpen: boolean;
  onClose: () => void;
  missionId?: string;
  initialStartDate?: string | null;
  onFormSuccess: (type: string, message: string) => void;
}

interface BeneficiaryFormData {
  beneficiary: string;
  employeeId: string;
  matricule: string;
  function: string;
  base: string;
  direction: string;
  department: string;
  service: string;
  costCenter: string;
  transport: string;
  transportId: string | null;
  departureDate: string;
  departureTime: string;
  missionDuration: string;
  returnDate: string;
  returnTime: string;
}

interface FormData {
  missionTitle: string;
  description: string;
  location: string;
  startDate: string | null;
  endDate: string | null;
  missionType: string;
  beneficiary: BeneficiaryFormData;
  lieuId: string;
  type: string;
}

interface Suggestions {
  beneficiary: EmployeeSuggestion[];
  transport: TransportSuggestion[];
  mission: never[];
}

interface EmployeeSuggestion {
  id: string;
  name: string;
  displayName: string;
  employeeCode: string;
  jobTitle: string;
  site: string;
  direction: string;
  department: string;
  service: string;
  costCenter: string;
  acronym: string;
}

interface TransportSuggestion {
  id: string;
  type: string;
}

interface Alert {
  isOpen: boolean;
  type: "info" | "success" | "error";
  message: string;
}

interface ErrorModal {
  isOpen: boolean;
  message: string;
}

interface FieldErrors {
  [key: string]: string[];
}

interface MissionDurationResult {
  missionDuration: string;
  error?: string;
}

const useMissionForm = ({
  isOpen,
  onClose,
  missionId,
  initialStartDate,
  onFormSuccess,
}: MissionFormProps) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>({
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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hasClickedSubmit, setHasClickedSubmit] = useState<boolean>(false);
  const [alert, setAlert] = useState<Alert>({ isOpen: false, type: "info", message: "" });
  const [errorModal, setErrorModal] = useState<ErrorModal>({ isOpen: false, message: "" });
  const [regions, setRegions] = useState<Lieu[]>([]);
  const [regionNames, setRegionNames] = useState<string[]>([]);
  const [regionDisplayNames, setRegionDisplayNames] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestions>({
    beneficiary: [],
    transport: [],
    mission: [],
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const { data: lieuxData, isLoading: isRegionsLoading } = useLieux();
  const { data: employeesData, isLoading: isEmployeesLoading } = useEmployees();
  const { data: transportsData, isLoading: isTransportsLoading } = useTransports();
  const { data: missionResponse, isLoading: isMissionDetailLoading } = useGetMissionAssignationByMissionId(
    missionId || ""
  );

  const employeeSuggestions: EmployeeSuggestion[] = useMemo(() => {
    return (employeesData?.data || []).map((emp: Employee) => ({
      id: emp.employeeId,
      name: `${emp.lastName} ${emp.firstName}`,
      displayName: `${emp.lastName} ${emp.firstName} (${emp.direction?.acronym || "N/A"})`,
      employeeCode: emp.employeeCode,
      jobTitle: emp.jobTitle,
      site: emp.site?.siteName || "",
      direction: emp.direction?.directionName || "",
      department: emp.department?.departmentName || "",
      service: emp.service?.serviceName || "",
      costCenter: "",
      acronym: emp.direction?.acronym || "N/A",
    }));
  }, [employeesData]);

  const transportSuggestions: TransportSuggestion[] = useMemo(() => {
    return (transportsData?.data || []).map((transport: Transport) => ({
      id: transport.transportId,
      type: transport.type,
    }));
  }, [transportsData]);

  const isLoading = useMemo(
    () => ({
      regions: isRegionsLoading,
      employees: isEmployeesLoading,
      transports: isTransportsLoading,
      missions: false,
      missionDetail: isMissionDetailLoading,
    }),
    [isRegionsLoading, isEmployeesLoading, isTransportsLoading, isMissionDetailLoading]
  );

  // Update regions and display names
  useEffect(() => {
    if (lieuxData?.data) {
      const data = lieuxData.data;
      setRegions(data);
      setRegionNames(data.map((lieu) => lieu.nom));
      setRegionDisplayNames(data.map((lieu) => `${lieu.nom}${lieu.pays ? `/${lieu.pays}` : ""}`));
    }
  }, [lieuxData]);

  // Update suggestions
  useEffect(() => {
    setSuggestions((prev) => ({
      ...prev,
      beneficiary: employeeSuggestions,
      transport: transportSuggestions,
    }));
  }, [employeeSuggestions, transportSuggestions]);

  useEffect(() => {}, [fieldErrors]);

  const showAlert = useCallback((type: Alert["type"], message: string, errors: FieldErrors = {}) => {
    if (type === "error") {
      setErrorModal({ isOpen: true, message });
      setFieldErrors((prev) => ({
        ...prev,
        ...errors,
      }));
    } else {
      setAlert({ isOpen: true, type, message });
    }
  }, []);

  const calculateMissionDuration = useCallback((
    departureDate: string,
    returnDate: string,
    missionStartDate?: string | null
  ): MissionDurationResult => {
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

    const durationMs = returnD.getTime() - departure.getTime();
    let durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
    
    if (durationDays === 0 && departure.toDateString() === returnD.toDateString()) {
      durationDays = 1;
    }

    if (durationDays <= 0) {
      return { missionDuration: "", error: "La durée calculée n'est pas valide." };
    }

    return { missionDuration: durationDays.toString(), error: undefined };
  }, []);

  const validateStep1 = useCallback((): boolean => {
    const errors: FieldErrors = {};
    if (!formData.missionTitle) errors.missionTitle = ["Le titre de la mission est requis."];
    if (!formData.location) errors.lieuId = ["Le lieu est requis."];
    if (!formData.missionType) errors.missionType = ["Le type de mission est requis."];

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
  }, [formData]);

  const validateStep2 = useCallback((): boolean => {
    const errors: FieldErrors = {};
    const beneficiary = formData.beneficiary;

    if (!formData.startDate) errors.startDate = ["La date de début est requise."];
    if (!formData.endDate) errors.endDate = ["La date de fin est requise."];
    if (formData.endDate && formData.startDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        errors.endDate = ["La date de fin doit être postérieure ou égale à la date de début."];
      }
    }

    if (!beneficiary.beneficiary) errors["beneficiary.beneficiary"] = ["Le bénéficiaire est requis."];
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

    const fieldsToClean = ["beneficiary.beneficiary", "beneficiary.departureDate", "beneficiary.returnDate", "beneficiary.departureTime", "beneficiary.returnTime", "beneficiary.missionDuration"];
    fieldsToClean.forEach(field => {
      const formKey = field.split(".").pop() as keyof BeneficiaryFormData;
      const formValue = formData.beneficiary[formKey];
      if (formValue) {
        if (errors[field]) {
          errors[field] = errors[field].filter(e => !e.includes("est requis"));
          if (errors[field].length === 0) delete errors[field];
        }
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
  }, [formData, calculateMissionDuration]);

  const validateStep3 = useCallback((): boolean => {
    const errors: FieldErrors = {};
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
  }, [formData]);

  const handleAddNewSuggestion = useCallback((field: string, value: string) => {
    if (field === "location") {
      const newRegion: Lieu = { 
        lieuId: `temp-${Date.now()}`, 
        nom: value, 
        adresse: "", 
        ville: "", 
        codePostal: "", 
        pays: "Madagascar",
        createdAt: new Date().toISOString(),
        updatedAt: ""
      };
      setRegions((prev) => [...prev, newRegion]);
      setRegionNames((prev) => [...prev, value]);
      setRegionDisplayNames((prev) => [...prev, `${value}/Madagascar`]);
      setFormData((prev) => ({ 
        ...prev, 
        location: `${value}/Madagascar`, 
        lieuId: newRegion.lieuId 
      }));
      showAlert("success", `"${value}" ajouté aux suggestions pour ${field}`);
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.lieuId;
        return newErrors;
      });
    } else if (field === "transport") {
      const newTransport: TransportSuggestion = { id: `temp-${Date.now()}`, type: value };
      setSuggestions((prev) => ({
        ...prev,
        transport: [...prev.transport, newTransport],
      }));
      setFormData((prev) => ({
        ...prev,
        beneficiary: { 
          ...prev.beneficiary, 
          transport: value, 
          transportId: newTransport.id 
        },
      }));
      showAlert("success", `"${value}" ajouté aux suggestions pour ${field}`);
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors["beneficiary.transportId"];
        return newErrors;
      });
    }
  }, [showAlert]);

  const handleInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    section?: string
  ) => {
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
          const depDate = name === "departureDate" ? value : updatedBeneficiary.departureDate;
          const retDate = name === "returnDate" ? value : updatedBeneficiary.returnDate;
          const { missionDuration, error } = calculateMissionDuration(depDate, retDate, prev.startDate);

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
            ...prev, 
            beneficiary: { ...updatedBeneficiary, missionDuration } 
          };
        }

        return { ...prev, beneficiary: updatedBeneficiary };
      });

      setFieldErrors((prev) => {
        const updatedErrors = { ...prev };
        const fieldKey = `beneficiary.${name}`;
        if (value) {
          delete updatedErrors[fieldKey];
        } else {
          updatedErrors[fieldKey] = [`${name} est requis.`];
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
  }, [suggestions, regions, calculateMissionDuration]);

  // ----------------------------------------------------------------------
  // Fonctions de Navigation et de Soumission
  // ----------------------------------------------------------------------

  const handleNext = useCallback(() => {
    if (currentStep === 1) {
      const isValid = validateStep1();
      if (isValid) {
        setCurrentStep(2);
      } else {
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
  }, [currentStep, validateStep1, validateStep2, showAlert, fieldErrors]);

  const handlePrevious = useCallback(() => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else if (currentStep === 3) {
      setCurrentStep(2);
    }
  }, [currentStep]);

  const handleReset = useCallback(() => {
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
  }, [initialStartDate, showAlert]);

  const handleCancel = useCallback(() => {
    handleReset();
    onClose();
  }, [handleReset, onClose]);

  const createMutation = useCreateMission();
  const updateMutation = useUpdateMission(missionId || "");

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
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
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        const userId = userData?.userId || "";

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


        const missionData: MissionDTOForm = {
          missionType: formData.missionType,
          type: formData.type,
          name: formData.missionTitle,
          description: formData.description,
          startDate: formData.startDate ? new Date(formData.startDate).toISOString() : "",
          endDate: formData.endDate ? new Date(formData.endDate).toISOString() : "",
          lieuId: selectedRegion ? selectedRegion.lieuId : formData.lieuId,
          userId: userId,
          assignations: [
            {
              employeeId: selectedEmployee.id,
              transportId: beneficiary.transport
                ? suggestions.transport.find((t) => t.type === beneficiary.transport)?.id ?? null
                : null,
              departureDate: beneficiary.departureDate ? new Date(beneficiary.departureDate).toISOString() : "",
              departureTime: beneficiary.departureTime || "",
              returnDate: beneficiary.returnDate ? new Date(beneficiary.returnDate).toISOString() : "",
              returnTime: beneficiary.returnTime || "",
              type: formData.type,
              allocatedFund: 0, // Assuming not in form, or add
              duration: parseInt(beneficiary.missionDuration) || 0,
            } as MissionAssignationDTOForm,
          ],
        };

        let response: ApiResponse<CreateMissionResponseData | UpdateMissionResponseData>;
        let successMessage: string;

        if (missionId) {
          response = await updateMutation.mutateAsync(missionData);
          successMessage = "Mission mise à jour avec succès.";
        } else {
          response = await createMutation.mutateAsync(missionData);
          successMessage = "Mission créée et assignée avec succès.";
        }

        if (response.status !== 200) {
          throw new Error(response.message || "Erreur lors de la soumission");
        }

        onFormSuccess("success", successMessage);
        showAlert("success", successMessage);

        setHasClickedSubmit(false);
        setIsSubmitting(false);

        onClose();
      } catch (error: unknown) {
        console.error("Submit error:", error);
        const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue lors de la soumission";
        showAlert("error", errorMessage);
        setHasClickedSubmit(false);
        setIsSubmitting(false);
      }
    },
    [
      hasClickedSubmit,
      isSubmitting,
      formData,
      regions,
      suggestions.beneficiary,
      suggestions.transport,
      missionId,
      validateStep1,
      validateStep2,
      validateStep3,
      showAlert,
      fieldErrors,
      onFormSuccess,
      onClose,
      createMutation,
      updateMutation,
    ]
  );

  useEffect(() => {
    if (!isOpen || !missionId || !missionResponse?.data || regions.length === 0 || employeeSuggestions.length === 0 || transportSuggestions.length === 0) return;

    const data = missionResponse.data;
    const assignationData = data;
    const employeeData = assignationData.employee ?? {};
    const transportData = assignationData.transport ?? {};
    const missionData = assignationData.mission ?? {};

    const selectedEmployee = employeeSuggestions.find(e => e.id === (employeeData as unknown as Partial<Employee>).employeeId);
    const selectedTransport = transportSuggestions.find(t => t.id === (transportData as unknown as Partial<Transport>).transportId);
    const selectedRegion = regions.find(r => r.lieuId === missionData.lieuId);

    setFormData((prev) => {
      const name = missionData.name || "";
      const location = selectedRegion 
        ? `${selectedRegion.nom}${selectedRegion.pays ? `/${selectedRegion.pays}` : ""}` 
        : (missionData as { lieu?: { nom: string } }).lieu?.nom || "";

      const beneficiaryDetails = selectedEmployee ? {
        beneficiary: selectedEmployee.displayName || `${(employeeData as unknown as Partial<Employee>).lastName || ''} ${(employeeData as unknown as Partial<Employee>).firstName || ''}`,
        employeeId: selectedEmployee.id || "",
        matricule: selectedEmployee.employeeCode || "",
        function: selectedEmployee.jobTitle || "",
        base: selectedEmployee.site || "",
        direction: selectedEmployee.direction || "",
        department: selectedEmployee.department || "",
        service: selectedEmployee.service || "",
        costCenter: selectedEmployee.costCenter || "",
        transport: selectedTransport?.type || (transportData as unknown as Partial<Transport>).type || "",
        transportId: selectedTransport?.id || (transportData as unknown as Partial<Transport>).transportId || null,
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
  }, [isOpen, missionId, missionResponse, regions, employeeSuggestions, transportSuggestions]);

  useEffect(() => {
    if (suggestions.beneficiary.length === 0 || transportSuggestions.length === 0) return;

    setFormData((prev) => {
      let updatedBeneficiary = { ...prev.beneficiary };
      let changed = false;

      if (prev.beneficiary.transport) {
        const selectedTransport = transportSuggestions.find((t) => t.type === prev.beneficiary.transport);
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
  }, [suggestions.beneficiary, transportSuggestions]);

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
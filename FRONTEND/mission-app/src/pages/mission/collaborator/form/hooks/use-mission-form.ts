/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback, useMemo } from "react";
import { useLieux, type Lieu } from "@/api/lieu/services";
import { useTransports, type Transport } from "@/api/transport/services";
import {
  useCreateMission,
  useUpdateMission,
  useGetMissionById,
  type CreateMissionInput,
  type UpdateMissionInput,
  type CreateMissionResponse,
  type ApiResponse,
  type Mission,
  MissionTypeEnum,
  MissionStatusEnum,
  PaymentTypeEnum,
} from "@/api/mission/services";
import { useUserCollaboratorsMatricules } from "@/api/users/services";
import { useGetEmployeesByMatriculesSimple } from "@/api/collaborator/services";
import { type Employee } from "@/api/collaborator/services";

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
  isVisa: number;
  amountVisaEur: number | null;
  inclPdj: number;
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
    missionType: "Nationale",
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
      departureDate: initialStartDate || "",
      departureTime: "",
      missionDuration: "",
      returnDate: "",
      returnTime: "",
    },
    lieuId: "",
    type: "Indemnité",
    isVisa: 0,
    amountVisaEur: null,
    inclPdj: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hasClickedSubmit, setHasClickedSubmit] = useState<boolean>(false);
  const [alert, setAlert] = useState<Alert>({ isOpen: false, type: "info", message: "" });
  const [errorModal, setErrorModal] = useState<ErrorModal>({ isOpen: false, message: "" });
  const [regions, setRegions] = useState<Lieu[]>([]);
  const [regionNames, setRegionNames] = useState<string[]>([]);
  const [regionDisplayNames, setRegionDisplayNames] = useState<string[]>([]);
  const [transports, setTransports] = useState<Transport[]>([]);
  const [transportTypes, setTransportTypes] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestions>({
    beneficiary: [],
    transport: [],
    mission: [],
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [selectedLieuIsValid, setSelectedLieuIsValid] = useState<boolean>(true);
  const [selectedTransportIsValid, setSelectedTransportIsValid] = useState<boolean>(true);
  const [hasUserInteracted, setHasUserInteracted] = useState<boolean>(false);

  const { data: lieuxData, isLoading: isRegionsLoading } = useLieux();
  const { data: transportsData, isLoading: isTransportsLoading } = useTransports();
  const { data: missionResponse, isLoading: isMissionDetailLoading } = useGetMissionById(
    missionId || ""
  );

  const userData = useMemo(() => {
    return JSON.parse(localStorage.getItem("user") || "{}");
  }, []);

  const userId = userData?.userId;
  const { data: collaboratorsMatriculesResponse } = useUserCollaboratorsMatricules(userId);
  const matricules = useMemo(() => {
    return collaboratorsMatriculesResponse?.data || [];
  }, [collaboratorsMatriculesResponse]);

  const { data: employeesData, isLoading: isEmployeesLoading } = useGetEmployeesByMatriculesSimple(matricules);

  // Fonction pour obtenir des suggestions uniques d'employés
  const employeeSuggestions: EmployeeSuggestion[] = useMemo(() => {
    const employees = employeesData?.data || [];
    const uniqueEmployees = employees.reduce((acc: EmployeeSuggestion[], emp: Employee) => {
      const existingEmployee = acc.find(item => item.id === emp.employeeId);
      if (!existingEmployee) {
        acc.push({
          id: emp.employeeId,
          name: `${emp.lastName} ${emp.firstName}`,
          displayName: `${emp.lastName} ${emp.firstName} (${emp.direction?.acronym || "N/A"})`,
          employeeCode: emp.employeeCode || "",
          jobTitle: emp.jobTitle || "",
          site: emp.site?.siteName || "",
          direction: emp.direction?.directionName || "",
          department: emp.department?.departmentName || "",
          service: emp.service?.serviceName || "",
          costCenter: "",
          acronym: emp.direction?.acronym || "N/A",
        });
      }
      return acc;
    }, []);
    return uniqueEmployees;
  }, [employeesData]);

  // Fonction pour obtenir des suggestions de transport uniques
  const transportSuggestions: TransportSuggestion[] = useMemo(() => {
    const transportList = transportsData?.data || [];
    const uniqueTransports = transportList.reduce((acc: TransportSuggestion[], transport: Transport) => {
      const existingTransport = acc.find(item =>
        item.type.toLowerCase() === transport.type.toLowerCase()
      );
      if (!existingTransport) {
        acc.push({
          id: transport.transportId,
          type: transport.type,
        });
      }
      return acc;
    }, []);
    return uniqueTransports;
  }, [transportsData]);

  // Fonction pour vérifier si un lieu existe dans la base de données (sans le pays)
  const checkLieuExists = useCallback((locationValue: string): boolean => {
    if (!locationValue || regions.length === 0) return false;
   
    // Extraire uniquement le nom du lieu (sans le pays)
    const locationParts = locationValue.split("/");
    const locationName = locationParts[0]?.trim();
    if (!locationName) return false;
   
    // Vérifier si le lieu existe dans les régions chargées
    return regions.some(region =>
      region.nom.toLowerCase() === locationName.toLowerCase()
    );
  }, [regions]);

  // Fonction pour vérifier si un transport existe dans la base de données
  const checkTransportExists = useCallback((transportValue: string): boolean => {
    if (!transportValue || transports.length === 0) return true; // Retourne true si vide
   
    return transports.some(transport =>
      transport.type.toLowerCase() === transportValue.toLowerCase()
    );
  }, [transports]);

  // Fonction de validation centralisée pour le montant du visa
  const validateAmountVisa = useCallback((isVisa: number, amount: number | null): string | null => {
    if (isVisa === 1 && (!amount || amount <= 0)) {
      return "Le montant du visa est requis si le visa est sélectionné.";
    }
    return null;
  }, []);

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

  // Update regions and display names avec vérification d'unicité
  useEffect(() => {
    if (lieuxData?.data) {
      const data = lieuxData.data;
     
      // Filtrer les doublons basés sur le nom (insensible à la casse)
      const uniqueLieux = data.reduce((acc: Lieu[], lieu: Lieu) => {
        const existingLieu = acc.find(item =>
          item.nom.toLowerCase() === lieu.nom.toLowerCase()
        );
        if (!existingLieu) {
          acc.push(lieu);
        }
        return acc;
      }, []);
     
      setRegions(uniqueLieux);
     
      // Créer des noms uniques pour les régions
      const uniqueNames = uniqueLieux.map((lieu) => lieu.nom);
      const uniqueDisplayNames = uniqueLieux.map((lieu) =>
        `${lieu.nom}${lieu.pays ? `/${lieu.pays}` : ""}`
      );
     
      setRegionNames(uniqueNames);
      setRegionDisplayNames(uniqueDisplayNames);
    }
  }, [lieuxData]);

  // Update transports avec vérification d'unicité
  useEffect(() => {
    if (transportsData?.data) {
      const data = transportsData.data;
     
      // Filtrer les doublons basés sur le type (insensible à la casse)
      const uniqueTransports = data.reduce((acc: Transport[], transport: Transport) => {
        const existingTransport = acc.find(item =>
          item.type.toLowerCase() === transport.type.toLowerCase()
        );
        if (!existingTransport) {
          acc.push(transport);
        }
        return acc;
      }, []);
     
      setTransports(uniqueTransports);
     
      // Créer des types uniques
      const uniqueTypes = uniqueTransports.map((transport) => transport.type);
      setTransportTypes(uniqueTypes);
    }
  }, [transportsData]);

  // Update suggestions avec vérification d'unicité
  useEffect(() => {
    setSuggestions((prev) => ({
      ...prev,
      beneficiary: employeeSuggestions,
      transport: transportSuggestions,
    }));
  }, [employeeSuggestions, transportSuggestions]);

  // Validation du lieu sélectionné
  useEffect(() => {
    if (formData.location) {
      const isValid = checkLieuExists(formData.location);
      setSelectedLieuIsValid(isValid);
     
      if (!isValid) {
        setFieldErrors(prev => ({
          ...prev,
          lieuId: ["Le lieu sélectionné n'existe pas dans la base de données. Veuillez en choisir un existant ou en ajouter un nouveau."]
        }));
      } else {
        setFieldErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.lieuId;
          return newErrors;
        });
      }
    } else {
      setSelectedLieuIsValid(true);
    }
  }, [formData.location, checkLieuExists]);

  // Validation du transport sélectionné (uniquement si une valeur est fournie)
  useEffect(() => {
    const transportValue = formData.beneficiary.transport;
    if (transportValue && formData.missionType === "Nationale") {
      const isValid = checkTransportExists(transportValue);
      setSelectedTransportIsValid(isValid);
     
      if (!isValid) {
        setFieldErrors(prev => ({
          ...prev,
          "beneficiary.transport": ["Le moyen de transport sélectionné n'existe pas dans la base de données. Veuillez en choisir un existant ou en ajouter un nouveau."]
        }));
      } else {
        setFieldErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors["beneficiary.transport"];
          return newErrors;
        });
      }
    } else {
      // Si pas de transport ou mission internationale, c'est valide
      setSelectedTransportIsValid(true);
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors["beneficiary.transport"];
        return newErrors;
      });
    }
  }, [formData.beneficiary.transport, formData.missionType, checkTransportExists]);

  // Handle mission type changes for international missions
  useEffect(() => {
    console.log("Mission Type changed:", formData.missionType);
    if (formData.missionType === "Internationale") {
      setFormData((prev) => ({
        ...prev,
        type: "Note de frais",
        beneficiary: {
          ...prev.beneficiary,
          transport: "",
          transportId: null,
        },
      }));
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors["beneficiary.transport"];
        delete newErrors.type;
        return newErrors;
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        type: "Indemnité",
        isVisa: 0,
        amountVisaEur: null,
        inclPdj: 0,
      }));
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.type;
        delete newErrors.isVisa;
        delete newErrors.amountVisaEur;
        delete newErrors.inclPdj;
        return newErrors;
      });
    }
  }, [formData.missionType]);

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
  ): MissionDurationResult => {
    if (!departureDate || !returnDate) {
      return { missionDuration: "", error: undefined };
    }
    const departure = new Date(departureDate);
    const returnD = new Date(returnDate);
    if (isNaN(departure.getTime()) || isNaN(returnD.getTime())) {
      return { missionDuration: "", error: "Les dates de départ ou de retour sont invalides." };
    }
    if (returnD < departure) {
      return { missionDuration: "", error: "La date de retour doit être postérieure ou égale à la date de départ." };
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

  // Validation améliorée pour l'étape 1
  const validateStep1 = useCallback((): boolean => {
    const errors: FieldErrors = {};
   
    if (!formData.missionTitle) errors.missionTitle = ["Le titre de la mission est requis."];
    if (!formData.location) errors.lieuId = ["Le lieu est requis."];
    else if (!selectedLieuIsValid) {
      errors.lieuId = ["Le lieu sélectionné n'existe pas dans la base de données. Veuillez en choisir un existant ou en ajouter un nouveau."];
    }
   
    if (!formData.missionType) errors.missionType = ["Le type de mission est requis."];
    const beneficiary = formData.beneficiary;
    if (!beneficiary.beneficiary) errors["beneficiary.beneficiary"] = ["Le missionaire est requis."];
    if (!beneficiary.matricule) errors["beneficiary.matricule"] = ["Le matricule est requis."];
    if (!beneficiary.function) errors["beneficiary.function"] = ["La fonction est requise."];
    if (!beneficiary.base) errors["beneficiary.base"] = ["Le site est requis."];
    if (!beneficiary.direction) errors["beneficiary.direction"] = ["La direction est requise."];
    if (!beneficiary.department) errors["beneficiary.department"] = ["Le département est requis."];
    if (!beneficiary.service) errors["beneficiary.service"] = ["Le service est requis."];
   
    // Le transport n'est PAS obligatoire - seulement validation si une valeur est fournie
    if (formData.missionType === "Nationale" && beneficiary.transport && !selectedTransportIsValid) {
      errors["beneficiary.transport"] = ["Le transport sélectionné n'existe pas dans la base de données."];
    }
    
    // Validation pour les missions internationales
    if (formData.missionType === "Internationale") {
      // isVisa et inclPdj ont toujours une valeur (0 ou 1), donc pas de validation nécessaire
      // Utiliser la fonction de validation centralisée pour le montant du visa
      // Ne pas valider lors du chargement initial, seulement si l'utilisateur a interagi
      if (hasUserInteracted) {
        const visaError = validateAmountVisa(formData.isVisa, formData.amountVisaEur);
        if (visaError) {
          errors.amountVisaEur = [visaError];
        }
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
  }, [formData, selectedLieuIsValid, selectedTransportIsValid, validateAmountVisa, hasUserInteracted]);

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
    if (!beneficiary.departureDate) errors["beneficiary.departureDate"] = ["La date de départ est requise."];
    if (!beneficiary.returnDate) errors["beneficiary.returnDate"] = ["La date de retour est requise."];
    if (!beneficiary.departureTime) errors["beneficiary.departureTime"] = ["L'heure de départ est requise."];
    if (!beneficiary.returnTime) errors["beneficiary.returnTime"] = ["L'heure de retour est requise."];
    if (!beneficiary.missionDuration) errors["beneficiary.missionDuration"] = ["La durée de la mission est requise."];
    if (beneficiary.departureDate && beneficiary.returnDate) {
      const { error } = calculateMissionDuration(beneficiary.departureDate, beneficiary.returnDate);
      if (error) {
        errors["beneficiary.departureDate"] = [...(errors["beneficiary.departureDate"] || []), error];
        errors["beneficiary.returnDate"] = [...(errors["beneficiary.returnDate"] || []), error];
        errors["beneficiary.missionDuration"] = [...(errors["beneficiary.missionDuration"] || []), error];
      }
    }
    const fieldsToClean = ["beneficiary.departureDate", "beneficiary.returnDate", "beneficiary.departureTime", "beneficiary.returnTime", "beneficiary.missionDuration"];
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
      // Vérifier si le lieu existe déjà
      const lieuExists = regions.some(l => l.nom.toLowerCase() === value.toLowerCase());
      if (lieuExists) {
        // Ne pas afficher d'alerte, simplement sélectionner le lieu existant
        const existingLieu = regions.find(l => l.nom.toLowerCase() === value.toLowerCase());
        if (existingLieu) {
          setFormData((prev) => ({
            ...prev,
            location: `${existingLieu.nom}${existingLieu.pays ? `/${existingLieu.pays}` : ""}`,
            lieuId: existingLieu.lieuId
          }));
          setSelectedLieuIsValid(true);
          setFieldErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.lieuId;
            return newErrors;
          });
        }
        return;
      }
      const newRegion: Lieu = {
        lieuId: `temp-${Date.now()}`,
        nom: value,
        ville: "",
        codePostal: "",
        pays: "Madagascar",
        zoneId: "",
        longitude: 0,
        latitude: 0,
        createdAt: new Date().toISOString(),
        updatedAt: null
      };
     
      // Mettre à jour les états avec unicité garantie
      setRegions((prev) => {
        const newRegions = [...prev];
        if (!newRegions.some(r => r.nom.toLowerCase() === value.toLowerCase())) {
          newRegions.push(newRegion);
        }
        return newRegions;
      });
     
      setRegionNames((prev) => {
        const newNames = [...prev];
        if (!newNames.some(name => name.toLowerCase() === value.toLowerCase())) {
          newNames.push(value);
        }
        return newNames;
      });
     
      setRegionDisplayNames((prev) => {
        const newDisplayNames = [...prev];
        const displayValue = `${value}/Madagascar`;
        if (!newDisplayNames.some(display => display === displayValue)) {
          newDisplayNames.push(displayValue);
        }
        return newDisplayNames;
      });
     
      // Mettre à jour le formulaire
      setFormData((prev) => ({
        ...prev,
        location: `${value}/Madagascar`,
        lieuId: newRegion.lieuId
      }));
     
      // Valider le lieu
      setSelectedLieuIsValid(true);
     
      setAlert({
        isOpen: true,
        type: "success",
        message: `"${value}" a été ajouté aux lieux avec succès.`
      });
     
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.lieuId;
        return newErrors;
      });
     
    } else if (field === "transport") {
      // Vérifier si le transport existe déjà
      const transportExists = transports.some(t => t.type.toLowerCase() === value.toLowerCase());
      if (transportExists) {
        // Ne pas afficher d'alerte, simplement sélectionner le transport existant
        const existingTransport = transports.find(t => t.type.toLowerCase() === value.toLowerCase());
        const existingSuggestion = suggestions.transport.find(t => t.type.toLowerCase() === value.toLowerCase());
       
        if (existingTransport && existingSuggestion) {
          setFormData((prev) => ({
            ...prev,
            beneficiary: {
              ...prev.beneficiary,
              transport: existingTransport.type,
              transportId: existingTransport.transportId
            },
          }));
          setSelectedTransportIsValid(true);
          setFieldErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors["beneficiary.transport"];
            delete newErrors["beneficiary.transportId"];
            return newErrors;
          });
        }
        return;
      }
      const newTransport: Transport = {
        transportId: `temp-${Date.now()}`,
        type: value,
        createdAt: new Date().toISOString(),
        updatedAt: null
      };
     
      // Mettre à jour les états avec unicité garantie
      setTransports((prev) => {
        const newTransports = [...prev];
        if (!newTransports.some(t => t.type.toLowerCase() === value.toLowerCase())) {
          newTransports.push(newTransport);
        }
        return newTransports;
      });
     
      setTransportTypes((prev) => {
        const newTypes = [...prev];
        if (!newTypes.some(type => type.toLowerCase() === value.toLowerCase())) {
          newTypes.push(value);
        }
        return newTypes;
      });
     
      // Mettre à jour les suggestions avec unicité garantie
      setSuggestions((prev) => {
        const newTransportSuggestions = [...prev.transport];
        if (!newTransportSuggestions.some(t => t.type.toLowerCase() === value.toLowerCase())) {
          newTransportSuggestions.push({ id: newTransport.transportId, type: value });
        }
        return {
          ...prev,
          transport: newTransportSuggestions,
        };
      });
     
      // Mettre à jour le formulaire
      setFormData((prev) => ({
        ...prev,
        beneficiary: {
          ...prev.beneficiary,
          transport: value,
          transportId: newTransport.transportId
        },
      }));
     
      // Valider le transport
      setSelectedTransportIsValid(true);
     
      setAlert({
        isOpen: true,
        type: "success",
        message: `"${value}" a été ajouté aux moyens de transport avec succès.`
      });
     
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors["beneficiary.transport"];
        delete newErrors["beneficiary.transportId"];
        return newErrors;
      });
    }
  }, [regions, transports, suggestions.transport]);

  const handleInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; value: string | number } },
    section?: string
  ) => {
    const { name, value } = e.target;
    
    // Marquer que l'utilisateur a interagi avec le formulaire
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
    }
    
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
         
          // Vérifier la validité du transport sélectionné seulement si une valeur est fournie
          if (value && selectedTransport) {
            setSelectedTransportIsValid(true);
          } else if (value) {
            // Transport non trouvé dans les suggestions
            setSelectedTransportIsValid(false);
          } else {
            // Si vide, c'est valide (optionnel)
            setSelectedTransportIsValid(true);
          }
        }
        if (name === "departureDate" || name === "returnDate") {
          const depDate = name === "departureDate" ? String(value) : updatedBeneficiary.departureDate;
          const retDate = name === "returnDate" ? String(value) : updatedBeneficiary.returnDate;
          const { missionDuration, error } = calculateMissionDuration(depDate, retDate);
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
       
        if (name === "transport") {
          // Pour le transport, on vérifie d'abord s'il existe
          if (value) {
            const transportExists = checkTransportExists(String(value));
            setSelectedTransportIsValid(transportExists);
           
            if (!transportExists) {
              updatedErrors[fieldKey] = ["Le transport sélectionné n'existe pas dans la base."];
            } else {
              delete updatedErrors[fieldKey];
            }
          } else {
            delete updatedErrors[fieldKey];
            setSelectedTransportIsValid(true);
          }
        } else if (value) {
          delete updatedErrors[fieldKey];
        } else {
          let errorMessage = `${name} est requis.`;
          if (name === "beneficiary") {
            errorMessage = "Le missionaire est requis.";
          }
          updatedErrors[fieldKey] = [errorMessage];
        }
        if (name === "beneficiary" && value) {
          const relatedFields = ["matricule", "function", "base", "direction", "department", "service"];
          relatedFields.forEach((field) => {
            delete updatedErrors[`beneficiary.${field}`];
          });
        }
        return updatedErrors;
      });
    } else if (section === "compensation") {
      setFormData((prev) => ({
        ...prev,
        type: String(value),
      }));
      setFieldErrors((prev) => ({
        ...prev,
        type: value ? [] : ["Le type de compensation est requis."],
      }));
    } else {
      setFormData((prev) => {
        const updatedFormData = {
          ...prev,
          [name]: name === "startDate" || name === "endDate" || name === "missionType" ? String(value || "") : value,
        };
        // Gérer les champs spécifiques
        if (name === "isVisa") {
          updatedFormData.isVisa = Number(value);
          if (Number(value) === 0) {
            updatedFormData.amountVisaEur = null;
          }
        } else if (name === "amountVisaEur") {
          updatedFormData.amountVisaEur = value === "" ? null : Number(value);
        } else if (name === "inclPdj") {
          updatedFormData.inclPdj = Number(value);
        } else if (name === "location") {
          const selectedRegion = regions.find((region) => `${region.nom}${region.pays ? `/${region.pays}` : ""}` === value);
          updatedFormData.lieuId = selectedRegion ? selectedRegion.lieuId : "";
         
          if (value && selectedRegion) {
            setSelectedLieuIsValid(true);
          } else if (value) {
            setSelectedLieuIsValid(false);
          }
        }
        if (name === "startDate") {
          let updatedBeneficiary = prev.beneficiary;
          if (!prev.beneficiary.departureDate) {
            updatedBeneficiary = { ...prev.beneficiary, departureDate: String(value || "") };
          }
          return {
            ...updatedFormData,
            beneficiary: updatedBeneficiary,
          };
        }
        return updatedFormData;
      });
      setFieldErrors((prev) => {
        const updatedErrors = { ...prev };
        let errorKey = name;
        let errorMessage = "";
       
        switch (name) {
          case "missionTitle":
            errorMessage = "Le titre de la mission est requis.";
            break;
          case "missionType":
            errorMessage = "Le type de mission est requis.";
            break;
          case "startDate":
            errorMessage = "La date de début est requise.";
            break;
          case "endDate":
            errorMessage = "La date de fin est requise.";
            break;
          case "location":
            errorKey = "lieuId";
            if (value) {
              const lieuExists = checkLieuExists(String(value));
              setSelectedLieuIsValid(lieuExists);
              if (!lieuExists) {
                errorMessage = "Le lieu sélectionné n'existe pas dans la base de données. Veuillez en choisir un existant ou en ajouter un nouveau.";
              } else {
                delete updatedErrors[errorKey];
                break;
              }
            } else {
              errorMessage = "Le lieu est requis.";
              setSelectedLieuIsValid(false);
            }
            break;
          case "amountVisaEur":
            // Utiliser la fonction de validation centralisée
            // Ne valider que si l'utilisateur a interagi
            if (formData.missionType === "Internationale" && hasUserInteracted) {
              const visaError = validateAmountVisa(formData.isVisa, value === "" ? null : Number(value));
              if (visaError) {
                errorMessage = visaError;
                updatedErrors[errorKey] = [errorMessage];
              } else {
                delete updatedErrors[errorKey];
              }
            } else {
              delete updatedErrors[errorKey];
            }
            break;
          default:
            errorMessage = "";
        }
       
        if (value && name !== "location" && name !== "amountVisaEur") {
          delete updatedErrors[errorKey];
        } else if (name !== "description" && errorMessage) {
          updatedErrors[errorKey] = [errorMessage];
        }
        return updatedErrors;
      });
    }
  }, [suggestions, regions, calculateMissionDuration, checkLieuExists, checkTransportExists, formData.isVisa, formData.missionType, validateAmountVisa, hasUserInteracted]);

  // Navigation functions avec validation renforcée
  const handleNext = useCallback(() => {
    // Pour la première navigation, marquer que l'utilisateur a interagi
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
    }
    
    if (currentStep === 1) {
      const isValid = validateStep1();
      // Vérifier aussi les validations de lieu et transport
      const lieuValid = formData.location ? selectedLieuIsValid : true;
      // Le transport peut être vide, donc toujours valide sauf si une valeur invalide est fournie
      const transportValid = !formData.beneficiary.transport || selectedTransportIsValid;
     
      if (isValid && lieuValid && transportValid) {
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
  }, [currentStep, validateStep1, validateStep2, formData, selectedLieuIsValid, selectedTransportIsValid, showAlert, fieldErrors, hasUserInteracted]);

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
      missionType: "Nationale",
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
        departureDate: initialStartDate || "",
        departureTime: "",
        missionDuration: "",
        returnDate: "",
        returnTime: "",
      },
      lieuId: "",
      type: "Indemnité",
      isVisa: 0,
      amountVisaEur: null,
      inclPdj: 0,
    });
    setFieldErrors({});
    setSelectedLieuIsValid(true);
    setSelectedTransportIsValid(true);
    setHasUserInteracted(false);
    setCurrentStep(1);
    setAlert({ isOpen: true, type: "info", message: "Formulaire réinitialisé." });
  }, [initialStartDate]);

  const handleCancel = useCallback(() => {
    handleReset();
    onClose();
  }, [handleReset, onClose]);

  const createMutation = useCreateMission();
  const updateMutation = useUpdateMission();

  const convertFormValuesToEnums = useCallback((formData: FormData) => {
    let missionType: MissionTypeEnum;
    if (formData.missionType === "Nationale") {
      missionType = MissionTypeEnum.National;
    } else if (formData.missionType === "Internationale") {
      missionType = MissionTypeEnum.International;
    } else {
      missionType = MissionTypeEnum.Unknown;
    }
   
    let paymentType: PaymentTypeEnum;
    if (formData.type === "Indemnité") {
      paymentType = PaymentTypeEnum.Indemnite;
    } else if (formData.type === "Note de frais") {
      paymentType = PaymentTypeEnum.NoteFrais;
    } else {
      paymentType = PaymentTypeEnum.Indemnite;
    }
    const status = MissionStatusEnum.PendingApproval;
    return {
      missionType,
      paymentType,
      status
    };
  }, []);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (hasClickedSubmit || isSubmitting) {
        return;
      }
      if (!selectedLieuIsValid) {
        showAlert("error", "Le lieu sélectionné n'existe pas dans la base de données. Veuillez en choisir un existant ou en ajouter un nouveau.");
        return;
      }
      if (formData.missionType === "Nationale" && formData.beneficiary.transport && !selectedTransportIsValid) {
        showAlert("error", "Le transport sélectionné n'existe pas dans la base de données. Veuillez en choisir un existant ou en ajouter un nouveau.");
        return;
      }
      
      // Forcer la validation du visa pour la soumission finale
      setHasUserInteracted(true);
      
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
        const userId = userData?.userId || "";
        const locationName = formData.location?.split("/")[0] || "";
        const selectedRegion = regions.find((region) => region.nom === locationName);
        const beneficiary = formData.beneficiary;
        const selectedEmployee = suggestions.beneficiary.find((emp) => emp.id === beneficiary.employeeId);
        if (!selectedRegion || !selectedRegion.lieuId) {
          setErrorModal({ isOpen: true, message: "Le lieu sélectionné n'est pas valide." });
          return;
        }
       
        if (!selectedEmployee) {
          setErrorModal({ isOpen: true, message: "Le bénéficiaire sélectionné n'est pas valide." });
          return;
        }
       
        const { missionType, paymentType, status } = convertFormValuesToEnums(formData);
        console.log("Données avant envoi à l'API:", {
          missionType: {
            value: missionType,
            numeric: Number(missionType),
            expected: "1 pour Nationale, 2 pour Internationale"
          },
          paymentType: {
            value: paymentType,
            numeric: Number(paymentType),
            expected: "1 pour Indemnité, 2 pour Note de frais"
          },
          status: {
            value: status,
            numeric: Number(status)
          },
          transportId: beneficiary.transportId || "",
          isVisa: formData.isVisa,
          amountVisaEur: formData.amountVisaEur,
          inclPdj: formData.inclPdj
        });
        const missionData: CreateMissionInput = {
          missionType: missionType,
          type: paymentType,
          name: formData.missionTitle || "",
          description: formData.description || "",
          status: status,
          startDate: formData.startDate || "",
          endDate: formData.endDate || "",
          lieuId: selectedRegion.lieuId,
          employeeId: selectedEmployee.id,
          departureDate: beneficiary.departureDate || "",
          departureTime: beneficiary.departureTime || "",
          returnDate: beneficiary.returnDate || "",
          returnTime: beneficiary.returnTime || "",
          duration: parseInt(beneficiary.missionDuration as string) || 0,
          isValidated: 0,
          allocatedFund: 0,
          transportId: beneficiary.transportId || null,
          isVisa: formData.isVisa,
          amountVisaEur: formData.amountVisaEur,
          inclPdj: formData.inclPdj,
          userId: userId,
        };
        const cleanMissionData = Object.fromEntries(
          Object.entries(missionData).map(([key, value]) => [
            key,
            value === undefined ? "" : value
          ])
        ) as CreateMissionInput;
        console.log("Données finales envoyées à l'API:", cleanMissionData);
        let response: ApiResponse<Mission> | CreateMissionResponse;
        let successMessage: string;
        if (missionId) {
          const updateData: UpdateMissionInput = {
            missionId: missionId,
            ...cleanMissionData
          };
          response = await updateMutation.mutateAsync(updateData);
          successMessage = "Mission mise à jour avec succès.";
        } else {
          response = await createMutation.mutateAsync(cleanMissionData);
          successMessage = "Mission créée avec succès.";
        }
        if (response.status !== 200) {
          throw new Error(response.message || "Erreur lors de la soumission");
        }
        onFormSuccess("success", successMessage);
        setAlert({ isOpen: true, type: "success", message: successMessage });
        setHasClickedSubmit(false);
        setIsSubmitting(false);
        onClose();
      } catch (error: unknown) {
        console.error("Submit error:", error);
        const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue lors de la soumission";
        setErrorModal({ isOpen: true, message: errorMessage });
        setHasClickedSubmit(false);
        setIsSubmitting(false);
      }
    },
    [
      hasClickedSubmit,
      isSubmitting,
      formData,
      regions,
      transports,
      suggestions.beneficiary,
      missionId,
      userData,
      validateStep1,
      validateStep2,
      validateStep3,
      fieldErrors,
      onFormSuccess,
      onClose,
      createMutation,
      updateMutation,
      convertFormValuesToEnums,
      selectedLieuIsValid,
      selectedTransportIsValid,
    ]
  );

  // Reset hasUserInteracted quand le formulaire est ouvert
  useEffect(() => {
    if (isOpen) {
      setHasUserInteracted(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !missionId || !missionResponse?.data || regions.length === 0 || employeeSuggestions.length === 0 || transportSuggestions.length === 0) return;
    const missionData = missionResponse.data;
    if (missionData) {
      const selectedEmployee = employeeSuggestions.find(e => e.id === missionData.employeeId);
      const selectedTransport = transportSuggestions.find(t => t.id === missionData.transportId);
      const selectedRegion = regions.find(r => r.lieuId === missionData.lieuId);
      console.log("Chargement des données de mission pour édition:", {
        missionData: missionData,
        missionType: missionData.missionType,
        paymentType: missionData.type,
        selectedEmployee: selectedEmployee,
        selectedTransport: selectedTransport,
        selectedRegion: selectedRegion
      });
     
      // Convertir les enums en valeurs de formulaire avec gestion des null
      const missionType = missionData.missionType === MissionTypeEnum.National ? "Nationale" :
                         missionData.missionType === MissionTypeEnum.International ? "Internationale" : "Nationale";
     
      const paymentType = missionData.type === PaymentTypeEnum.Indemnite ? "Indemnité" :
                         missionData.type === PaymentTypeEnum.NoteFrais ? "Note de frais" : "Indemnité";
      setFormData((prev) => {
        const location = selectedRegion
          ? `${selectedRegion.nom}${selectedRegion.pays ? `/${selectedRegion.pays}` : ""}`
          : "";
        const beneficiaryDetails = selectedEmployee ? {
          beneficiary: selectedEmployee.displayName || `${missionData.employee?.lastName || ''} ${missionData.employee?.firstName || ''}`.trim() || "Non spécifié",
          employeeId: selectedEmployee.id || "",
          matricule: selectedEmployee.employeeCode || "",
          function: selectedEmployee.jobTitle || "",
          base: selectedEmployee.site || "",
          direction: selectedEmployee.direction || "",
          department: selectedEmployee.department || "",
          service: selectedEmployee.service || "",
          costCenter: selectedEmployee.costCenter || "",
          transport: selectedTransport?.type || missionData.transport?.type || "",
          transportId: selectedTransport?.id || missionData.transportId || "",
          departureDate: missionData.departureDate?.substring(0, 10) || "",
          departureTime: missionData.departureTime || "",
          missionDuration: missionData.duration?.toString() || "0",
          returnDate: missionData.returnDate?.substring(0, 10) || "",
          returnTime: missionData.returnTime || "",
        } : {
          ...prev.beneficiary,
          beneficiary: "Non spécifié",
          missionDuration: missionData.duration?.toString() || "0",
        };
        if (location) {
          setSelectedLieuIsValid(checkLieuExists(location));
        }
       
        if (beneficiaryDetails.transport) {
          setSelectedTransportIsValid(checkTransportExists(beneficiaryDetails.transport));
        }
        return {
          ...prev,
          missionTitle: missionData.name || "",
          description: missionData.description || "",
          location: location,
          lieuId: missionData.lieuId || "",
          startDate: missionData.startDate?.substring(0, 10) || null,
          endDate: missionData.endDate?.substring(0, 10) || null,
          missionType: missionType,
          type: paymentType,
          beneficiary: beneficiaryDetails,
          isVisa: missionData.isVisa || 0,
          amountVisaEur: missionData.amountVisaEur || null,
          inclPdj: missionData.inclPdj || 0,
        };
      });
    }
  }, [isOpen, missionId, missionResponse, regions, employeeSuggestions, transportSuggestions, checkLieuExists, checkTransportExists]);

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
    transports,
    transportTypes,
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
    selectedLieuIsValid,
    selectedTransportIsValid,
    validateAmountVisa,
    hasUserInteracted,
  };
};

export default useMissionForm;
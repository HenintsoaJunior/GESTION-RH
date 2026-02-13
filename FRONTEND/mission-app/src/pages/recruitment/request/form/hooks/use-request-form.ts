import { useState, useEffect, useCallback, useMemo } from "react";
import { useGetContractTypes, type ContractType } from "@/api/contract/services";
import { useEmployeeInformations, type EmployeeInformations } from "@/api/users/services";
import type { RequestEditDTO } from "@/api/recruitment/service";
import { addWeeks } from "date-fns";

type FieldErrors = { [key: string]: string[] };

interface RecruitmentRequestFormProps {
  mode: "create" | "edit";
  initialData?: RequestEditDTO;
  initialContractId?: string;
  initialStartDate?: string | null;
}

export interface RecruitmentRequestForm {
  post: string;
  effective: number | null;
  contractId: string | null;
  contractPrecision: string | null;
  monthDuration: number | null;
  sites: string[];

  // traçabilité
  applicantUserId: string;
  creatorId: string;
  
  // rattachements
  direction: string | null;
  hierarchicalManagerId: string;
  functionalManagerId: string;

  // remplacement
  isReplacement: boolean;
  replacementReasonId: string | null;
  replacementDate: string | null;
  reasonPrecision: string | null;
  lastTitularId: string | null;

  beginningDate: string;
  isPlanned: boolean;
  notPlannedReason: string | null;
}

export interface CurrentUser 
{
  id: string;
  name: string;
  jobTitle: string;
  direction: string;
  department: string;
  service: string;
}


const useRecruitmentForm = ({ 
  mode = "create",
  initialData, 
  initialContractId = "" 
} : RecruitmentRequestFormProps) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<RecruitmentRequestForm>({
    post: "",
    effective: null,
    contractId: initialContractId || null,
    contractPrecision: null,
    monthDuration: null,
    sites: [],
    applicantUserId: "",
    creatorId: "",
    hierarchicalManagerId: "",
    functionalManagerId: "",
    direction: null,
    isReplacement: false,
    replacementReasonId: null,
    replacementDate: null,
    reasonPrecision: null,
    lastTitularId: null,
    isPlanned: false,
    notPlannedReason: null,
    beginningDate: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const { data: contractsResponse } = useGetContractTypes();

  const userId = JSON.parse(localStorage.getItem("user") || "null")?.userId;
  const { data: infosResponse } = useEmployeeInformations(userId);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const contracts: ContractType[] = contractsResponse?.data || [];
  const employee = infosResponse as EmployeeInformations;

  const currentUserId = useMemo(() => {
    const emp = infosResponse;
    return emp?.id ?? "";
  }, [infosResponse]);

  // prefill applicantUserId from current user if available
  useEffect(() => {
    if(currentUserId && !formData.applicantUserId) {
      setFormData((prev) => ({ 
        ...prev, 
        applicantUserId: currentUserId ?? formData.applicantUserId,
        creatorId: currentUserId
      }));
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy.applicantUserId;
        return copy;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

// Pré-remplissage des données initiales
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        post: initialData.post ?? "",
        effective: initialData.effective ?? null,
        contractId: initialData.contractId ?? "other",
        contractPrecision: initialData.contractPrecision ?? null,
        monthDuration: initialData.monthDuration ?? null,
        sites: initialData.sites ?? [],
        applicantUserId: initialData.applicantUserId ?? currentUserId ?? "",
        creatorId: currentUserId ?? "",
        direction: initialData.direction ?? null,
        hierarchicalManagerId: initialData.hierarchicalManagerId ?? "",
        functionalManagerId: initialData.functionalManagerId ?? "",
        isReplacement: initialData.isReplacement ?? false,
        replacementReasonId: initialData.replacementReasonId ?? "other",
        replacementDate: initialData.replacementDate ?? null,
        reasonPrecision: initialData.reasonPrecision ?? null,
        lastTitularId: initialData.lastTitularId ?? null,
        isPlanned: initialData.isPlanned ?? true,
        notPlannedReason: initialData.notPlannedReason ?? null,
        beginningDate: initialData.beginningDate ?? "",
      });

      setCurrentStep(1);
      setFieldErrors({});
    }
  }, [mode, initialData, currentUserId]);


  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; value: string | number | boolean | null } }) => {
      const { name, value } = e.target;

      // handle site checkboxes (name format: site_${siteId})
      if (name.startsWith("site_")) {
        const siteId = name.replace("site_", "");
        setFormData((prev) => {
          const isChecked = value === "true";
          const updatedSites = isChecked
            ? [...prev.sites, siteId]
            : prev.sites.filter((id) => id !== siteId);
          return {
            ...prev,
            sites: updatedSites,
          };
        });
        setFieldErrors((prev) => {
          const copy = { ...prev };
          delete copy.sites;
          return copy;
        });
      } else if (name === "isReplacement") {
        // handle boolean checkbox for isReplacement
        const isChecked = value === "true";
        setFormData((prev) => ({
          ...prev,
          isReplacement: isChecked,
        }));
        setFieldErrors((prev) => {
          const copy = { ...prev };
          delete copy.isReplacement;
          return copy;
        });
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: value === "" ? "" : value
        }));

        setFieldErrors((prev) => {
          const copy = { ...prev };
          delete copy[name];
          return copy;
        });
      }
    },
    []
  );

  const validateStep = useCallback((isRegularisation:boolean) => {
    const errors: FieldErrors = {};
    
    const postValue = formData.post ?? "";
    const effective = formData.effective ?? null;
    const effectiveNumber = Number(effective);
    const contractId = formData.contractId;
    const applicantId = currentUserId;
    const hierarchicalId = formData.hierarchicalManagerId;
    const functionalId = formData.functionalManagerId;
    
    const contractPrecision = formData.contractPrecision ?? null;
    const monthDuration = formData.monthDuration ?? null;
    const monthNumber = Number(monthDuration);

    // switch-style checks
    const fields = ["post", "effective", "contractId", "applicantUserId", 
      "hierarchicalManagerId", "functionalManagerId"] as const;
    fields.forEach((f) => {
      switch (f) {
        case "post":
          if (!postValue || String(postValue).trim() === "") errors.post = ["Le poste est requis."];
          break;
        case "effective":
          if (!effective || !effectiveNumber || effectiveNumber <= 0) errors.effective = ["L'effectif doit être un nombre supérieur à 0."];
          break;
        case "contractId":
          if (!contractId || contractId.trim() === "") errors.contractId = ["Veuillez sélectionner un contrat."];
          break;
        case "applicantUserId":
          if (isRegularisation && (!applicantId || applicantId.trim() === "")) errors.applicantUserId = ["Le demandeur est requis."];
          break;
        case "hierarchicalManagerId":
          if (!hierarchicalId || hierarchicalId.trim() === "") errors.hierarchicalManagerId = ["Le rattachement hiérarchique est requis."];
          break;
        case "functionalManagerId":
          if (!functionalId || functionalId.trim() === "") errors.functionalManagerId = ["Le rattachement fonctionnel est requis."];
          break;
      }
    });

    // validate at least one site is selected
    if (!formData.sites || formData.sites.length === 0) {
      errors.sites = ["Veuillez sélectionner au moins un site."];
    }

    // contract-specific rules: detect CDD or "other"
    const selectedContract = contracts.find((c) => c.contractTypeId === contractId) || null;
    
    const isCDD = String(selectedContract?.code) === "CDD";
    const isOther = String(contractId).toLowerCase() === "other";

    if (isCDD || isOther) {
      if (!monthDuration || !monthNumber || monthNumber <= 0) {
        errors.monthDuration = ["La durée (mois) est requise et doit être positive."];
      }
    }
    if (isOther) {
      if (!contractPrecision || String(contractPrecision).trim() === "") {
        errors.contractPrecision = ["La précision du contrat est requise pour 'Autre'."];
      }
    }

    setFieldErrors((prev) => {
      const merged = { ...prev, ...errors };
      Object.keys(merged).forEach((k) => {
        if (Array.isArray(merged[k]) && merged[k].length === 0) delete merged[k];
      });
      return merged;
    });

    console.log("form :",formData);

    return Object.keys(errors).length === 0;
  }, [formData, contracts, currentUserId]);

// Fonction de DATE
  const toStartOfDay = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const validateStep2 = useCallback(() => {
    const errors: FieldErrors = {};

    const beginningDateValue = formData.beginningDate ?? "";
    const isReplacement = formData.isReplacement;
    const replacementReasonId = formData.replacementReasonId ?? "";
    const replacementDate = formData.replacementDate ?? "";
    const reasonPrecision = formData.reasonPrecision ?? "";
    const isOtherReason = replacementReasonId === "other";
    const isPlanned = formData.isPlanned;
    const notPlannedReason = formData.notPlannedReason ?? "";

    // Date souhaitée is ALWAYS required (not just when isReplacement is true)
    if (!beginningDateValue || String(beginningDateValue).trim() === "") {
      errors.beginningDate = ["La date de début souhaitée est requise."];
    }
    if (beginningDateValue) {
      const today = toStartOfDay(new Date());
      const beginningDate = toStartOfDay(new Date(beginningDateValue));
      const minDate = addWeeks(today, 1);

      if (beginningDate < minDate) {
        errors.beginningDate = [
          "La date de début souhaitée doit être au moins une semaine après aujourd’hui."
        ];
      }
    }

    // If isReplacement is checked, validate replacement-specific fields
    if (isReplacement) {
      // Motif de remplacement is required when isReplacement = true
      if (!replacementReasonId || String(replacementReasonId).trim() === "") {
        errors.replacementReasonId = ["Le motif de remplacement est requis."];
      }

      // Date de remplacement is required when isReplacement = true
      if (!replacementDate || String(replacementDate).trim() === "") {
        errors.replacementDate = ["La date de remplacement est requise."];
      }

      // If reason is "Autre", precision is required
      if (isOtherReason) {
        if (!reasonPrecision || String(reasonPrecision).trim() === "") {
          errors.reasonPrecision = [`La précision du motif est requise pour le choix "Autre".`];
        }
      }

      // Validation du dernier titulaire
      if (!formData.lastTitularId || String(formData.lastTitularId).trim() === "") {
        errors.lastTitularId = ["Le dernier titulaire du poste est requis."];
      }
    }

    if(!isPlanned) {
      if(!notPlannedReason || String(notPlannedReason).trim() === "") {
        errors.notPlannedReason = ["Les explications sur le budget sont requises."];
      }
    }

    setFieldErrors((prev) => {
      const merged = { ...prev, ...errors };
      Object.keys(merged).forEach((k) => {
        if (Array.isArray(merged[k]) && merged[k].length === 0) delete merged[k];
      });
      return merged;
    });

    // console.log(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleNext = useCallback((isRegularisation:boolean) => {
    // validate current step BEFORE moving to next
    let isValid = false;
    if (currentStep === 1) {
      isValid = validateStep(isRegularisation);
    } else if (currentStep === 2) {
      isValid = validateStep2();
    }

    if (isValid) {
      setCurrentStep((s) => Math.min(s + 1, 2)); // move to next step (max step 2)
    }
    // errors already set by validate functions; parent component will show them
  }, [currentStep, validateStep, validateStep2]);

  const handlePrevious = useCallback(() => {
    setCurrentStep((s) => Math.max(1, s - 1));
  }, []);

  const handleReset = useCallback(() => {
    setFormData({
      post: "",
      effective: null,
      contractId: null,
      contractPrecision: null,
      monthDuration: null,
      sites: [],
      applicantUserId: currentUserId || "",
      creatorId: currentUserId || "",
      direction: null,
      hierarchicalManagerId: "",
      functionalManagerId: "",
      isReplacement: false,
      replacementReasonId: null,
      replacementDate: null,
      reasonPrecision: null,
      lastTitularId: null,
      beginningDate: "",
      isPlanned: false,
      notPlannedReason: null
    });
    setFieldErrors({});
    setCurrentStep(1);
  }, [currentUserId]);

  const currentUser: CurrentUser | null = employee
  ? {
      id: employee.id,
      name: employee.name,
      direction: employee.direction,
      department: employee.department,
      service: employee.service,
      jobTitle: employee.post,
    }
  : null;


  return {
    currentStep,
    setCurrentStep,
    formData,
    setFormData,
    fieldErrors,
    setFieldErrors,
    contracts,
    currentUser,
    handleInputChange,
    validateStep,
    validateStep2,
    handleNext,
    handlePrevious,
    handleReset,
  };
};

export default useRecruitmentForm;

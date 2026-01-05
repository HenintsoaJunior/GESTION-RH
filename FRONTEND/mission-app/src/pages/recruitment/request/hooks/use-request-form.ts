import { useState, useEffect, useCallback, useMemo } from "react";
import { useGetContractTypes, type ContractType } from "@/api/contract/services";
import { useEmployeeInformations, type EmployeeInformations } from "@/api/users/services";
import type { RequestEditDTO } from "@/api/recruitment/service";

type FieldErrors = { [key: string]: string[] };

interface RecruitmentRequestFormProps {
  mode: "create" | "edit";
  initialData?: RequestEditDTO;
  initialContractId?: string;
  initialStartDate?: string | null;
}

export interface RecruitmentRequestForm 
{
  post: string;
  effective: number | null;
  contractId: string | null;
  contractPrecision: string | null;
  monthDuration: number | null;
  sites: string[];
  applicantUserId: string;

  isReplacement: boolean;
  replacementReasonId: string | null;
  replacementDate: string | null;
  reasonPrecision: string | null;
  lastTitularId: string | null;
  beginningDate: string;
  isPlanned: boolean;
  notPlannedReason: string | null;
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
  const { data: infosResponse } = useEmployeeInformations();

  const contracts: ContractType[] = contractsResponse?.data || [];
  const employee = infosResponse as EmployeeInformations;

  const currentUserId = useMemo(() => {
// Normalize possible shapes
    const emp = infosResponse;
    return emp?.id ?? "";
  }, [infosResponse]);

  // prefill applicantUserId from current user if available
  useEffect(() => {
    if(currentUserId && !formData.applicantUserId) {
      setFormData((prev) => ({ ...prev, applicantUserId: String(currentUserId) }));
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
        contractId: initialData.contractId ?? null,
        contractPrecision: initialData.contractPrecision ?? null,
        monthDuration: initialData.monthDuration ?? null,
        sites: initialData.sites ?? [],
        applicantUserId: currentUserId ?? "",
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
        setFormData((prev) => {
          const next = { ...prev, [name]: name === "effective" || name === "monthDuration" ? (value === "" ? "" : Number(value)) : value };
          return next;
        });

        setFieldErrors((prev) => {
          const copy = { ...prev };
          delete copy[name];
          return copy;
        });
      }
    },
    []
  );

  const validateStep = useCallback(() => {
    const errors: FieldErrors = {};

    const postValue = formData.post ?? "";
    const effective = formData.effective;
    const contractId = formData.contractId ?? "other";
    const applicantId = currentUserId;

    console.log("Contract ID : ", contractId);
    const contractPrecision = formData.contractPrecision ?? null;
    const monthDuration = formData.monthDuration ?? null;

    // switch-style checks
    const fields = ["post", "effective", "contractId", "applicantUserId"] as const;
    fields.forEach((f) => {
      switch (f) {
        case "post":
          if (!postValue || String(postValue).trim() === "") errors.post = ["Le poste est requis."];
          break;
        case "effective":
          if (effective != null && effective <= 0) errors.effective = ["L'effectif doit être un nombre supérieur à 0."];
          break;
        case "contractId":
          if (!contractId || String(contractId).trim() === "") errors.contractId = ["Veuillez sélectionner un contrat."];
          break;
        case "applicantUserId":
          if (!applicantId || String(applicantId).trim() === "") errors.applicantUserId = ["Le demandeur est requis."];
          break;
      }
    });

    // validate at least one site is selected
    if (!formData.sites || formData.sites.length === 0) {
      errors.sites = ["Veuillez sélectionner au moins un site."];
    }

    // contract-specific rules: detect CDD or "other"
    const selectedContract = contracts.find((c) => c.code === contractId) || null;
    const isCDD = Boolean(selectedContract) && ((selectedContract?.code || "").toUpperCase() === "CDD" || (selectedContract?.label || "").toUpperCase().includes("CDD"));
    const isOther = String(contractId).toLowerCase() === "other";

    if (isCDD || isOther) {
      if(monthDuration != null && monthDuration <= 0) {
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

    return Object.keys(errors).length === 0;
  }, [formData, contracts]);

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
          errors.reasonPrecision = ["La précision du motif est requise pour 'Autre'."];
        }
      }

      // Validation du dernier titulaire
      if (!formData.lastTitularId || String(formData.lastTitularId).trim() === "") {
        errors.lastTitularId = ["Le dernier titulaire est requis pour un remplacement."];
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

    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleNext = useCallback(() => {
    // validate current step BEFORE moving to next
    let isValid = false;
    if (currentStep === 1) {
      isValid = validateStep();
    } else if (currentStep === 2) {
      isValid = validateStep2();
    }

    if (isValid) {
      setCurrentStep((s) => Math.min(s + 1, 2)); // move to next step (max step 2)
    }
    // errors already set by validate functions; parent component will show them
  }, [currentStep, validateStep, validateStep2, formData]);

  const handlePrevious = useCallback(() => {
    setCurrentStep((s) => Math.max(1, s - 1));
  }, []);

  const handleReset = useCallback(() => {
    setFormData({
      post: "",
      effective: 0,
      contractId: null,
      contractPrecision: null,
      monthDuration: null,
      sites: [],
      applicantUserId: currentUserId || "",
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

  return {
    currentStep,
    setCurrentStep,
    formData,
    setFormData,
    fieldErrors,
    setFieldErrors,
    contracts,
    currentUser: employee ? {
      id: employee.id,
      direction: employee.direction,
      department: employee.department,
      service: employee.service,
      managerName: employee.superiorName,
      managerFunction: employee.superiorPost,
    } : null,
    handleInputChange,
    validateStep,
    validateStep2,
    handleNext,
    handlePrevious,
    handleReset,
  };
};

export default useRecruitmentForm;
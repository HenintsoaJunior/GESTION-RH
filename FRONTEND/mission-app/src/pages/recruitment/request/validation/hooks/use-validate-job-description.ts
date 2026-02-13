import { useCallback, useEffect, useState } from "react";
import { useValidateJobDescriptionMutation } from "@/api/recruitment/service";

export interface JobDescriptionValidationFormDTO {
  jobDescId: string;
  validatorId: string;
}

interface FieldErrors {
  [key: string]: string[];
}

const useValidateJobDescription = () => {
  const [formData, setFormData] = useState<JobDescriptionValidationFormDTO>({
    jobDescId: "",
    validatorId: "",
  });

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const validateMutation = useValidateJobDescriptionMutation();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user?.userId) {
      setFormData(prev => ({ ...prev, validatorId: user.userId }));
    }
  }, []);

  const setJobDescId = useCallback((id: string) => {
    setFormData(prev => ({ ...prev, jobDescId: id }));
  }, []);

  // const validateForm = useCallback((data: JobDescriptionValidationFormDTO) => {
  //   const errors: FieldErrors = {};

  //   if (!data.jobDescId) errors.jobDescId = ["TDR manquant"];
  //   if (!data.validatorId) errors.validatorId = ["Validateur manquant"];

  //   setFieldErrors(errors);
  //   return Object.keys(errors).length === 0;
  // }, []);

  const submitValidation = async (data: JobDescriptionValidationFormDTO) => {
    // if (!validateForm(formData)) return;
    await validateMutation.mutateAsync(data);
  };

  const handleReset = () => {
    setFieldErrors({});
  };

  return {
    formData,
    setFormData,
    fieldErrors,
    setJobDescId,
    submitValidation,
    handleReset,
    isLoading: validateMutation.isPending,
  };
};

export default useValidateJobDescription;

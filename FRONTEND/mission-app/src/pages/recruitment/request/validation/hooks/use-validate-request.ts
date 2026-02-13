import { useState, useCallback, useEffect, type Dispatch, type SetStateAction } from "react";
import { useValidateRecruitmentRequest } from "@/api/recruitment/service";
import type { RequestValidationFormDTO } from "../components/refuse-request-form";


interface FieldErrors {
    [key: string]: string[];
}

interface UseValidateRequestReturn {
    formData: RequestValidationFormDTO;
    setFormData: Dispatch<SetStateAction<RequestValidationFormDTO>>;
    fieldErrors: FieldErrors;
    handleInputChange: (e: { target: { name: string; value: string } }) => void;
    validateForm: (formData:RequestValidationFormDTO) => boolean;
    handleReset: () => void;
    submitValidation: (data: RequestValidationFormDTO) => Promise<void>;
    setRequestId: (id: string) => void;
}

const useValidateRequest = (): UseValidateRequestReturn => {
    const [formData, setFormData] = useState<RequestValidationFormDTO>({
        requestId: "",
        validatorId: "",
        status: "",
        comments: null
    });

    const validate = useValidateRecruitmentRequest();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (user?.userId) {
            setFormData(prev => ({ ...prev, validatorId: user.userId }));
        }
    }, []);

    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

    const setRequestId = useCallback((id: string) => {
        setFormData(prev => ({ ...prev, requestId: id }));
    }, []);

    const handleInputChange = (e: { target: { name: string; value: string } }) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = useCallback((formData:RequestValidationFormDTO) => {
        const errors: FieldErrors = {};

        if (!formData.status) errors.status = ["La décision est requise."];

        if (formData.status === "Refuser" && !formData.comments)
            errors.comments = ["Veuillez indiquer le motif du refus."];

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    }, [setFieldErrors]);

    const handleReset = () => {
        setFormData(prev => ({
            ...prev,
            status: "",
            comments: null
        }));
        setFieldErrors({});
    };

    const submitValidation = async (data: RequestValidationFormDTO) => {
        // console.log("Validation envoyée :", data);
    // Envoi du formulaire vers le backend
        await validate.mutateAsync(data);
    };

    return {
        formData,
        setFormData,
        fieldErrors,
        handleInputChange,
        validateForm,
        handleReset,
        submitValidation,
        setRequestId
    };
};

export default useValidateRequest;

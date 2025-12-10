import { useState, useCallback, useEffect } from "react";
import type { RequestValidationFormDTO } from "../components/validation-form";

interface FieldErrors {
    [key: string]: string[];
}

interface UseValidateRequestReturn {
    formData: RequestValidationFormDTO;
    fieldErrors: FieldErrors;
    handleInputChange: (e: { target: { name: string; value: string } }) => void;
    validateForm: () => boolean;
    handleReset: () => void;
    submitValidation: (data: RequestValidationFormDTO) => Promise<void>;
    setRequestId: (id: string) => void;
}

const useValidateRequest = (): UseValidateRequestReturn => {

    const [formData, setFormData] = useState<RequestValidationFormDTO>({
        requestId: "",
        validatorId: "",
        status: "",
        signature: null,
        comments: null
    });

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

    const validateForm = () => {
        const errors: FieldErrors = {};

        if (!formData.status)
            errors.status = ["La décision est requise."];

        if (formData.status === "Approuver" && !formData.signature)
            errors.signature = ["La signature est requise."];

        if (formData.status === "Refuser" && !formData.comments)
            errors.comments = ["Veuillez indiquer le motif du refus."];

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleReset = () => {
        setFormData({
            requestId: "",
            validatorId: "",
            status: "",
            signature: null,
            comments: null
        });
        setFieldErrors({});
    };

    const submitValidation = async (data: RequestValidationFormDTO) => {
        console.log("Validation envoyée :", data);
        return new Promise<void>((resolve) => setTimeout(resolve, 500));
    };

    return {
        formData,
        fieldErrors,
        handleInputChange,
        validateForm,
        handleReset,
        submitValidation,
        setRequestId
    };
};

export default useValidateRequest;

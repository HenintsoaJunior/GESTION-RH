import { useCallback } from "react";
import { apiGet,apiPost } from "utils/apiUtils";
import { handleValidationError } from "utils/validation";
import { getInitials } from "utils/initials";

// Fonction pour formater les données d'un validateur
export const formatValidatorData = (validator, role) => {
  if (!validator) return null;

  // Générer le titre et le sous-titre dynamiquement à partir du type et des données du validateur
  const typeInfo = {
    subtitle: validator.department || role || "Non spécifié"
  };

  return {
    name: validator.name || "Non spécifié",
    initials: getInitials(validator.name || "John Doe"),
    email: validator.email || "Non spécifié",
    department: validator.department || "Non spécifié",
    position: validator.position || typeInfo.title,
    title: typeInfo.title,
    subtitle: typeInfo.subtitle
  };
};


export const useGetRecruitmentValidationsByValidator = () => {
  return useCallback(async (validatorId, page = 1, pageSize = 10) => {
    if (!validatorId) {
      throw new Error("Validator ID is required");
    }
    try {
      const response = await apiPost(
        `/api/RecruitmentValidation/requests/${validatorId}?page=${page}&pageSize=${pageSize}`,
        {}
      );
      const { results, totalCount } = response;

      const formattedData = results.map((validation) => ({
        recruitmentValidationId: validation.recruitmentValidationId,
        status: validation.status || "Non défini",
        toWhom: validation.toWhom || "Non spécifié",
        createdAt: validation.createdAt,
        recruitmentRequestId: validation.recruitmentRequestId,
        validator: formatValidatorData(validation.validator, validation.type),
        type: validation.type,
        recruitmentRequest: {
          recruitmentRequestId: validation.recruitmentRequest?.recruitmentRequestId,
          positionTitle: validation.recruitmentRequest?.positionTitle || "Non spécifié",
          positionCount: validation.recruitmentRequest?.positionCount || 0,
          contractDuration: validation.recruitmentRequest?.contractDuration || "Non spécifié",
          desiredStartDate: validation.recruitmentRequest?.desiredStartDate,
          status: validation.recruitmentRequest?.status || "Non défini",
          newPositionExplanation: validation.recruitmentRequest?.newPositionExplanation || "",
          replacementDate: validation.recruitmentRequest?.replacementDate,
          formerEmployeeName: validation.recruitmentRequest?.formerEmployeeName || "",
        },
        creator: formatValidatorData(validation.creator, "Creator"),
      }));

      return {
        results: formattedData,
        totalCount: totalCount || 0,
      };
    } catch (error) {
      handleValidationError(error);
      throw error;
    }
  }, []);
};

// Hook pour récupérer les validations de recrutement par recruitmentRequestId
export const useGetRecruitmentValidationsByRequestId = () => {
  return useCallback(async (recruitmentRequestId) => {
    if (!recruitmentRequestId) {
      throw new Error("Recruitment Request ID is required");
    }

    try {
      const response = await apiGet(`/api/RecruitmentValidation/by-request/${recruitmentRequestId}`);
      const data = Array.isArray(response) ? response : [];

      const formattedData = data.map((validation) => {
        const formattedValidation = {
          recruitmentValidationId: validation.recruitmentValidationId,
          status: validation.status || "Non défini",
          toWhom: validation.toWhom || "Non spécifié",
          createdAt: validation.createdAt,
          recruitmentRequestId: validation.recruitmentRequestId,
          validator: formatValidatorData(validation.validator, validation.type),
          type: validation.type,
          recruitmentRequest: {
            recruitmentRequestId: validation.recruitmentRequest?.recruitmentRequestId,
            positionTitle: validation.recruitmentRequest?.positionTitle || "Non spécifié",
            positionCount: validation.recruitmentRequest?.positionCount || 0,
            contractDuration: validation.recruitmentRequest?.contractDuration || "Non spécifié",
            desiredStartDate: validation.recruitmentRequest?.desiredStartDate,
            status: validation.recruitmentRequest?.status || "Non défini"
          }
        };
        return formattedValidation;
      });

      return formattedData;
    } catch (error) {
      handleValidationError(error);
      throw error;
    }
  }, []);
};


export const useValidateRecruitmentRequest = () => {
  return useCallback(async (recruitmentRequestId, validatorUserId, validationDate) => {
    if (!recruitmentRequestId) {
      throw new Error("Recruitment Request ID is required");
    }
    if (!validatorUserId) {
      throw new Error("Validator User ID is required");
    }
    if (!validationDate) {
      throw new Error("Validation Date is required");
    }

    try {
      const payload = {
        validatorUserId,
        validationDate,
      };
      const response = await apiPost(
        `/api/RecruitmentValidation/validate/${recruitmentRequestId}`,
        payload
      );
      return {
        success: response.success || false,
        isCompleted: response.isCompleted || false,
        status: response.status || "Non défini",
        message: response.message || "Aucun message retourné",
      };
    } catch (error) {
      handleValidationError(error);
      throw error;
    }
  }, []);
};


export const useRefuseRecruitmentRequest = () => {
  return useCallback(async (recruitmentValidationId, validatorUserId, validationDate) => {
    if (!recruitmentValidationId) {
      throw new Error("Recruitment Validation ID is required");
    }
    if (!validatorUserId) {
      throw new Error("Validator User ID is required");
    }
    if (!validationDate) {
      throw new Error("Validation Date is required");
    }
    try {
      const payload = {
        validatorUserId,
        validationDate,
      };
      const response = await apiPost(
        `/api/RecruitmentValidation/refuse/${recruitmentValidationId}`,
        payload
      );
      return {
        success: response.success || false,
        isCompleted: response.isCompleted || false,
        status: response.status || "Non défini",
        message: response.message || "Aucun message retourné",
      };
    } catch (error) {
      handleValidationError(error);
      throw error;
    }
  }, []);
};
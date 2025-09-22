using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Models.dto.recruitment
{
    public class ValidateRequestDto
    {
        [Required(ErrorMessage = "L'ID du validateur est obligatoire")]
        [StringLength(100, ErrorMessage = "L'ID du validateur ne peut pas dépasser 100 caractères")]
        public string ValidatorUserId { get; set; } = string.Empty;
        public DateTime? ValidationDate { get; set; }

    }

    public class ValidateRequestResponseDto
    {
        public bool Success { get; set; }
        public bool IsCompleted { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string? ValidationId { get; set; }
        public NextValidationStepDto? NextStep { get; set; }
        public List<string>? Errors { get; set; }
        public DateTime ValidationTimestamp { get; set; } = DateTime.UtcNow;
    }

    public class NextValidationStepDto
    {
        public string? ValidationId { get; set; }
        public string? NextValidatorUserId { get; set; }
        public string? NextValidatorName { get; set; }
        public string? NextValidatorRole { get; set; }
        public int? ValidationOrder { get; set; }
    }

    public class RejectValidationDto
    {
        [Required(ErrorMessage = "L'ID du validateur est obligatoire")]
        public string ValidatorUserId { get; set; } = string.Empty;

        [Required(ErrorMessage = "La raison du rejet est obligatoire")]
        [StringLength(1000, MinimumLength = 10, ErrorMessage = "La raison du rejet doit contenir entre 10 et 1000 caractères")]
        public string RejectReason { get; set; } = string.Empty;

        [StringLength(2000, ErrorMessage = "Le commentaire ne peut pas dépasser 2000 caractères")]
        public string? Comment { get; set; }

        public bool SendBackToRequester { get; set; } = true;
    }

    public class ValidationStatusDto
    {
        public string RecruitmentRequestId { get; set; } = string.Empty;
        public string GlobalStatus { get; set; } = string.Empty;
        public decimal CompletionPercentage { get; set; }
        public int TotalValidationsRequired { get; set; }
        public int CompletedValidations { get; set; }
        public List<ValidationDetailDto> ValidationDetails { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime? LastModifiedAt { get; set; }
    }

    public class ValidationDetailDto
    {
        public string ValidationId { get; set; } = string.Empty;
        public string AssignedUserId { get; set; } = string.Empty;
        public string? AssignedUserName { get; set; }
        public string? ValidatorRole { get; set; }
        public string Status { get; set; } = string.Empty;
        public int ValidationOrder { get; set; }
        public DateTime? ValidationDate { get; set; }
        public string? Comment { get; set; }
        public bool IsCurrent { get; set; }
        public bool IsCompleted { get; set; }
    }

    public class RecruitmentValidationDTO
    {
        public class RecruitmentValidationSearchFiltersDTO
        {
            public string? RecruitmentRequestId { get; set; }
            public string? RecruitmentCreator { get; set; }
            public string? Status { get; set; }
            public string? ToWhom { get; set; }
            public DateTime? ValidationDate { get; set; }
        }

        public class RecruitmentValidationDTOForm
        {
            public string? Status { get; set; }
            public DateTime? ValidationDate { get; set; }
            public string RecruitmentCreator { get; set; } = null!;
            public string RecruitmentRequestId { get; set; } = null!;
            public string? ToWhom { get; set; }
            public string? Type { get; set; }
        }

        public class RecruitmentBudgetDTOForm
        {
            public string DepartmentName { get; set; } = null!;
            public decimal Budget { get; set; }
            public string UserId { get; set; } = null!;
        }

        public class Validation
        {
            public string RecruitmentValidationId { get; set; } = null!;
            public string RecruitmentRequestId { get; set; } = null!;
            public string Type { get; set; } = null!;
            public bool IsSureToConfirm { get; set; }
            public string UserId { get; set; } = null!;
        }

        public class RecruitmentPaymentDTO
        {
            public decimal TotalAmount { get; set; }
        }
    }
}
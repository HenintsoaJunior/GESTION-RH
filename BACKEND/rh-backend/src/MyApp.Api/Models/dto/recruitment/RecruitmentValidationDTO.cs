using System;

namespace MyApp.Api.Models.dto.recruitment
{
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
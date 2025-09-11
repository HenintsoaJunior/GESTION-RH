namespace MyApp.Api.Models.dto.mission
{
    public class MissionValidationSearchFiltersDTO
    {
        public string? MissionId { get; set; }
        public string? MissionAssignationId { get; set; }
        public string? MissionCreator { get; set; }
        public string? Status { get; set; }
        public string? ToWhom { get; set; }
        public DateTime? ValidationDate { get; set; }
    }
    public class MissionValidationDTOForm
    {
        public string MissionId { get; set; } = null!;
        public string MissionAssignationId { get; set; } = null!;
        public string MissionCreator { get; set; } = null!;
        public string? Status { get; set; }
        public string? ToWhom { get; set; }
        
        public string? Type { get; set; }
        public DateTime? ValidationDate { get; set; }
    }
    
    public class Validation
    {
        public string MissionValidationId { get; set; } = null!;
        public string MissionAssignationId { get; set; } = null!;
        public bool IsSureToConfirm { get; set; } //message de confirmation si le budget < dépense (êtes-vous sûr de valider => IsSureToConfirm=true)
        public required string Type { get; set; } // "Indemnité" ou "Note de frais"
        public string UserId { get; set; } = null!;

        public MissionBudgetDTOForm MissionBudget { get; set; } = null!;
    }
    
    public class MissionValidationStats
    {
        public int Total { get; set; }
        public int EnAttente { get; set; }
        public int Approuve { get; set; }
        public int Rejeté { get; set; }
    }
}
using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Models.dto.mission
{
    public class MissionDTOForm
    {
        [Required(ErrorMessage = "Le type de la mission est requis.")]
        [StringLength(50, ErrorMessage = "Le type de la mission ne peut pas dépasser 50 caractères.")]
        public string MissionType { get; set; } = null!;


        [Required(ErrorMessage = "Le type de la Compensation est requis.")]
        public string Type { get; set; } = null!;

        [Required(ErrorMessage = "Le titre de la mission est requis.")]
        [StringLength(100, ErrorMessage = "Le titre de la mission ne peut pas dépasser 100 caractères.")]
        public string Name { get; set; } = null!;

        public string? Description { get; set; }

        [Required(ErrorMessage = "La date de début est requise.")]
        public DateTime StartDate { get; set; }

        [Required(ErrorMessage = "La date de fin est requise.")]
        public DateTime EndDate { get; set; }

        [Required(ErrorMessage = "Le lieu est requis")]
        [StringLength(50, ErrorMessage = "L'identifiant du lieu ne peut pas dépasser 50 caractères.")]
        public string LieuId { get; set; } = null!;
        
        public string UserId { get; set; } = null!;

        public List<MissionAssignationDTOForm> Assignations { get; set; } = new List<MissionAssignationDTOForm>();
    }
    
    public class MissionSearchFiltersDTO
    {
        public string? Name { get; set; }
        public DateTime? MinStartDate { get; set; }
        public DateTime? MaxStartDate { get; set; } 
        public DateTime? MinEndDate { get; set; }  
        public DateTime? MaxEndDate { get; set; }   
        public string? LieuId { get; set; }
        public string? Status { get; set; }
    }
}
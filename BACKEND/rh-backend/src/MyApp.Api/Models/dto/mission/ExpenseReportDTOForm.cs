using System.ComponentModel.DataAnnotations;
using System.Text.Json;

namespace MyApp.Api.Models.dto.mission
{
    public class MissionAssignationQueryDTO
    {
        [MaxLength(50)]
        public string? Status { get; set; }

        public int Page { get; set; } = 1;

        public int PageSize { get; set; } = 10;
    }

    public class ExpenseReportDTOForm
    {
        [Required(ErrorMessage = "L'ID utilisateur est requis.")]
        public string UserId { get; set; } = string.Empty;

        [Required(ErrorMessage = "L'ID d'assignation est requis.")]
        public string AssignationId { get; set; } = string.Empty;

        [Required(ErrorMessage = "Au moins un type de frais doit être fourni.")]
        public Dictionary<string, List<ExpenseLineDTO>> ExpenseLinesByType { get; set; } = new Dictionary<string, List<ExpenseLineDTO>>();

        public List<ExpenseReportAttachmentDTO>? Attachments { get; set; } = new List<ExpenseReportAttachmentDTO>();
    }

    public class ExpenseLineDTO
    {
        public string? ExpenseReportId { get; set; }

        [Required(ErrorMessage = "Le titre/libellé est requis.")]
        public string Titled { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required(ErrorMessage = "Le type est requis.")]
        public string Type { get; set; } = string.Empty; 

        [Required(ErrorMessage = "La devise est requise.")]
        public string CurrencyUnit { get; set; } = string.Empty;

        public decimal Amount { get; set; }

        public decimal Rate { get; set; }

        [Required(ErrorMessage = "La AssignationId est requise.")]
        public string AssignationId { get; set; } = string.Empty;

        public string ExpenseReportTypeId { get; set; } = string.Empty;

        [Required(ErrorMessage = "L'ID utilisateur est requis.")]
        public string UserId { get; set; } = string.Empty; 

        public Dictionary<string, JsonElement>? CustomFields { get; set; }
    }

    public class ExpenseReportAttachmentDTO
    {
        [Required(ErrorMessage = "Le nom du fichier est requis.")]
        public string FileName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Le contenu du fichier est requis.")]
        public byte[] FileContent { get; set; } = Array.Empty<byte>();

        [Required(ErrorMessage = "La taille du fichier est requise.")]
        public int FileSize { get; set; }

        [Required(ErrorMessage = "Le type du fichier est requis.")]
        public string FileType { get; set; } = string.Empty;
    }
}
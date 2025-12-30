using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Models.dto.mission
{
    public class MissionReportDTOForm
    {
        public string Text { get; set; } = string.Empty;
        public string UserId { get; set; } = null!;
        public string MissionId { get; set; } = null!;
        public List<MissionReportAttachmentDTO> Attachments { get; set; } = new List<MissionReportAttachmentDTO>();
    }

    public class MissionReportAttachmentDTO
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
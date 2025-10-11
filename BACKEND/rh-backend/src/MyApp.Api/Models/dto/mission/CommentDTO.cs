using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Models.dto.mission
{
    public class CommentDTO
    {
        [Required(ErrorMessage = "Le texte du commentaire est requis")]
        [MaxLength(int.MaxValue, ErrorMessage = "Le texte du commentaire est trop long")]
        public string CommentText { get; set; } = default!;

        [MaxLength(50, ErrorMessage = "L'ID de la demande de recrutement ne doit pas dépasser 50 caractères")]
        public string? MissionId { get; set; }
    }

    public class CommentFormDTO
    {
        [Required(ErrorMessage = "Le texte du MissionId est requis")]
        public string MissionId { get; set; } = default!;

        [Required(ErrorMessage = "Le UserId est requis")]
        public string UserId { get; set; } = default!;

        [Required(ErrorMessage = "Le texte du commentaire est requis")]
        public string CommentText { get; set; } = default!;
        
        public DateTime CreatedAt { get; set; }
    }

    public class CommentResponseDTO
    {
        public string CommentId { get; set; } = default!;
        public string CommentText { get; set; } = default!;
        public string? MissionId { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class RecruitmentRequestCommentDTO
    {
        public string MissionId { get; set; } = default!;
        public string CommentId { get; set; } = default!;
        public CommentResponseDTO Comment { get; set; } = default!;
    }
}
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Entities.users;
using MyApp.Api.Models.dto.mission;

namespace MyApp.Api.Entities.mission
{
    [Table("comments")]
    public class Comments : BaseEntity
    {
        [Key]
        [Column("comment_id")]
        public string? CommentId { get; set; }

        [Required]
        [Column("comment_text")]
        [MaxLength(int.MaxValue)]
        public string CommentText { get; set; } = default!;

        [Column("user_id")]
        public string? UserId { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

        public ICollection<MissionComments> MissionComments { get; set; } = new List<MissionComments>();

        public Comments() { }
        public Comments(CommentFormDTO commentFormDTO)
        {
            CommentText = commentFormDTO.CommentText;
            UserId = commentFormDTO.UserId;
            CreatedAt = commentFormDTO.CreatedAt;
        }
    }
}
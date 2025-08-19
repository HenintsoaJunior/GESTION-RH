using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Entities.users;
using MyApp.Api.Models.form.application;

namespace MyApp.Api.Entities.application
{
    [Table("application_comments")]
    public class ApplicationComment : BaseEntity
    {
        [Key]
        [Column("comment_id")]
        [MaxLength(50)]
        public string CommentId { get; set; } =  null!;

        [Required]
        [Column("comment_text", TypeName = "TEXT")]
        public string CommentText { get; set; } = string.Empty;
        
        [Required]
        [Column("application_id")]
        [MaxLength(50)]
        public string ApplicationId { get; set; } = null!;

        [ForeignKey("ApplicationId")]
        public Application? Application { get; set; }

        [Required]
        [Column("user_id")]
        [MaxLength(250)]
        public string UserId { get; set; } = null!;

        [ForeignKey("UserId")]
        public User? User { get; set; }
        
        public ApplicationComment()
        {
        }

        public ApplicationComment(ApplicationCommentDTOForm dto)
        {
            CommentText = dto.CommentText;
            ApplicationId = dto.ApplicationId;
            UserId = dto.UserId;
        }
    }
}
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using MyApp.Api.Entities.users;

namespace MyApp.Api.Entities.recruitment
{
    [Table("recruitment_request")]
    public class RecruitmentRequest
    {
        [Key]
        [Column("recruitment_request_id")]
        [MaxLength(50)]
        public string RecruitmentRequestId { get; set; } = null!;

        [Required]
        [Column("job_title")]
        [MaxLength(100)]
        public string JobTitle { get; set; } = null!;

        [Column("description")]
        public string? Description { get; set; }

        [Required]
        [Column("request_date")]
        public DateTime RequestDate { get; set; }

        [Column("status")]
        [MaxLength(20)]
        public string? Status { get; set; } = "En Attente";

        // Clé étrangère
        [Required]
        [Column("requester_id")]
        [MaxLength(50)]
        public string RequesterId { get; set; } = null!;

        // Propriété de navigation
        [ForeignKey("RequesterId")]
        public User? Requester { get; set; } = null!;

        [Column("approval_date")]
        public DateTime? ApprovalDate { get; set; }

    }
}

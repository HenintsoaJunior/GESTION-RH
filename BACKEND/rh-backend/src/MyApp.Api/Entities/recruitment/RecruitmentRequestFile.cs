using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Entities.recruitment
{
    [Table("recruitment_request_files")]
    public class RecruitmentRequestFile : BaseEntity
    {
        [Key]
        [Column("file_id")]
        [MaxLength(50)]
        public string FileId { get; set; } = null!;

        [Required]
        [Column("file_name")]
        public byte[] FileName { get; set; } = null!; // VARBINARY(max) mappé à byte[]

        [Required]
        [Column("recruitment_request_id")]
        [MaxLength(50)]
        public string RecruitmentRequestId { get; set; } = null!;

        // Propriété de navigation
        [ForeignKey("RecruitmentRequestId")]
        public RecruitmentRequest? RecruitmentRequest { get; set; }
    }
}
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Entities.recruitment
{
    [Table("recruitment_request_files")]
    public class RecruitmentRequestFile
    {
        [Key]
        [Column("file_id")]
        [MaxLength(50)]
        public string FileId { get; set; } = null!;

        [Required]
        [Column("file")]
        public byte[] File { get; set; } = null!;

        [Required]
        [Column("recruitment_request_id")]
        [MaxLength(50)]
        public string RecruitmentRequestId { get; set; } = null!;

        [ForeignKey("RecruitmentRequestId")]
        public RecruitmentRequest RecruitmentRequest { get; set; } = null!;
    }
}

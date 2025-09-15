using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Entities.users;
using static MyApp.Api.Models.dto.recruitment.RecruitmentValidationDTO;

namespace MyApp.Api.Entities.recruitment
{
    [Table("recruitment_validation")]
    public class RecruitmentValidation : BaseEntity
    {
        [Key]
        [Column("recruitment_validation_id")]
        [MaxLength(50)]
        public string RecruitmentValidationId { get; set; } = null!;

        [Column("status")]
        [MaxLength(50)]
        public string? Status { get; set; }


        [Column("validation_date")]
        public DateTime? ValidationDate { get; set; }

        [Required]
        [Column("recruitment_creator")]
        [MaxLength(50)]
        public string RecruitmentCreator { get; set; } = null!;

        [ForeignKey("RecruitmentCreator")]
        public User? Creator { get; set; }

        [Required]
        [Column("recruitment_request_id")]
        [MaxLength(50)]
        public string RecruitmentRequestId { get; set; } = null!;

        [ForeignKey("RecruitmentRequestId")]
        public RecruitmentRequest? RecruitmentRequest { get; set; }

        [Column("to_whom")]
        [MaxLength(250)]
        public string? ToWhom { get; set; }
        [ForeignKey("ToWhom")]
        public User? Validator { get; set; }

        [Column("type")]
        [MaxLength(50)]
        public string? Type { get; set; }

        public RecruitmentValidation()
        {
        }

        public RecruitmentValidation(RecruitmentValidationDTOForm dto)
        {
            Status = dto.Status;
            ValidationDate = dto.ValidationDate;
            RecruitmentCreator = dto.RecruitmentCreator;
            RecruitmentRequestId = dto.RecruitmentRequestId;
            ToWhom = dto.ToWhom;
            Type = dto.Type;
        }

        
    }
}
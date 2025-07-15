using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Entities.recruitment
{
    [Table("recruitment_reasons")]
    public class RecruitmentReason : Reason
    {
        [Key]
        [Column("recruitment_reason_id")]
        [MaxLength(50)]
        public string RecruitmentReasonId { get; set; } = Guid.NewGuid().ToString();
    }
}

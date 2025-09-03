using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Entities.recruitment
{
    [Table("replacement_reasons")]
    public class ReplacementReason : Reason
    {
        [Key]
        [Column("replacement_reason_id")]
        [MaxLength(50)]
        public string ReplacementReasonId { get; set; } = null!;
    }
}

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Entities.actions
{
    [Table("action_type")]
    public class ActionType : BaseEntity
    {
        [Key]
        [Column("action_type_id")]
        [MaxLength(50)]
        public string ActionTypeId { get; set; } = null!;

        [Required]
        [Column("type")]
        [MaxLength(50)]
        public string Type { get; set; } = null!;
    }
}
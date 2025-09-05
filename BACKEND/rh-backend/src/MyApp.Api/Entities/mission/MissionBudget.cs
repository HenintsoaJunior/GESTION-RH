using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Entities.users;

namespace MyApp.Api.Entities.mission
{
    [Table("mission_budget")]
    public class MissionBudget : BaseEntity
    {
        [Key]
        [Column("mission_budget_id")]
        [MaxLength(50)]
        public string MissionBudgetId { get; set; } = null!;

        [Required]
        [Column("direction_name")]
        [MaxLength(50)]
        public string DirectionName { get; set; } = string.Empty;

        [Required]
        [Column("budget", TypeName = "decimal(15,2)")]
        public decimal Budget { get; set; }

        [Required]
        [Column("user_id")]
        [MaxLength(50)]
        public string UserId { get; set; } = null!;

        [ForeignKey("UserId")]
        public User? User { get; set; }
    }
}
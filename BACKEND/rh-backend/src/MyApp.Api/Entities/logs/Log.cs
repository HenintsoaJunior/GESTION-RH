using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Entities.users;
using MyApp.Api.Models.dto.logs;

namespace MyApp.Api.Entities.logs
{
    [Table("logs")]
    public class Log : BaseEntity
    {
        [Key]
        [Column("log_id")]
        [MaxLength(50)]
        public string LogId { get; set; } = null!;

        [Required]
        [Column("action")]
        [MaxLength(100)]
        public string Action { get; set; } = null!;

        [Column("table_name")]
        [MaxLength(255)]
        public string? TableName { get; set; }

        [Column("old_values", TypeName = "TEXT")]
        public string? OldValues { get; set; }

        [Column("new_values", TypeName = "TEXT")]
        public string? NewValues { get; set; }

        [Required]
        [Column("user_id")]
        [MaxLength(250)]
        public string UserId { get; set; } = null!;

        [ForeignKey("UserId")]
        public User? User { get; set; }
        public Log(){}

        public Log(LogDTOForm dto)
        {
            Action = dto.Action;
            TableName = dto.TableName;
            OldValues = dto.OldValues;
            NewValues = dto.NewValues;
            UserId = dto.UserId;
            CreatedAt = dto.CreatedAt;
            UpdatedAt = dto.UpdatedAt;
        }
    }
}
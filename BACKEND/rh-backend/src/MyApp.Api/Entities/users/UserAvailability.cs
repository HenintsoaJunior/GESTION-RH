using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Models.dto.users;

namespace MyApp.Api.Entities.users
{
    [Table("user_availability")]
    public class UserAvailability
    {
        [Key]
        [Column("user_id")]
        public string? UserId { get; set; }

        [Required]
        [Column("status")]
        [MaxLength(20)]
        public string Status { get; set; } = "disponible";

        [Column("changed_at")]
        public DateTime ChangedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("UserId")]
        public User? User { get; set; }
        public UserAvailability() { }
        public UserAvailability(UserAvailabilityFormDTO dto)
        {
            UserId = dto.UserId;
            Status = dto.Status ?? "disponible";
            ChangedAt = DateTime.UtcNow;
        }
    }
}
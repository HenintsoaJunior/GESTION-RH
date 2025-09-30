using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using MyApp.Api.Entities.users;

namespace MyApp.Api.Entities.notifications
{
    [Table("notification_recipients")]
    [PrimaryKey(nameof(NotificationId), nameof(UserId))]
    public class NotificationRecipients
    {
        [Column("notification_id")]
        public string NotificationId { get; set; } = default!;

        [Column("user_id")]
        public string UserId { get; set; } = default!;

        [Column("status")]
        [MaxLength(50)]
        public string Status { get; set; } = "pending";

        [Column("sent_at")]
        public DateTime? SentAt { get; set; }

        [Column("read_at")]
        public DateTime? ReadAt { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }

        [ForeignKey("NotificationId")]
        public Notifications? Notification { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }
    }
}
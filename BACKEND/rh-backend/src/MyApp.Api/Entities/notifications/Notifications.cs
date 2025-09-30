using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Models.dto.notifications;

namespace MyApp.Api.Entities.notifications
{
    [Table("notifications")]
    public class Notifications : BaseEntity
    {
        [Key]
        [Column("notification_id")]
        public string? NotificationId { get; set; }

        [Required]
        [Column("title")]
        [MaxLength(255)]
        public string Title { get; set; } = default!;

        [Required]
        [Column("message")]
        [MaxLength(int.MaxValue)]
        public string Message { get; set; } = default!;

        [Required]
        [Column("type")]
        [MaxLength(50)]
        public string Type { get; set; } = default!;

        [Column("status")]
        [MaxLength(50)]
        public string Status { get; set; } = "pending";

        [Column("related_table")]
        [MaxLength(255)]
        public string? RelatedTable { get; set; }
        
        [Column("related_menu")]
        [MaxLength(100)]
        public string? RelatedMenu { get; set; }

        [Column("related_id")]
        [MaxLength(50)]
        public string? RelatedId { get; set; }

        [Column("priority")]
        public int Priority { get; set; } = 1;

        public ICollection<NotificationRecipients> NotificationRecipients { get; set; } = new List<NotificationRecipients>();

        public Notifications() { }

        public Notifications(NotificationFormDTO notificationFormDTO)
        {
            Title = notificationFormDTO.Title;
            Message = notificationFormDTO.Message;
            Type = notificationFormDTO.Type;
            RelatedTable = notificationFormDTO.RelatedTable;
            RelatedMenu = notificationFormDTO.RelatedMenu;
            RelatedId = notificationFormDTO.RelatedId;
            Priority = notificationFormDTO.Priority;
            CreatedAt = notificationFormDTO.CreatedAt ?? DateTime.UtcNow;
        }
    }
}
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Entities.recruitment
{
    [Table("recruitment_notifications")]
    public class RecruitmentNotification : BaseEntity
    {
        [Key]
        [Column("recruitment_notification_id")]
        [MaxLength(50)]
        public string RecruitmentNotificationId { get; set; } = Guid.NewGuid().ToString();

        [Column("message")]
        [MaxLength(50)]
        public string Message { get; set; } = string.Empty;

        [Column("date_message")]
        public DateTime DateMessage { get; set; } = DateTime.Now;

        [Column("recruitment_request_id")]
        [MaxLength(50)]
        public string RecruitmentRequestId { get; set; } = null!;

        [ForeignKey("RecruitmentRequestId")]
        public RecruitmentRequest? RecruitmentRequest { get; set; }
    }
}

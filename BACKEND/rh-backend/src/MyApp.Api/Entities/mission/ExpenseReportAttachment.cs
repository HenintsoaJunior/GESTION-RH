// Entity: ExpenseReportAttachment.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Entities.mission
{
    [Table("expense_report_attachments")]
    public class ExpenseReportAttachment
    {
        [Key]
        [Column("attachment_id")]
        public string AttachmentId { get; set; } = string.Empty;

        [Required]
        [Column("assignation_id")]
        public string AssignationId { get; set; } = string.Empty;

        [Required]
        [Column("file_name")]
        public string FileName { get; set; } = string.Empty;

        [Column("file_content")]
        public byte[]? FileContent { get; set; }

        [Column("file_size")]
        public int FileSize { get; set; }

        [Column("file_type")]
        public string? FileType { get; set; }

        [Column("uploaded_at")]
        public DateTime UploadedAt { get; set; } = DateTime.Now;

    }
}
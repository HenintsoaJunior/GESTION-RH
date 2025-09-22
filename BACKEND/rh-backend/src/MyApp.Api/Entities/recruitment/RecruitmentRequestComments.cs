using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MyApp.Api.Entities.recruitment
{
    [Table("recruitment_request_comments")]
    [PrimaryKey(nameof(RecruitmentRequestId), nameof(CommentId))]
    public class RecruitmentRequestComments
    {
        [Column("recruitment_request_id")]
        public string RecruitmentRequestId { get; set; } = default!;

        [Column("comment_id")]
        public string CommentId { get; set; } = default!;

        [ForeignKey("RecruitmentRequestId")]
        public RecruitmentRequest? RecruitmentRequest { get; set; }

        [ForeignKey("CommentId")]
        public Comments? Comment { get; set; }
    }
}
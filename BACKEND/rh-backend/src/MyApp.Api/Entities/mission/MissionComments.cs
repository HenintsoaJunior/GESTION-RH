using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MyApp.Api.Entities.mission
{
    [Table("mission_comments")]
    [PrimaryKey(nameof(MissionId), nameof(CommentId))]
    public class MissionComments
    {
        [Column("mission_id")]
        public string MissionId { get; set; } = default!;

        [Column("comment_id")]
        public string CommentId { get; set; } = default!;

        [ForeignKey("MissionId")]
        public Mission? Mission { get; set; }

        [ForeignKey("CommentId")]
        public Comments? Comment { get; set; }
    }
}
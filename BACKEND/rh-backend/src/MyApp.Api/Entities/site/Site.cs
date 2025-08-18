using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Entities.site
{
    [Table("site")]
    public class Site : BaseEntity
    {
        [Key]
        [Column("site_id")]
        [MaxLength(50)]
        public string SiteId { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [Column("site_name")]
        [MaxLength(255)]
        public string SiteName { get; set; } = string.Empty;

        [Column("code")]
        [MaxLength(10)]
        public string? Code { get; set; }

        [Column("longitude", TypeName = "decimal(9,6)")]
        public decimal? Longitude { get; set; }

        [Column("latitude", TypeName = "decimal(9,6)")]
        public decimal? Latitude { get; set; }
    }
}

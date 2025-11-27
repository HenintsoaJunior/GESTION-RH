using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Entities.site;

namespace MyApp.Api.Entities.recruitment;

[Table("sites_requests")]
public class SiteRequest
{
    [Key]
    [Column("site_request_id")]
    public string Id {get; set;} = null!;

    [ForeignKey("site_id")]
    public Site Site {get; set;} = null!;

    [ForeignKey("request_id")]
    public RecruitmentRequest Request {get; set;} = null!;
}

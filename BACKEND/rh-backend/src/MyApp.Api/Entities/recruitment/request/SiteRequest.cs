using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Entities.site;

namespace MyApp.Api.Entities.recruitment;

[Table("sites_requests")]
public class SiteRequest
{
    [Key]
    [Column("id_site_request")]
    public string Id {get; set;} = null!;


    [Column("site_id")]
    public string SiteId {get; set;} = null!;

    [ForeignKey(nameof(SiteId))]
    public Site Site {get; set;} = null!;


    [Column("request_id")]
    public string RequestId {get; set;} = null!;

    [ForeignKey(nameof(RequestId))]
    public RecruitmentRequest Request {get; set;} = null!;
}

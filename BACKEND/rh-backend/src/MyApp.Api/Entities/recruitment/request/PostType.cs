using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Entities.recruitment;

[Table("posts_types")]
public class PostType
{
    [Key]
    [Column("post_type_id")]
    public string Id { get; set; } = null!;

    [Column("post_type_name")]
    public string Name { get; set; } = null!;
}

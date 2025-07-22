using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Entities.mission
{
    [Table("transport")]
    public class Transport : Types
    {
        [Key]
        [Column("transport_id")]
        [MaxLength(50)]
        public string TransportId { get; set; } = string.Empty;
    }
}

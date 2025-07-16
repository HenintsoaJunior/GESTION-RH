using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Entities.employee
{
    [Table("working_time_types")]
    public class WorkingTimeType : CodeLabel
    {
        [Key]
        [Column("working_time_type_id")]
        [MaxLength(50)]
        public string WorkingTimeTypeId { get; set; } = null!;
    }
}

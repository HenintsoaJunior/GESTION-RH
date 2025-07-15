using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Entities.employee
{
    public class EmployeeNationality
    {
        [Key, Column(Order = 0)]
        public string? EmployeeId { get; set; }

        [Key, Column(Order = 1)]
        public string? NationalityId { get; set; }

        // Navigation properties
        [ForeignKey("EmployeeId")]
        public Employee? Employee { get; set; }

        [ForeignKey("Nationality")]
        public Nationality? Nationality { get; set; }
    }
}

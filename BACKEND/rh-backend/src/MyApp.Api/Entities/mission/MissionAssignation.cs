using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using MyApp.Api.Entities.employee;
using MyApp.Api.Models.form.mission;

namespace MyApp.Api.Entities.mission
{
    [Table("mission_assignation")]
    public class MissionAssignation
    {
        [Key]
        [Column("assignation_id", Order = 0)]
        [MaxLength(50)]
        public string AssignationId { get; set; } = null!;
        [Column("employee_id", Order = 0)]
        [MaxLength(50)]
        public string EmployeeId { get; set; } = null!;

        [Column("mission_id", Order = 1)]
        [MaxLength(50)]
        public string MissionId { get; set; } = null!;

        [Column("transport_id", Order = 2)]
        [MaxLength(50)]
        public string? TransportId { get; set; }

        [Required]
        [Column("departure_date")]
        public DateTime DepartureDate { get; set; }

        [Column("departure_time")]
        public TimeSpan? DepartureTime { get; set; }

        [Column("return_date")]
        public DateTime? ReturnDate { get; set; }

        [Column("return_time")]
        public TimeSpan? ReturnTime { get; set; }

        [Column("duration")]
        public int? Duration { get; set; }

        [Column("created_at")]
        public DateTime? CreatedAt { get; set; }

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }

        [ForeignKey("EmployeeId")]
        public Employee Employee { get; set; }= null!;

        [ForeignKey("MissionId")]
        public Mission? Mission { get; set; }

        [ForeignKey("TransportId")]
        public Transport? Transport { get; set; }

        public MissionAssignation()
        {
            
        }
        public MissionAssignation(MissionAssignationDTOForm dto)
        {
            EmployeeId = dto.EmployeeId;
            MissionId = dto.MissionId;
            TransportId = dto.TransportId;
            DepartureDate = dto.DepartureDate ?? DateTime.Now;
            DepartureTime = dto.DepartureTime;
            ReturnDate = dto.ReturnDate;
            ReturnTime = dto.ReturnTime;
            Duration = dto.Duration;;
        }
    }
}

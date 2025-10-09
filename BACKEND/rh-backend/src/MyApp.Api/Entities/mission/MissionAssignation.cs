using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using MyApp.Api.Entities.employee;
using MyApp.Api.Models.dto.mission;

namespace MyApp.Api.Entities.mission
{
    [Table("mission_assignation")]
    public class MissionAssignation :BaseEntity
    {
        [Key]
        [Column("assignation_id")]
        [MaxLength(50)]
        public string AssignationId { get; set; } = null!;
        [Column("employee_id")]
        [MaxLength(50)]
        public string EmployeeId { get; set; } = null!;

        [Column("mission_id")]
        [MaxLength(50)]
        public string MissionId { get; set; } = null!;

        [Column("transport_id")]
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
        
        [Column("is_validated")]
        public int? IsValidated { get; set; }
        
        [ForeignKey("EmployeeId")]
        public Employee Employee { get; set; }= null!;

        [ForeignKey("MissionId")]
        public Mission? Mission { get; set; }

        [ForeignKey("TransportId")]
        public Transport? Transport { get; set; }

        [Column("type")]
        [MaxLength(50)]
        public string Type { get; set; } = string.Empty;
        
        //si le type est note de frais 
        [Required]
        [Column("allocated_fund", TypeName = "decimal(15,2)")]
        public decimal AllocatedFund { get; set; }

        public MissionAssignation()
        {
            
        }
        public MissionAssignation(MissionAssignationDTOForm dto)
        {
            EmployeeId = dto.EmployeeId;
            if (dto.MissionId != null) MissionId = dto.MissionId;
            TransportId = dto.TransportId;
            DepartureDate = dto.DepartureDate;
            DepartureTime = dto.DepartureTime;
            ReturnDate = dto.ReturnDate;
            ReturnTime = dto.ReturnTime;
            Duration = dto.Duration;
            IsValidated = 0;
            Type = dto.Type;
            // AllocatedFund = dto.AllocatedFund;
        }

        public MissionAssignation(string missionId, MissionAssignationDTOForm assignationDto)
        {
            EmployeeId = assignationDto.EmployeeId;
            MissionId = missionId;
            TransportId = assignationDto.TransportId;
            DepartureDate = assignationDto.DepartureDate;
            DepartureTime = assignationDto.DepartureTime;
            ReturnDate = assignationDto.ReturnDate;
            ReturnTime = assignationDto.ReturnTime;
            Duration = assignationDto.Duration;
            Type = assignationDto.Type;
            // AllocatedFund = assignationDto.AllocatedFund;
        }
    }
}

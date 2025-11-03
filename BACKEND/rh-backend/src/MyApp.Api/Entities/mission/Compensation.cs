using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Entities.employee;
using MyApp.Api.Models.dto.mission;

namespace MyApp.Api.Entities.mission
{
    [Table("compensation")]
    public class Compensation : BaseEntity
    {
        [Key]
        [Column("compensation_id")]
        [MaxLength(50)]
        public string CompensationId { get; set; } = null!;
        
        [Column("transport_amount", TypeName = "decimal(15,2)")]  
        public decimal TransportAmount { get; set; }
        
        [Column("breakfast_amount", TypeName = "decimal(15,2)")]  
        public decimal BreakfastAmount { get; set; }
        
        [Column("lunch_amount", TypeName = "decimal(15,2)")]  
        public decimal LunchAmount { get; set; }
        
        [Column("dinner_amount", TypeName = "decimal(15,2)")]  
        public decimal DinnerAmount { get; set; }
        
        [Column("accommodation_amount", TypeName = "decimal(15,2)")]  
        public decimal AccommodationAmount { get; set; }

        [Column("payment_date")]
        public DateTime? PaymentDate { get; set; }

        [Column("devise")]
        public string Devise { get; set;  } = null!;
        
        [Column("status")]
        [MaxLength(50)]
        public string Status { get; set; } = "unpaid";
        
        [Column("assignation_id")]
        [MaxLength(50)]
        public string AssignationId { get; set; } = null!;
        
        [ForeignKey("AssignationId")]
        public MissionAssignation? Assignation { get; set; }
        
        [Column("employee_id")]
        [MaxLength(50)]
        public string EmployeeId { get; set; } = null!;
        
        [ForeignKey("EmployeeId")]
        public Employee? Employee { get; set; }
        
        public Compensation() { }
        public Compensation(CompensationDTO compensationDTO)
        {
            TransportAmount = compensationDTO.TransportAmount;
            BreakfastAmount = compensationDTO.BreakfastAmount;
            LunchAmount = compensationDTO.LunchAmount;
            DinnerAmount = compensationDTO.DinnerAmount;
            AccommodationAmount = compensationDTO.AccommodationAmount;
            Status = compensationDTO.Status;
            PaymentDate = compensationDTO.PaymentDate;
            Devise = compensationDTO.Devise;
            AssignationId = compensationDTO.AssignationId;
            EmployeeId = compensationDTO.EmployeeId;
            CreatedAt = compensationDTO.CreatedAt;
            UpdatedAt = compensationDTO.UpdatedAt;
        }
    }
}
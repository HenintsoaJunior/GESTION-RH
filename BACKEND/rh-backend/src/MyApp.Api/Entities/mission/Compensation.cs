using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Entities.employee;
using MyApp.Api.Models.dto.mission;

namespace MyApp.Api.Entities.mission
{
    //Indemnité
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

        [Column("communication_amount", TypeName = "decimal(15,2)")]  
        public decimal CommunicationAmount { get; set; }

        [Column("visa_amount", TypeName = "decimal(15,2)")]  
        public decimal VisaAmount { get; set; }

        [Column("medical_expenses_amount", TypeName = "decimal(15,2)")]  
        public decimal MedicalExpensesAmount { get; set; }

        [Column("taxes_amount", TypeName = "decimal(15,2)")]  
        public decimal TaxesAmount { get; set; }

        [Column("payment_date")]
        public DateTime? PaymentDate { get; set; }

        [Column("devise")]
        [MaxLength(50)]
        public string Devise { get; set;  } = null!;
        
        [Column("status")]
        [MaxLength(50)]
        public string Status { get; set; } = "unpaid";
        
        [Column("mission_id")]
        [MaxLength(50)]
        public string MissionId { get; set; } = null!;
        
        [ForeignKey("MissionId")]
        public Mission? Mission { get; set; }
        
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
            CommunicationAmount = compensationDTO.CommunicationAmount;
            VisaAmount = compensationDTO.VisaAmount;
            MedicalExpensesAmount = compensationDTO.MedicalExpensesAmount;
            TaxesAmount = compensationDTO.TaxesAmount;
            Status = compensationDTO.Status;
            PaymentDate = compensationDTO.PaymentDate;
            Devise = compensationDTO.Devise;
            MissionId = compensationDTO.MissionId;
            EmployeeId = compensationDTO.EmployeeId;
            CreatedAt = compensationDTO.CreatedAt;
            UpdatedAt = compensationDTO.UpdatedAt;
        }
    }
}
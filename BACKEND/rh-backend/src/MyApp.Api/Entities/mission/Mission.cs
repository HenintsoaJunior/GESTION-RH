using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Entities.employee;
using MyApp.Api.enums;
using MyApp.Api.Models.dto.mission;

namespace MyApp.Api.Entities.mission
{
    [Table("mission")]
    public class Mission : BaseEntity
    {
        [Key]
        [Column("mission_id")]
        [StringLength(50)]
        public string MissionId { get; set; } = null!;

        [Required]
        [Column("mission_type")]
        [StringLength(20)]
        public MissionType MissionType { get; set; }

        [Required]
        [Column("name")]
        [StringLength(255)]
        public string Name { get; set; } = null!;

        [Column("description")]
        [StringLength(2000)]
        public string? Description { get; set; }

        [Required]
        [Column("start_date")]
        public DateTime StartDate { get; set; }

        [Required]
        [Column("end_date")]
        public DateTime EndDate { get; set; }

        [Required]
        [Column("status")]
        [StringLength(30)]
        public MissionStatus Status { get; set; }

        [Required]
        [Column("lieu_id")]
        [StringLength(50)]
        public string LieuId { get; set; } = null!;

        [ForeignKey(nameof(LieuId))]
        public Lieu? Lieu { get; set; }

        [Required]
        [Column("employee_id")]
        [StringLength(50)]
        public string EmployeeId { get; set; } = null!;

        [ForeignKey(nameof(EmployeeId))]
        public Employee Employee { get; set; } = null!;

        [Column("departure_date")]
        public DateTime? DepartureDate { get; set; }

        [Column("departure_time")]
        public TimeSpan? DepartureTime { get; set; }

        [Column("return_date")]
        public DateTime? ReturnDate { get; set; }

        [Column("return_time")]
        public TimeSpan? ReturnTime { get; set; }

        [Column("duration")]
        public int? Duration { get; set; }

        [Column("is_validated")]
        public int IsValidated { get; set; } = 0;

        [Required]
        [Column("type")]
        [StringLength(50)]
        public PaymentType Type { get; set; }

        [Column("allocated_fund", TypeName = "decimal(15,2)")]
        public decimal? AllocatedFund { get; set; }

        [Column("transport_id")]
        [StringLength(50)]
        public string? TransportId { get; set; }

        [ForeignKey(nameof(TransportId))]
        public Transport? Transport { get; set; }

        public Mission() { }

        public Mission(MissionDTOForm dto)
        {
            MissionType     = dto.MissionType;
            Name            = dto.Name;
            Description     = dto.Description;
            StartDate       = dto.StartDate;
            EndDate         = dto.EndDate;
            Status          = dto.Status;
            LieuId          = dto.LieuId;
            EmployeeId      = dto.EmployeeId;
            DepartureDate   = dto.DepartureDate;
            DepartureTime   = dto.DepartureTime;
            ReturnDate      = dto.ReturnDate;
            ReturnTime      = dto.ReturnTime;
            Duration        = dto.Duration;
            IsValidated     = dto.IsValidated;
            Type            = dto.Type;
            AllocatedFund   = dto.AllocatedFund;
            TransportId     = dto.TransportId;
        }
    }
}
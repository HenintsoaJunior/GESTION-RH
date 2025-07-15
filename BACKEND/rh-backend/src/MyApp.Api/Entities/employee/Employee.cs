using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Entities.contract;
using MyApp.Api.Entities.direction;
using MyApp.Api.Entities.site;

namespace MyApp.Api.Entities.employee
{
    [Table("employees")]
    public class Employee : BaseEntity
    {
        [Key]
        [Column("employee_id")]
        public string EmployeeId { get; set; } = default!;

        [Column("employee_code")]
        [MaxLength(50)]
        public string? EmployeeCode { get; set; }

        [Required]
        [Column("last_name")]
        [MaxLength(50)]
        public string LastName { get; set; } = default!;

        [Required]
        [Column("first_name")]
        [MaxLength(100)]
        public string FirstName { get; set; } = default!;

        [Column("birth_date")]
        public DateTime? BirthDate { get; set; }

        [Column("birth_place")]
        [MaxLength(100)]
        public string? BirthPlace { get; set; }

        [Column("children_count")]
        public int ChildrenCount { get; set; } = 0;

        [Column("cin_number")]
        [MaxLength(50)]
        public string? CINNumber { get; set; }

        [Column("cin_date")]
        public DateTime? CINDate { get; set; }

        [Column("cin_place")]
        [MaxLength(100)]
        public string? CINPlace { get; set; }

        [Column("cnaPS_number")]
        [MaxLength(50)]
        public string? CNAPSNumber { get; set; }

        [Column("address")]
        public string? Address { get; set; }

        [Column("address_complement")]
        [MaxLength(200)]
        public string? AddressComplement { get; set; }

        [Column("bank_code")]
        [MaxLength(50)]
        public string? BankCode { get; set; }

        [Column("branch_code")]
        [MaxLength(50)]
        public string? BranchCode { get; set; }

        [Column("account_number")]
        [MaxLength(50)]
        public string? AccountNumber { get; set; }

        [Column("rib_key")]
        [MaxLength(50)]
        public string? RibKey { get; set; }

        [Required]
        [Column("hire_date")]
        public DateTime HireDate { get; set; }

        [Column("job_title")]
        [MaxLength(100)]
        public string? JobTitle { get; set; }

        [Column("grade")]
        [MaxLength(50)]
        public string? Grade { get; set; }

        [Column("is_executive")]
        public bool IsExecutive { get; set; } = false;

        [Column("contract_end_date")]
        public DateTime? ContractEndDate { get; set; }

        [Column("departure_date")]
        public DateTime? DepartureDate { get; set; }

        [Column("departure_reason_code")]
        [MaxLength(50)]
        public string? DepartureReasonCode { get; set; }

        [Column("departure_reason_title")]
        [MaxLength(100)]
        public string? DepartureReasonTitle { get; set; }

        [Column("headcount")]
        public int Headcount { get; set; } = 1;

        [Column("birth_date_")]
        public DateTime? BirthDate_ { get; set; }

        [Column("status")]
        [MaxLength(10)]
        public string? Status { get; set; } = "Actif";

        // Foreign Keys + Navigations
        [Column("unit_id")]
        public string UnitId { get; set; } = default!;

        [ForeignKey("UnitId")]
        public Unit? Unit { get; set; }

        [Column("service_id")]
        public string ServiceId { get; set; } = default!;

        [ForeignKey("ServiceId")]
        public Service? Service { get; set; }

        [Column("department_id")]
        public string DepartmentId { get; set; } = default!;

        [ForeignKey("DepartmentId")]
        public Department? Department { get; set; }

        [Column("direction_id")]
        public string DirectionId { get; set; } = default!;

        [ForeignKey("DirectionId")]
        public Direction? Direction { get; set; }

        [Column("working_time_type_id")]
        public string WorkingTimeTypeId { get; set; } = default!;

        [ForeignKey("WorkingTimeTypeId")]
        public WorkingTimeType? WorkingTimeType { get; set; }

        [Column("employee_category_id")]
        public string EmployeeCategoryId { get; set; } = default!;

        [ForeignKey("EmployeeCategoryId")]
        public EmployeeCategory? EmployeeCategory { get; set; }

        [Column("contract_type_id")]
        public string ContractTypeId { get; set; } = default!;

        [ForeignKey("ContractTypeId")]
        public ContractType? ContractType { get; set; }

        [Column("gender_id")]
        public string GenderId { get; set; } = default!;

        [ForeignKey("GenderId")]
        public Gender? Gender { get; set; }

        [Column("marital_status_id")]
        public string MaritalStatusId { get; set; } = default!;

        [ForeignKey("MaritalStatusId")]
        public MaritalStatus? MaritalStatus { get; set; }

        [Column("site_id")]
        public string SiteId { get; set; } = default!;

        [ForeignKey("SiteId")]
        public Site? Site { get; set; }
        public ICollection<EmployeeNationality>? EmployeeNationalities { get; set; }
    }
}

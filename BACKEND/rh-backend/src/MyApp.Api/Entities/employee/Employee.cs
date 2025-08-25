using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Entities.contract;
using MyApp.Api.Entities.direction;
using MyApp.Api.Entities.site;
using MyApp.Api.Models.dto.employee;

namespace MyApp.Api.Entities.employee
{
    [Table("employees")]
    public class Employee : BaseEntity
    {
        [Key]
        [Column("employee_id")]
        [MaxLength(250)]
        public string EmployeeId { get; set; } = default!;

        [Column("employee_code")]
        [MaxLength(50)]
        public string? EmployeeCode { get; set; }

        [Required]
        [Column("last_name")]
        [MaxLength(250)]
        public string LastName { get; set; } = default!;

        [Required]
        [Column("first_name")]
        [MaxLength(250)]
        public string FirstName { get; set; } = default!;
        

        [Column("birth_place")]
        [MaxLength(100)]
        public string? BirthPlace { get; set; }

        [Column("children_count")]
        public int ChildrenCount { get; set; } = 0;

        [Column("cin_number")]
        [MaxLength(100)]
        public string? CINNumber { get; set; }

        [Column("cin_date")]
        public DateTime? CINDate { get; set; }

        [Column("cin_place")]
        [MaxLength(100)]
        public string? CINPlace { get; set; }

        [Column("cnaPS_number")]
        [MaxLength(100)]
        public string? CNAPSNumber { get; set; }

        [Column("address")]
        [MaxLength(100)]
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
        public DateTime? BirthDate { get; set; }

        [Column("status")]
        [MaxLength(10)]
        public string? Status { get; set; } = "Actif";

        // Foreign Keys + Navigations
        [Column("unit_id")]
        [MaxLength(100)]
        public string? UnitId { get; set; }

        [ForeignKey("UnitId")]
        public Unit? Unit { get; set; }

        [Column("service_id")]
        [MaxLength(100)]
        public string? ServiceId { get; set; }

        [ForeignKey("ServiceId")]
        public Service? Service { get; set; }

        [Column("department_id")]
        [MaxLength(100)]
        public string? DepartmentId { get; set; }

        [ForeignKey("DepartmentId")]
        public Department? Department { get; set; }

        [Column("direction_id")]
        [MaxLength(100)]
        public string DirectionId { get; set; } = default!;

        [ForeignKey("DirectionId")]
        public Direction? Direction { get; set; }

        [Column("working_time_type_id")]
        [MaxLength(100)]
        public string WorkingTimeTypeId { get; set; } = default!;

        [ForeignKey("WorkingTimeTypeId")]
        public WorkingTimeType? WorkingTimeType { get; set; }

        [Column("contract_type_id")]
        [MaxLength(100)]
        public string ContractTypeId { get; set; } = default!;

        [ForeignKey("ContractTypeId")]
        public ContractType? ContractType { get; set; }

        [Column("gender_id")]
        [MaxLength(100)]
        public string GenderId { get; set; } = default!;

        [ForeignKey("GenderId")]
        [MaxLength(100)]
        public Gender? Gender { get; set; }

        [Column("marital_status_id")]
        [MaxLength(100)]
        public string MaritalStatusId { get; set; } = default!;

        [ForeignKey("MaritalStatusId")]
        public MaritalStatus? MaritalStatus { get; set; }

        [Column("site_id")]
        [MaxLength(100)]
        public string SiteId { get; set; } = default!;

        [ForeignKey("SiteId")]
        public Site? Site { get; set; }
        public ICollection<EmployeeNationality>? EmployeeNationalities { get; set; }

        public Employee()
        {
        }
        
        public Employee(EmployeeFormDTO form)
        {
            EmployeeCode = form.EmployeeCode;
            LastName = form.LastName;
            FirstName = form.FirstName;
            BirthDate = form.BirthDate;
            BirthPlace = form.BirthPlace;
            ChildrenCount = form.ChildrenCount;
            CINNumber = form.CINNumber;
            CINDate = form.CINDate;
            CINPlace = form.CINPlace;
            CNAPSNumber = form.CNAPSNumber;
            Address = form.Address;
            AddressComplement = form.AddressComplement;
            BankCode = form.BankCode;
            BranchCode = form.BranchCode;
            AccountNumber = form.AccountNumber;
            RibKey = form.RibKey;
            HireDate = form.HireDate;
            JobTitle = form.JobTitle;
            Grade = form.Grade;
            IsExecutive = form.IsExecutive;
            ContractEndDate = form.ContractEndDate;
            DepartureDate = form.DepartureDate; // Added
            DepartureReasonCode = form.DepartureReasonCode; // Added
            DepartureReasonTitle = form.DepartureReasonTitle; // Added
            Status = form.Status ?? "Actif"; // Valeur par défaut si null
            UnitId = form.UnitId;
            ServiceId = form.ServiceId;
            DepartmentId = form.DepartmentId;
            DirectionId = form.DirectionId!;
            WorkingTimeTypeId = form.WorkingTimeTypeId;
            ContractTypeId = form.ContractTypeId;
            GenderId = form.GenderId;
            MaritalStatusId = form.MaritalStatusId;
            SiteId = form.SiteId;
            Headcount = 1; // Valeur par défaut
        }
    }
}

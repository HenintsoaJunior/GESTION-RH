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
        [MaxLength(50)]
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

        [Column("phone_number")]
        [MaxLength(20)]
        public string? PhoneNumber { get; set; }

        [Required]
        [Column("hire_date")]
        public DateTime HireDate { get; set; }

        [Column("job_title")]
        [MaxLength(100)]
        public string? JobTitle { get; set; }

        [Column("contract_end_date")]
        public DateTime? ContractEndDate { get; set; }
        
        [Column("status")]
        [MaxLength(50)]
        public string? Status { get; set; }

        [Required]
        [Column("site_id")]
        [MaxLength(50)]
        public string SiteId { get; set; } = default!;

        [ForeignKey("SiteId")]
        public Site? Site { get; set; }

        [Required]
        [Column("gender_id")]
        [MaxLength(50)]
        public string GenderId { get; set; } = default!;

        [ForeignKey("GenderId")]
        public Gender? Gender { get; set; }

        [Required]
        [Column("contract_type_id")]
        [MaxLength(50)]
        public string ContractTypeId { get; set; } = default!;

        [ForeignKey("ContractTypeId")]
        public ContractType? ContractType { get; set; }

        [Required]
        [Column("direction_id")]
        [MaxLength(50)]
        public string DirectionId { get; set; } = default!;

        [ForeignKey("DirectionId")]
        public Direction? Direction { get; set; }

        [Column("department_id")]
        [MaxLength(50)]
        public string? DepartmentId { get; set; }

        [ForeignKey("DepartmentId")]
        public Department? Department { get; set; }

        [Column("service_id")]
        [MaxLength(50)]
        public string? ServiceId { get; set; }

        [ForeignKey("ServiceId")]
        public Service? Service { get; set; }

        [Column("unit_id")]
        [MaxLength(50)]
        public string? UnitId { get; set; }

        [ForeignKey("UnitId")]
        public Unit? Unit { get; set; }

        public Employee()
        {
        }

        public Employee(EmployeeFormDTO form)
        {
            EmployeeCode = form.EmployeeCode;
            LastName = form.LastName;
            FirstName = form.FirstName;
            PhoneNumber = form.PhoneNumber;
            HireDate = form.HireDate;
            JobTitle = form.JobTitle;
            ContractEndDate = form.ContractEndDate;
            SiteId = form.SiteId;
            GenderId = form.GenderId;
            ContractTypeId = form.ContractTypeId;
            DirectionId = form.DirectionId;
            DepartmentId = form.DepartmentId;
            ServiceId = form.ServiceId;
            UnitId = form.UnitId;
        }
    }
}
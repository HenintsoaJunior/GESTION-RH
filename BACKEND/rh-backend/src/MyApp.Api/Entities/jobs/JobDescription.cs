using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Entities;
using MyApp.Api.Entities.departments;
using MyApp.Api.Entities.contracts;

namespace MyApp.Api.Entities.jobs
{
    [Table("job_descriptions")]
    public class JobDescription : BaseEntity
    {
        [Key]
        [Column("description_id")]
        [MaxLength(50)]
        public string DescriptionId { get; set; } = null!;

        [Required]
        [Column("title")]
        [MaxLength(200)]
        public string Title { get; set; } = null!;

        [Column("location")]
        [MaxLength(100)]
        public string? Location { get; set; }

        [Column("description")]
        public string? Description { get; set; }

        [Column("required_skills")]
        public string? RequiredSkills { get; set; }

        [Column("required_experience")]
        public string? RequiredExperience { get; set; }

        [Column("required_education")]
        [MaxLength(200)]
        public string? RequiredEducation { get; set; }

        [Column("required_languages")]
        [MaxLength(200)]
        public string? RequiredLanguages { get; set; }

        [Column("contract_type_id")]
        [MaxLength(50)]
        public string? ContractTypeId { get; set; }

        [ForeignKey("ContractTypeId")]
        public ContractType? ContractType { get; set; }

        [Column("department_id")]
        [MaxLength(50)]
        public string? DepartmentId { get; set; }

        [ForeignKey("DepartmentId")]
        public Department? Department { get; set; }
    }
}
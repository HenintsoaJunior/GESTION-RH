using System;
using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Models.dto.employee
{
    public class EmployeeFormDTO
    {
        [Required(ErrorMessage = "Le nom de famille est requis.")]
        [MaxLength(50, ErrorMessage = "Le nom de famille ne peut pas dépasser 50 caractères.")]
        public string LastName { get; set; } = default!;

        [MaxLength(100, ErrorMessage = "Le prénom ne peut pas dépasser 100 caractères.")]
        public string? FirstName { get; set; }

        [MaxLength(50, ErrorMessage = "Le code employé ne peut pas dépasser 50 caractères.")]
        public string? EmployeeCode { get; set; }

        public DateTime? BirthDate { get; set; }

        [MaxLength(100, ErrorMessage = "Le lieu de naissance ne peut pas dépasser 100 caractères.")]
        public string? BirthPlace { get; set; }

        [MaxLength(50, ErrorMessage = "Le numéro CIN ne peut pas dépasser 50 caractères.")]
        public string? IdNumber { get; set; }

        public DateTime? IdIssueDate { get; set; }

        [MaxLength(100, ErrorMessage = "Le lieu de délivrance du CIN ne peut pas dépasser 100 caractères.")]
        public string? IdIssuePlace { get; set; }

        [MaxLength(50, ErrorMessage = "Le categorie ne peut pas dépasser 20 caractères.")]
        public string? Category { get; set; }

        [MaxLength(20, ErrorMessage = "Le numéro de téléphone ne peut pas dépasser 20 caractères.")]
        public string? PhoneNumber { get; set; }

        public DateTime? HireDate { get; set; }

        [MaxLength(100, ErrorMessage = "Le titre du poste ne peut pas dépasser 100 caractères.")]
        public string? JobTitle { get; set; }

        public DateTime? ContractEndDate { get; set; }

        [Required(ErrorMessage = "L'identifiant du site est requis.")]
        [MaxLength(50, ErrorMessage = "L'identifiant du site ne peut pas dépasser 50 caractères.")]
        public string SiteId { get; set; } = default!;

        [Required(ErrorMessage = "L'identifiant du genre est requis.")]
        [MaxLength(50, ErrorMessage = "L'identifiant du genre ne peut pas dépasser 50 caractères.")]
        public string GenderId { get; set; } = default!;

        [MaxLength(50, ErrorMessage = "L'identifiant du type de contrat ne peut pas dépasser 50 caractères.")]
        public string? ContractTypeId { get; set; }

        [Required(ErrorMessage = "L'identifiant de la direction est requis.")]
        [MaxLength(50, ErrorMessage = "L'identifiant de la direction ne peut pas dépasser 50 caractères.")]
        public string DirectionId { get; set; } = default!;

        [MaxLength(50, ErrorMessage = "L'identifiant du département ne peut pas dépasser 50 caractères.")]
        public string? DepartmentId { get; set; }

        [MaxLength(50, ErrorMessage = "L'identifiant du service ne peut pas dépasser 50 caractères.")]
        public string? ServiceId { get; set; }

        [MaxLength(50, ErrorMessage = "L'identifiant de l'unité ne peut pas dépasser 50 caractères.")]
        public string? UnitId { get; set; }
    }

    public class EmployeeSearchFiltersDTO
    {
        [MaxLength(100, ErrorMessage = "Le titre du poste ne peut pas dépasser 100 caractères.")]
        public string? JobTitle { get; set; }

        [MaxLength(50, ErrorMessage = "Le nom de famille ne peut pas dépasser 50 caractères.")]
        public string? LastName { get; set; }

        [MaxLength(100, ErrorMessage = "Le prénom ne peut pas dépasser 100 caractères.")]
        public string? FirstName { get; set; }

        [MaxLength(50, ErrorMessage = "L'identifiant de la direction ne peut pas dépasser 50 caractères.")]
        public string? DirectionId { get; set; }

        [MaxLength(50, ErrorMessage = "L'identifiant du type de contrat ne peut pas dépasser 50 caractères.")]
        public string? ContractTypeId { get; set; }

        [MaxLength(50, ErrorMessage = "Le code employé ne peut pas dépasser 50 caractères.")]
        public string? EmployeeCode { get; set; }

        [MaxLength(50, ErrorMessage = "L'identifiant du site ne peut pas dépasser 50 caractères.")]
        public string? SiteId { get; set; }

        [MaxLength(50, ErrorMessage = "L'identifiant du genre ne peut pas dépasser 50 caractères.")]
        public string? GenderId { get; set; }
    }

    public class EmployeeStats
    {
        public int Total { get; set; }
    }

    public class CreateEmployeeCategoryDTO
    {
        [Required]
        [MaxLength(50)]
        public string Code { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Label { get; set; } = string.Empty;
    }
}

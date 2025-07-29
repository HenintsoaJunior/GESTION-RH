using System;
using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Models.form.employee
{
    public class EmployeeFormDTO
    {
        [Required(ErrorMessage = "Le nom de famille est requis.")]
        [MaxLength(50, ErrorMessage = "Le nom de famille ne peut pas dépasser 50 caractères.")]
        public string LastName { get; set; } = default!;

        [Required(ErrorMessage = "Le prénom est requis.")]
        [MaxLength(100, ErrorMessage = "Le prénom ne peut pas dépasser 100 caractères.")]
        public string FirstName { get; set; } = default!;

        [MaxLength(50, ErrorMessage = "Le code employé ne peut pas dépasser 50 caractères.")]
        public string? EmployeeCode { get; set; }

        public DateTime? BirthDate { get; set; }

        [MaxLength(100, ErrorMessage = "Le lieu de naissance ne peut pas dépasser 100 caractères.")]
        public string? BirthPlace { get; set; }

        public int ChildrenCount { get; set; } = 0;

        [MaxLength(50, ErrorMessage = "Le numéro CIN ne peut pas dépasser 50 caractères.")]
        public string? CINNumber { get; set; }

        public DateTime? CINDate { get; set; }

        [MaxLength(100, ErrorMessage = "Le lieu de délivrance du CIN ne peut pas dépasser 100 caractères.")]
        public string? CINPlace { get; set; }

        [MaxLength(50, ErrorMessage = "Le numéro CNAPS ne peut pas dépasser 50 caractères.")]
        public string? CNAPSNumber { get; set; }

        public string? Address { get; set; }

        [MaxLength(200, ErrorMessage = "Le complément d'adresse ne peut pas dépasser 200 caractères.")]
        public string? AddressComplement { get; set; }

        [MaxLength(50, ErrorMessage = "Le code bancaire ne peut pas dépasser 50 caractères.")]
        public string? BankCode { get; set; }

        [MaxLength(50, ErrorMessage = "Le code de l'agence ne peut pas dépasser 50 caractères.")]
        public string? BranchCode { get; set; }

        [MaxLength(50, ErrorMessage = "Le numéro de compte ne peut pas dépasser 50 caractères.")]
        public string? AccountNumber { get; set; }

        [MaxLength(50, ErrorMessage = "La clé RIB ne peut pas dépasser 50 caractères.")]
        public string? RibKey { get; set; }

        [Required(ErrorMessage = "La date d'embauche est requise.")]
        public DateTime HireDate { get; set; }

        [MaxLength(100, ErrorMessage = "Le titre du poste ne peut pas dépasser 100 caractères.")]
        public string? JobTitle { get; set; }

        [MaxLength(50, ErrorMessage = "Le grade ne peut pas dépasser 50 caractères.")]
        public string? Grade { get; set; }

        public bool IsExecutive { get; set; } = false;

        public DateTime? ContractEndDate { get; set; }

        public DateTime? DepartureDate { get; set; } // Added for DepartureDate

        [MaxLength(50, ErrorMessage = "Le code de raison de départ ne peut pas dépasser 50 caractères.")]
        public string? DepartureReasonCode { get; set; } // Added for DepartureReasonCode

        [MaxLength(100, ErrorMessage = "Le titre de raison de départ ne peut pas dépasser 100 caractères.")]
        public string? DepartureReasonTitle { get; set; } // Added for DepartureReasonTitle

        public DateTime? BirthDate_ { get; set; } // Added for BirthDate_

        [MaxLength(10, ErrorMessage = "Le statut ne peut pas dépasser 10 caractères.")]
        public string? Status { get; set; } = "Actif";

        [Required(ErrorMessage = "L'identifiant de l'unité est requis.")]
        public string UnitId { get; set; } = default!;

        [Required(ErrorMessage = "L'identifiant du service est requis.")]
        public string ServiceId { get; set; } = default!;

        [Required(ErrorMessage = "L'identifiant du département est requis.")]
        public string DepartmentId { get; set; } = default!;

        [Required(ErrorMessage = "L'identifiant de la direction est requis.")]
        public string DirectionId { get; set; } = default!;

        [Required(ErrorMessage = "L'identifiant du type de temps de travail est requis.")]
        public string WorkingTimeTypeId { get; set; } = default!;

        [Required(ErrorMessage = "L'identifiant du type de contrat est requis.")]
        public string ContractTypeId { get; set; } = default!;

        [Required(ErrorMessage = "L'identifiant du genre est requis.")]
        public string GenderId { get; set; } = default!;

        [Required(ErrorMessage = "L'identifiant de la situation matrimoniale est requis.")]
        public string MaritalStatusId { get; set; } = default!;

        [Required(ErrorMessage = "L'identifiant du site est requis.")]
        public string SiteId { get; set; } = default!;
    }
}
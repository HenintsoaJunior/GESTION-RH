using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using MyApp.Api.enums;
using MyApp.Api.Converters;
using Microsoft.AspNetCore.Mvc;

namespace MyApp.Api.Models.dto.mission
{
    public class MissionResultDTO
    {
        public string? MissionId { get; set; }
        public string? MissionType { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string? Status { get; set; }
        public string? LieuId { get; set; }
        public object? Lieu { get; set; }
        public string? EmployeeId { get; set; }
        public object? Employee { get; set; }
        public DateTime? DepartureDate { get; set; }
        public TimeSpan? DepartureTime { get; set; }
        public DateTime? ReturnDate { get; set; }
        public TimeSpan? ReturnTime { get; set; }
        public int? Duration { get; set; }
        public int IsValidated { get; set; }
        public string? Type { get; set; }
        public decimal? AllocatedFund { get; set; }
        public string? TransportId { get; set; }
        public object? Transport { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class MissionDTOForm
    {
        [Required(ErrorMessage = "Le type de mission est requis (national ou international).")]
        [JsonConverter(typeof(EnumDescriptionJsonConverter<MissionType>))]
        public MissionType MissionType { get; set; }

        [Required(ErrorMessage = "Le type de compensation est requis.")]
        [JsonConverter(typeof(EnumDescriptionJsonConverter<PaymentType>))]
        public PaymentType Type { get; set; }

        [Required(ErrorMessage = "Le titre de la mission est requis.")]
        [StringLength(255, MinimumLength = 3)]
        public string Name { get; set; } = null!;

        [StringLength(2000)]
        public string? Description { get; set; }

        [Required]
        [JsonConverter(typeof(EnumDescriptionJsonConverter<MissionStatus>))]
        public MissionStatus Status { get; set; }

        [Required(ErrorMessage = "La date de début est requise.")]
        [DataType(DataType.Date)]
        public DateTime StartDate { get; set; }

        [Required(ErrorMessage = "La date de fin est requise.")]
        [DataType(DataType.Date)]
        public DateTime EndDate { get; set; }

        [Required(ErrorMessage = "Le lieu de la mission est requis.")]
        public string LieuId { get; set; } = null!;

        [Required(ErrorMessage = "L'employé assigné est requis.")]
        public string EmployeeId { get; set; } = null!;

        [Required(ErrorMessage = "La date de départ est requise.")]
        [DataType(DataType.Date)]
        public DateTime? DepartureDate { get; set; }

        [DataType(DataType.Time)]
        public TimeSpan? DepartureTime { get; set; }

        [DataType(DataType.Date)]
        public DateTime? ReturnDate { get; set; }

        [DataType(DataType.Time)]
        public TimeSpan? ReturnTime { get; set; }

        public int? Duration { get; set; }

        public int IsValidated { get; set; } = 0;

        [Range(0, 9999999999999.99, ErrorMessage = "Le montant alloué doit être positif.")]
        public decimal? AllocatedFund { get; set; }

        public string? TransportId { get; set; }

        public int IsVisa { get; set; } = 0;

        [Range(0, 9999999999999.99, ErrorMessage = "Le montant du visa doit être positif.")]
        public decimal? AmountVisaEur { get; set; }

        public int InclPdj { get; set; } = 0;

        [Required(ErrorMessage = "L'userId est requis.")]
        public string UserId { get; set; } = null!;
    }

    public class MissionSearchFiltersDTO
    {
        public string? Name { get; set; }
        
        private IEnumerable<string>? _matricules;
        
        [FromQuery(Name = "matricule")]
        public string? MatriculeString { get; set; }
        
        public IEnumerable<string>? Matricule 
        { 
            get
            {
                if (_matricules != null && _matricules.Any())
                    return _matricules;
                
                if (!string.IsNullOrWhiteSpace(MatriculeString))
                {
                    return MatriculeString.Split(',', StringSplitOptions.RemoveEmptyEntries)
                                         .Select(m => m.Trim())
                                         .Where(m => !string.IsNullOrWhiteSpace(m))
                                         .ToArray();
                }
                
                return Array.Empty<string>();
            }
            set => _matricules = value;
        }

        [DataType(DataType.Date)]
        public DateTime? MinStartDate { get; set; }
        public DateTime? MaxStartDate { get; set; }
        public DateTime? MinEndDate { get; set; }
        public DateTime? MaxEndDate { get; set; }

        public string? LieuId { get; set; }
        public string? EmployeeId { get; set; }

        [JsonConverter(typeof(EnumDescriptionJsonConverter<MissionStatus>))]
        public MissionStatus[]? Status { get; set; } = Array.Empty<MissionStatus>();

        [JsonConverter(typeof(EnumDescriptionJsonConverter<MissionType>))]
        public MissionType? MissionType { get; set; } 

        [JsonConverter(typeof(EnumDescriptionJsonConverter<PaymentType>))]
        public PaymentType? Type { get; set; }
    }
}
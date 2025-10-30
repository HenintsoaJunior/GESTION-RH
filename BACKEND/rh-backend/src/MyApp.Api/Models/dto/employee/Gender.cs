using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Models.dto.employee
{
    public class CreateGenderDTO
    {
        [Required]
        [MaxLength(50)]
        public string Code { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Label { get; set; } = string.Empty;
    }
}
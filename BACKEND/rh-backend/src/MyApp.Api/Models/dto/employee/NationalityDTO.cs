using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Models.dto.employee
{
    public class CreateNationalityDTO
    {
        [Required]
        [MaxLength(50)]
        public string Code { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
    }
}
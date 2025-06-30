using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Models.actions
{
    public class ActionTypeDto
    {
        [Required]
        [MaxLength(50)]
        public string ActionTypeId { get; set; } = default!;

        [Required]
        [MaxLength(50)]
        public string Type { get; set; } = default!;
    }
}
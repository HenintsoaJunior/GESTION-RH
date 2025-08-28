using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Models.dto.users
{
    public class RoleDTOForm
    {
        [Required(ErrorMessage = "Le nom du rôle est obligatoire.")]
        public required string UserId  { get; set; }
        [Required(ErrorMessage = "Le nom du rôle est obligatoire.")]
        [MaxLength(50, ErrorMessage = "Le nom du rôle ne doit pas dépasser 50 caractères.")]
        public string Name { get; set; } = null!;

        [MaxLength(250, ErrorMessage = "La description ne doit pas dépasser 250 caractères.")]
        public string? Description { get; set; }
    }
}
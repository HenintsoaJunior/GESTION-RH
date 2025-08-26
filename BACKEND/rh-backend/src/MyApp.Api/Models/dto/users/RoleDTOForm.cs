using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Models.dto.users
{
    public class RoleDTOForm
    {
        [Required(ErrorMessage = "Le nom du rôle est obligatoire.")]
        [MaxLength(50, ErrorMessage = "Le nom du rôle ne doit pas dépasser 50 caractères.")]
        public string Name { get; set; } = null!;

        [MaxLength(250, ErrorMessage = "La description ne doit pas dépasser 250 caractères.")]
        public string? Description { get; set; }
    }
    
    
    public class RoleDTOFormUpdate
    {
        [Required(ErrorMessage = "Le RoleId du rôle est obligatoire.")]
        public string RoleId { get; set; } = null!;
        [Required(ErrorMessage = "Le nom du rôle est obligatoire.")]
        [MaxLength(50, ErrorMessage = "Le nom du rôle ne doit pas dépasser 50 caractères.")]
        public string Name { get; set; } = null!;

        [MaxLength(250, ErrorMessage = "La description ne doit pas dépasser 250 caractères.")]
        public string? Description { get; set; }
    }
}
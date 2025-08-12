using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Entities.users
{
    public enum UserType
    {
        Cadre = 0,
        NonCadre = 1
    }

    [Table("users")]
    public class User : BaseEntity
    {
        [Key]
        [Column("user_id")]
        [MaxLength(50)]
        public string UserId { get; set; } = null!;

        [Required]
        [Column("matricule")]
        [MaxLength(100)]
        public string Matricule { get; set; } = null!;

        [Required]
        [Column("email")]
        [MaxLength(150)]
        public string Email { get; set; } = null!;

        [Column("name")]
        [MaxLength(50)]
        public string? Name { get; set; }

        [Column("position_")]
        [MaxLength(250)]
        public string? Position { get; set; }

        [Column("department")]
        [MaxLength(100)]
        public string? Department { get; set; }

        [Column("superior_id")]
        [MaxLength(150)]
        public string? SuperiorId { get; set; }

        [Column("superior_name")]
        [MaxLength(150)]
        public string? SuperiorName { get; set; }

        [Column("status")]
        [MaxLength(50)]
        public string? Status { get; set; }

        [Column("signature")]
        [MaxLength(250)]
        public string? Signature { get; set; }

        [Column("user_type")]
        [MaxLength(50)]
        public string? UserType { get; set; } // Could use enum directly if database stores "Cadre"/"NonCadre"

        [Required]
        [Column("role_id")]
        [MaxLength(50)]
        public string RoleId { get; set; } = null!;

        [ForeignKey("RoleId")]
        public Role? Role { get; set; }

        [Column("refresh_token")]
        [MaxLength(500)]
        public string? RefreshToken { get; set; }

        [Column("refresh_token_expiry")]
        public DateTime? RefreshTokenExpiry { get; set; }
    }
}
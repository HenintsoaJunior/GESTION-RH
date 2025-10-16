using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Models.dto.users;

namespace MyApp.Api.Entities.users
{
    public enum UserType
    {
        Cadre = 1,
        NonCadre = 0
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
        [MaxLength(250)]
        public string? Name { get; set; }

        [Column("position")]
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
        public string? Signature { get; set; }

        [Column("user_type")]
        public UserType? UserType { get; set; }

        [Column("refresh_token")]
        [MaxLength(250)]
        public string? RefreshToken { get; set; }

        [Column("refresh_token_expiry")]
        public DateTime? RefreshTokenExpiry { get; set; }

        public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();

        public ICollection<UserHabilitation> UserHabilitations { get; set; } = new List<UserHabilitation>();

        public User()
        {
            
        }
        public User(UserDto user)
        {
            UserId = user.UserId;
            Email = user.Email;
            Name = user.Name;
            Department = user.Department;
            Position = user.Position;
            SuperiorId = user.SuperiorId;
            SuperiorName = user.SuperiorName;
        }
    }
}
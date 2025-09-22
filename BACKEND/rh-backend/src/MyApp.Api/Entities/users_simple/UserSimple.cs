using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Models.dto.users_simple;

namespace MyApp.Api.Entities.users_simple
{
    [Table("users_simple")]
    public class UserSimple : BaseEntity
    {
        [Key]
        [Column("user_id")]
        [MaxLength(250)]
        public string UserId { get; set; } = null!;

        [Required]
        [Column("email")]
        [MaxLength(150)]
        public string Email { get; set; } = null!;

        [Required]
        [Column("first_name")]
        [MaxLength(150)]
        public string FirstName { get; set; } = null!;

        [Column("last_name")]
        [MaxLength(150)]
        public string? LastName { get; set; }

        [Column("phone_number")]
        [MaxLength(50)]
        public string? PhoneNumber { get; set; }

        [Required]
        [Column("password")]
        [MaxLength(250)]
        public string Password { get; set; } = null!;

        [Column("refresh_token")]
        public string? RefreshToken { get; set; }

        [Column("refresh_token_expiry")]
        public DateTime? RefreshTokenExpiry { get; set; }

        public UserSimple()
        {
        }

        public UserSimple(UserSimpleDto user)
        {
            Email = user.Email;
            FirstName = user.FirstName;
            LastName = user.LastName;
            PhoneNumber = user.PhoneNumber;
            Password = user.Password;
        }
    }
}
namespace MyApp.Api.Models.dto.users_simple
{
    public class UserSimpleDto
    {
        public string UserId { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string FirstName { get; set; } = null!;
        public string? LastName { get; set; }
        public string? PhoneNumber { get; set; }        
        public string Password { get; set; } = null!;
    }

    public class UserSimpleResponseDto
    {
        public string Email { get; set; } = null!;
        public string FirstName { get; set; } = null!;
        public string? LastName { get; set; }
        public string? PhoneNumber { get; set; }        
    }

    public class LoginDto
    {
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
    }
}
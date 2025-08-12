using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.DirectoryServices.AccountManagement;
using MyApp.Api.Data;
using MyApp.Api.Entities.users;
using Microsoft.EntityFrameworkCore;
using System.Runtime.Versioning;
using System.Security.Cryptography;

namespace MyApp.Api.Services.users;

public interface IAuthService
{
    Task<ValidationResult> ValidateUserAsync(string username, string password);
    TokenResponse GenerateJwtToken(User user);
    Task<TokenResponse> RefreshTokenAsync(string refreshToken);
}

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly string _jwtSecret; // Dynamically generated JWT secret

    public AuthService(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
        _jwtSecret = GenerateJwtSecret(); // Generate secret at instantiation
        // TODO: For production, load the secret from a secure store (e.g., key vault or environment variables) instead of generating it here
    }

    [SupportedOSPlatform("windows")]
    public async Task<ValidationResult> ValidateUserAsync(string username, string password)
    {
        try
        {
            var ldapResult = await ValidateLdapCredentialsAsync(username, password);
            if (ldapResult.Type != "success")
                return new ValidationResult { Message = ldapResult.Message, Type = ldapResult.Type };

            var dbUser = await GetUserFromDatabaseAsync(ldapResult.EmailAddress);
            return ValidateUserAccess(dbUser);
        }
        catch (Exception ex)
        {
            return new ValidationResult { Message = "An error occurred during authentication", Type = "error" };
        }
    }

    [SupportedOSPlatform("windows")]
    private async Task<LdapValidationResult> ValidateLdapCredentialsAsync(string username, string password)
    {
        string? domainPath = _configuration.GetSection("LdapSettings:DomainPath").Value;
        if (string.IsNullOrEmpty(domainPath))
            throw new InvalidOperationException("LDAP DomainPath is not configured");

        using var context = new PrincipalContext(ContextType.Domain, domainPath);
        var user = UserPrincipal.FindByIdentity(context, username);

        if (user == null)
            return new LdapValidationResult { Type = "unknown_user", Message = "Mail incorrect ou inexistant" };

        if (user.IsAccountLockedOut())
            return new LdapValidationResult { Type = "unknown_user", Message = "Trop de tentatives échouées, veuillez réessayer dans quelques minutes" };

        bool isValid = context.ValidateCredentials(username, password, ContextOptions.Negotiate);
        if (!isValid)
        {
            await Task.Delay(2000);
            return new LdapValidationResult { Type = "incorrect_pass", Message = "Mot de passe incorrect" };
        }

        return new LdapValidationResult { Type = "success", EmailAddress = user.EmailAddress };
    }

    private async Task<User?> GetUserFromDatabaseAsync(string? emailAddress)
    {
        if (string.IsNullOrEmpty(emailAddress))
            return null;

        var user = await _context.Users
            .Include(u => u.Role)
                .ThenInclude(r => r!.RoleHabilitations)
                    .ThenInclude(rh => rh.Habilitation)
            .Where(u => u.Email == emailAddress)
            .FirstOrDefaultAsync();

        if (user?.Department == "Direction des Systèmes d'Information")
            user.Department = "DSI";

        return user;
    }

    private ValidationResult ValidateUserAccess(User? user)
    {
        if (user == null)
            return new ValidationResult { Message = "Utilisateur non trouvé dans la base de données", Type = "user_not_found" };

        if (string.IsNullOrEmpty(user.UserType))
            return new ValidationResult { Message = "Vous ne pouvez pas accéder. Veuillez contacter l'administrateur.", Type = "type_user_missing" };

        return new ValidationResult { Message = "Success", Type = "success", User = user };
    }

    public TokenResponse GenerateJwtToken(User user)
    {
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSecret));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = CreateUserClaims(user);
        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddHours(1), // Short-lived JWT (1 hour)
            signingCredentials: credentials
        );

        var jwtToken = new JwtSecurityTokenHandler().WriteToken(token);
        var refreshToken = GenerateRefreshToken();

        // Store refresh token in the database
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7); // Refresh token valid for 7 days
        _context.Users.Update(user);
        _context.SaveChanges();

        return new TokenResponse
        {
            AccessToken = jwtToken,
            RefreshToken = refreshToken,
            ExpiresIn = 3600 // 1 hour in seconds
        };
    }

    public async Task<TokenResponse> RefreshTokenAsync(string refreshToken)
    {
        if (string.IsNullOrEmpty(refreshToken))
            throw new ArgumentException("Refresh token is required");

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);

        if (user == null)
            throw new SecurityTokenException("Invalid refresh token");

        if (user.RefreshTokenExpiry < DateTime.UtcNow)
            throw new SecurityTokenException("Refresh token has expired");

        // Generate a new JWT token
        var newJwtToken = GenerateJwtToken(user);

        // Rotate refresh token
        user.RefreshToken = GenerateRefreshToken();
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
        await _context.SaveChangesAsync();

        return newJwtToken;
    }

    private static Claim[] CreateUserClaims(User user)
    {
        return new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Email),
            new Claim(JwtRegisteredClaimNames.Name, user.Name ?? ""),
            new Claim(JwtRegisteredClaimNames.Jti, user.UserId)
        };
    }

    private static string GenerateJwtSecret()
    {
        var randomBytes = new byte[32]; // 256 bits for HMAC-SHA256
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes);
    }

    private static string GenerateRefreshToken()
    {
        var randomNumber = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }
}

public class ValidationResult
{
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public User? User { get; set; }
}

internal class LdapValidationResult
{
    public string Type { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? EmailAddress { get; set; }
}

public class TokenResponse
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public int ExpiresIn { get; set; } // In seconds
}
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
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MyApp.Api.Services.users;

public interface IAuthService
{
    Task<ValidationResult> ValidateUserAsync(string username, string password);
    Task<TokenResponse> GenerateJwtTokenAsync(User user);
    Task<TokenResponse> RefreshTokenAsync(string refreshToken);
}

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly string _jwtSecret;

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
        if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
            return new ValidationResult { Message = "Username and password are required", Type = "invalid_input" };

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
            return new ValidationResult { Message = $"Authentication error: {ex.Message}", Type = "error" };
        }
    }

    [SupportedOSPlatform("windows")]
    private async Task<LdapValidationResult> ValidateLdapCredentialsAsync(string username, string password)
    {
        string? domainPath = _configuration.GetSection("LdapSettings:DomainPath").Value;
        if (string.IsNullOrEmpty(domainPath))
            return new LdapValidationResult { Type = "config_error", Message = "LDAP configuration is missing" };

        using var context = new PrincipalContext(ContextType.Domain, domainPath);
        var user = UserPrincipal.FindByIdentity(context, username);

        if (user == null)
            return new LdapValidationResult { Type = "unknown_user", Message = "Invalid or nonexistent email" };

        if (user.IsAccountLockedOut())
            return new LdapValidationResult { Type = "account_locked", Message = "Account locked due to too many failed attempts" };

        if (string.IsNullOrEmpty(user.EmailAddress))
            return new LdapValidationResult { Type = "invalid_email", Message = "User email address is not configured in LDAP" };

        bool isValid = context.ValidateCredentials(username, password, ContextOptions.Negotiate);
        if (!isValid)
        {
            await Task.Delay(2000); // Delay to mitigate brute-force attacks
            return new LdapValidationResult { Type = "incorrect_password", Message = "Incorrect password" };
        }

        return new LdapValidationResult { Type = "success", EmailAddress = user.EmailAddress };
    }

    private async Task<User?> GetUserFromDatabaseAsync(string? emailAddress)
    {
        if (string.IsNullOrEmpty(emailAddress))
            return null;

        var user = await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                    .ThenInclude(r => r!.RoleHabilitations)
                        .ThenInclude(rh => rh.Habilitation)
            .FirstOrDefaultAsync(u => u.Email == emailAddress);

        if (user?.Department == "Direction des Systèmes d'Information")
            user.Department = "DSI";

        return user;
    }

    private ValidationResult ValidateUserAccess(User? user)
    {
        if (user == null)
            return new ValidationResult { Message = "User not found in database", Type = "user_not_found" };

        if (user.UserType == null)
            return new ValidationResult { Message = "User type is missing. Contact the administrator.", Type = "type_user_missing" };

        return new ValidationResult { Message = "Success", Type = "success", User = user };
    }

    public async Task<TokenResponse> GenerateJwtTokenAsync(User user)
    {
        if (user == null)
            throw new ArgumentNullException(nameof(user));

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSecret));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = CreateUserClaims(user);
        var token = new JwtSecurityToken(
            issuer: _configuration["JwtSettings:Issuer"],
            audience: _configuration["JwtSettings:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: credentials
        );

        var jwtToken = new JwtSecurityTokenHandler().WriteToken(token);
        var refreshToken = GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
        _context.Users.Update(user);
        await _context.SaveChangesAsync();

        return new TokenResponse
        {
            AccessToken = jwtToken,
            RefreshToken = refreshToken,
            ExpiresIn = 3600
        };
    }

    public async Task<TokenResponse> RefreshTokenAsync(string refreshToken)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
            throw new ArgumentException("Refresh token is required");

        var user = await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);

        if (user == null)
            throw new SecurityTokenException("Invalid refresh token");

        if (user.RefreshTokenExpiry < DateTime.UtcNow)
            throw new SecurityTokenException("Refresh token has expired");

        var newJwtToken = await GenerateJwtTokenAsync(user);
        return newJwtToken;
    }

    private Claim[] CreateUserClaims(User user)
    {
        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Email),
            new Claim(JwtRegisteredClaimNames.Name, user.Name ?? ""),
            new Claim(JwtRegisteredClaimNames.Jti, user.UserId),
            new Claim("user_type", user.UserType?.ToString() ?? "")
        };

        // Add roles as claims
        var roleClaims = user.UserRoles
            .Select(ur => new Claim(ClaimTypes.Role, ur.Role?.Name ?? ""))
            .Where(c => !string.IsNullOrEmpty(c.Value));
        claims.AddRange(roleClaims);

        return claims.ToArray();
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
    public int ExpiresIn { get; set; }
}
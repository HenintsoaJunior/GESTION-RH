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
using MyApp.Api.Models.classes.user;

namespace MyApp.Api.Services.users;

public interface IAuthService
{
    Task<ValidationResult> ValidateUserAsync(string username, string password);
    Task<TokenResponse> GenerateJwtTokenAsync(User user);
    Task<TokenResponse> RefreshTokenAsync(string refreshToken);
    
    IEnumerable<RoleHabilitationDto> GetUserRolesAndHabilitations(User user);
}

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(AppDbContext context, IConfiguration configuration)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
    }

    [SupportedOSPlatform("windows")]
    public async Task<ValidationResult> ValidateUserAsync(string username, string password)
    {
        if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
            return new ValidationResult { Message = "Username and password are required", Type = "invalid_input" };
        // try
        // {
        //     var ldapResult = await ValidateLdapCredentialsAsync(username, password);
        //     if (ldapResult.Type == "success")
        //     {
        //         var dbUser = await GetUserFromDatabaseAsync(ldapResult.EmailAddress);
        //         return ValidateUserAccess(dbUser);
        //     }
        //     else if (ldapResult.Type == "ldap_unavailable" || ldapResult.Type == "ldap_error")
        //     {
        //         return await FallbackValidateAsync(username, password);
        //     }
        //     else
        //     {
        //         return new ValidationResult { Message = ldapResult.Message, Type = ldapResult.Type };
        //     }
        // }
        try
        {
            return await FallbackValidateAsync(username, password);
        }
        catch (Exception ex)
        {
            return new ValidationResult { Message = $"An error occurred during authentication: {ex.Message}", Type = "error" };
        }
    }

    private async Task<ValidationResult> FallbackValidateAsync(string username, string password)
    {
        var hardcodedUsers = new Dictionary<string, (string Password, string Email)>
        {
            ["testuser"] = ("Carasco@22", "miantsafitia.rakotoarimanana@ravinala-airports.aero"),
            ["st154"] = ("Carasco@22", "miantsafitia.rakotoarimanana@ravinala-airports.aero"),
            ["00358"] = ("Carasco@22", "hery.rasolofondramanambe@ravinala-airports.aero"),
            ["00182"] = ("Carasco@22", "sedera.rasolomanana@ravinala-airports.aero"),
            ["00446"] = ("Carasco@22", "christelle.rakotomavo@ravinala-airports.aero"),
            ["00425"] = ("Carasco@22", "romain.pierru@ravinala-airports.aero"),
            ["00431"] = ("Carasco@22", "daniel.lefebvre@ravinala-airports.aero")

        };

        if (hardcodedUsers.TryGetValue(username, out var info) && info.Password == password)
        {
            var dbUser = await GetUserFromDatabaseAsync(info.Email);
            var accessResult = ValidateUserAccess(dbUser);
            if (accessResult.Type == "success")
            {
                return accessResult;
            }
            else
            {
                return new ValidationResult { Message = "User found in fallback but not authorized", Type = "unauthorized" };
            }
        }

        return new ValidationResult { Message = "Invalid credentials in fallback mode", Type = "invalid_credentials" };
    }

    [SupportedOSPlatform("windows")]
    private async Task<LdapValidationResult> ValidateLdapCredentialsAsync(string username, string password)
    {
        try
        {
            string? domainPath = _configuration.GetSection("LdapSettings:DomainPath1").Value;
            if (string.IsNullOrEmpty(domainPath))
                return new LdapValidationResult { Type = "config_error", Message = "LDAP configuration is missing" };

            using var context = new PrincipalContext(ContextType.Domain, domainPath);
            var user = UserPrincipal.FindByIdentity(context, username);

            if (user == null)
                return new LdapValidationResult { Type = "unknown_user", Message = "Invalid or nonexistent user" };

            if (user.IsAccountLockedOut())
                return new LdapValidationResult { Type = "account_locked", Message = "Account locked due to too many failed attempts" };

            if (string.IsNullOrEmpty(user.EmailAddress))
                return new LdapValidationResult { Type = "invalid_email", Message = "User email address is not configured in LDAP" };

            bool isValid = context.ValidateCredentials(username, password, ContextOptions.Negotiate);
            if (!isValid)
            {
                await Task.Delay(2000);
                return new LdapValidationResult { Type = "incorrect_password", Message = "Incorrect password" };
            }

            return new LdapValidationResult { Type = "success", EmailAddress = user.EmailAddress };
        }
        catch (PrincipalServerDownException)
        {
            return new LdapValidationResult { Type = "ldap_unavailable", Message = "Unable to connect to LDAP server" };
        }
        catch (Exception ex)
        {
            return new LdapValidationResult { Type = "ldap_error", Message = $"LDAP validation failed: {ex.Message}" };
        }
    }

    private async Task<User?> GetUserFromDatabaseAsync(string? emailAddress)
    {
        try
        {
            if (string.IsNullOrEmpty(emailAddress))
                return null;

            var user = await _context.Users
                .AsNoTracking()
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                        .ThenInclude(r => r!.RoleHabilitations)
                            .ThenInclude(rh => rh.Habilitation)
                .FirstOrDefaultAsync(u => u.Email == emailAddress);

            if (user?.Department == "Direction des Systèmes d'Information")
                user.Department = "DSI";

            return user;
        }
        catch
        {
            return null;
        }
    }

    private ValidationResult ValidateUserAccess(User? user)
    {
        if (user == null)
            return new ValidationResult { Message = "User not found in database", Type = "user_not_found" };

        return new ValidationResult { Message = "Success", Type = "success", User = user };
    }

    public async Task<TokenResponse> GenerateJwtTokenAsync(User user)
    {
        try
        {
            if (user == null)
                throw new ArgumentNullException(nameof(user));

            var jwtKey = _configuration["Jwt:Key"];
            if (string.IsNullOrEmpty(jwtKey))
                throw new InvalidOperationException("JWT key is not configured");

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = CreateUserClaims(user);
            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: credentials
            );

            var jwtToken = new JwtSecurityTokenHandler().WriteToken(token);
            var refreshToken = GenerateRefreshToken();

            _context.ChangeTracker.Clear();
            
            var userToUpdate = await _context.Users.FirstOrDefaultAsync(u => u.UserId == user.UserId);
            if (userToUpdate != null)
            {
                userToUpdate.RefreshToken = refreshToken;
                userToUpdate.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
                await _context.SaveChangesAsync();
            }

            return new TokenResponse
            {
                AccessToken = jwtToken,
                RefreshToken = refreshToken,
                ExpiresIn = 3600
            };
        }
        catch (Exception ex)
        {
            throw new Exception($"Error generating JWT token: {ex.Message}", ex);
        }
    }

    // ALTERNATIVE SOLUTION: Use ExecuteUpdateAsync (EF Core 7+)
    public async Task<TokenResponse> GenerateJwtTokenAsyncAlternative(User user)
    {
        try
        {
            if (user == null)
                throw new ArgumentNullException(nameof(user));

            var jwtKey = _configuration["Jwt:Key"];
            if (string.IsNullOrEmpty(jwtKey))
                throw new InvalidOperationException("JWT key is not configured");

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = CreateUserClaims(user);
            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: credentials
            );

            var jwtToken = new JwtSecurityTokenHandler().WriteToken(token);
            var refreshToken = GenerateRefreshToken();

            // Use ExecuteUpdateAsync to avoid tracking issues
            await _context.Users
                .Where(u => u.UserId == user.UserId)
                .ExecuteUpdateAsync(u => u
                    .SetProperty(x => x.RefreshToken, refreshToken)
                    .SetProperty(x => x.RefreshTokenExpiry, DateTime.UtcNow.AddDays(7)));

            return new TokenResponse
            {
                AccessToken = jwtToken,
                RefreshToken = refreshToken,
                ExpiresIn = 3600
            };
        }
        catch (Exception ex)
        {
            throw new Exception($"Error generating JWT token: {ex.Message}", ex);
        }
    }

    public async Task<TokenResponse> RefreshTokenAsync(string refreshToken)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(refreshToken))
                throw new ArgumentException("Refresh token is required");

            var user = await _context.Users
                .AsNoTracking() // Add AsNoTracking here to prevent tracking conflicts
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                        .ThenInclude(r => r!.RoleHabilitations)
                            .ThenInclude(rh => rh.Habilitation)
                .FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);

            if (user == null)
                throw new SecurityTokenException("Invalid refresh token");

            if (user.RefreshTokenExpiry < DateTime.UtcNow)
                throw new SecurityTokenException("Refresh token has expired");

            return await GenerateJwtTokenAsync(user);
        }
        catch (Exception ex)
        {
            throw new Exception($"Error refreshing token: {ex.Message}", ex);
        }
    }
    private Claim[] CreateUserClaims(User user)
    {
        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Email ?? ""),
            new Claim(JwtRegisteredClaimNames.Name, user.Name ?? ""),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
            new Claim("user_type", user.UserType.ToString() ?? string.Empty)
        };

        var roleClaims = user.UserRoles
            .Where(ur => ur.Role != null && !string.IsNullOrEmpty(ur.Role.Name))
            .Select(ur => new Claim(ClaimTypes.Role, ur.Role!.Name));
        claims.AddRange(roleClaims);

        return claims.ToArray();
    }

    private static string GenerateRefreshToken()
    {
        var randomNumber = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }
    
    public IEnumerable<RoleHabilitationDto> GetUserRolesAndHabilitations(User user)
    {
        if (user?.UserRoles == null)
        {
            return Enumerable.Empty<RoleHabilitationDto>();
        }

        return user.UserRoles
            .Select(ur => ur.Role)
            .Where(role => role != null)
            .Select(role => new RoleHabilitationDto
            {
                RoleName = role!.Name,
                Habilitations = role.RoleHabilitations?
                                    .Where(rh => rh.Habilitation != null)
                                    .Select(rh => rh.Habilitation!.Label) 
                                ?? Enumerable.Empty<string>()
            });
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
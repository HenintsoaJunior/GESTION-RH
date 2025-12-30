using MyApp.Api.Models.classes.user;
using System.DirectoryServices;
using System.Runtime.InteropServices;
using MyApp.Api.Entities.users;
using MyApp.Api.Services.users;
using Microsoft.Extensions.Logging;

namespace MyApp.Api.Services.ldap.user;

public interface ILdapService
{
    List<UserAd>? GetUsersFromActiveDirectory(string domainPath);
    UserAd? GetManager(string domainPath, string? displayName = null, string? mail = null);
    List<UserAd>? BuildFullOrganisationHierarchy(string domainPath);
    Task<(int Added, int Updated, int Deleted)> ActualiseUsers(string domainPath);
}

public class LdapService : ILdapService
{
    private readonly IUserService _userService;
    private readonly ILogger<LdapService> _logger;

    public LdapService(IUserService userService, ILogger<LdapService> logger)
    {
        _userService = userService ?? throw new ArgumentNullException(nameof(userService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public List<UserAd>? BuildFullOrganisationHierarchy(string domainPath)
    {
        try
        {
            List<UserAd>? users = GetUsersFromActiveDirectory(domainPath);
            if (users != null)
            {
                var userDict = users.Where(u => !string.IsNullOrEmpty(u.UserDn))
                                   .ToDictionary(u => u.UserDn!);
                
                foreach (var user in users)
                {
                    if (!string.IsNullOrEmpty(user.ManagerDn) && userDict.TryGetValue(user.ManagerDn, out var manager))
                    {
                        user.Manager = manager;
                        manager.DirectReports.Add(user);
                    }
                }
                return users;
            }
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error building full organisation hierarchy");
            throw new InvalidOperationException("Failed to build organisation hierarchy", ex);
        }
    }

    public List<UserAd>? GetUsersFromActiveDirectory(string domainPath)
    {
        if (string.IsNullOrWhiteSpace(domainPath))
            throw new ArgumentException("Domain path cannot be null or empty.", nameof(domainPath));

        if (!RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            throw new PlatformNotSupportedException("Active Directory access is only supported on Windows.");

        List<UserAd> users = new();
        try
        {
            using var entry = new DirectoryEntry(domainPath);
            using var searcher = new DirectorySearcher(entry);
            searcher.Filter = "(&(objectClass=user)(objectCategory=person)(mail=*))";
            searcher.PageSize = 2000;
            searcher.PropertiesToLoad.AddRange(new[] { 
                "displayName", 
                "mail", 
                "title", 
                "distinguishedName", 
                "department", 
                "objectGUID", 
                "userAccountControl", 
                "sAMAccountName",
                "manager"
            });

            foreach (SearchResult result in searcher.FindAll())
            {
                using var userEntry = result.GetDirectoryEntry();
                
                string displayName = userEntry.Properties["displayName"]?.Value?.ToString() ?? "";
                string matricule = userEntry.Properties["sAMAccountName"]?.Value?.ToString() ?? "";
                string department = userEntry.Properties["department"]?.Value?.ToString() ?? "";
                
                if (string.IsNullOrEmpty(displayName) || string.IsNullOrEmpty(matricule))
                {
                    continue;
                }
                
                if (!string.IsNullOrEmpty(matricule) && displayName.StartsWith(matricule))
                {
                    displayName = displayName.Substring(matricule.Length).Trim();
                }
                
                if (string.IsNullOrEmpty(department) && !string.IsNullOrEmpty(displayName))
                {
                    department = ExtractDepartmentFromDisplayName(displayName) ?? "";
                }
                
                users.Add(new UserAd
                {
                    UserId = userEntry.Properties["objectGUID"]?.Value is byte[] guid ? new Guid(guid).ToString() : "",
                    Matricule = matricule,
                    DisplayName = displayName,
                    Email = userEntry.Properties["mail"]?.Value?.ToString() ?? "",
                    Title = userEntry.Properties["title"]?.Value?.ToString() ?? "",
                    UserDn = userEntry.Properties["distinguishedName"]?.Value?.ToString() ?? "",
                    Department = department,
                    ManagerDn = userEntry.Properties["manager"]?.Value?.ToString(),
                    IsActive = userEntry.Properties["userAccountControl"]?.Value is int uac && (uac & 2) == 0
                });
            }
            
            _logger.LogInformation("Retrieved {Count} users from Active Directory", users.Count);
        }
        catch (DirectoryServicesCOMException ex)
        {
            _logger.LogError(ex, "AD Error in GetUsersFromActiveDirectory");
            throw new InvalidOperationException("Failed to access Active Directory.", ex);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected AD Error in GetUsersFromActiveDirectory");
            throw;
        }
        return users;
    }

    public UserAd? GetManager(string domainPath, string? displayName = null, string? mail = null)
    {
        if (string.IsNullOrWhiteSpace(domainPath))
            throw new ArgumentException("Domain path cannot be null or empty.", nameof(domainPath));

        if (string.IsNullOrWhiteSpace(displayName) && string.IsNullOrWhiteSpace(mail))
            throw new ArgumentException("Either displayName or mail must be provided.");

        if (!RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            throw new PlatformNotSupportedException("Active Directory access is only supported on Windows.");

        try
        {
            using var directoryEntry = new DirectoryEntry(domainPath);
            using var searcher = new DirectorySearcher(directoryEntry);
            
            if (!string.IsNullOrWhiteSpace(displayName))
            {
                string escapedDisplayName = EscapeLdapFilter(displayName);
                searcher.Filter = $"(&(objectClass=user)(displayName={escapedDisplayName}))";
            }
            else
            {
                string escapedMail = EscapeLdapFilter(mail!);
                searcher.Filter = $"(&(objectClass=user)(mail={escapedMail}))";
            }
            
            searcher.PropertiesToLoad.AddRange(new[] { "manager", "displayName", "mail", "title", "department" });

            var result = searcher.FindOne();
            if (result != null && result.Properties["manager"]?.Count > 0)
            {
                string managerDn = result.Properties["manager"][0]?.ToString() ?? "";
                
                if (!string.IsNullOrWhiteSpace(managerDn))
                {
                    using var managerSearcher = new DirectorySearcher(directoryEntry);
                    managerSearcher.Filter = $"(distinguishedName={EscapeLdapFilter(managerDn)})";
                    managerSearcher.PropertiesToLoad.AddRange(new[] { 
                        "displayName", "mail", "title", "department", "objectGUID", "sAMAccountName" 
                    });

                    var managerResult = managerSearcher.FindOne();
                    if (managerResult != null)
                    {
                        var objectGuidBytes = managerResult.Properties["objectGUID"]?.Count > 0
                            ? (byte[])managerResult.Properties["objectGUID"][0]
                            : null;
                        
                        string department = managerResult.Properties["department"]?.Count > 0
                            ? managerResult.Properties["department"][0]?.ToString() ?? ""
                            : "";
                        
                        if (string.IsNullOrEmpty(department))
                        {
                            string managerDisplayName = managerResult.Properties["displayName"]?.Count > 0
                                ? managerResult.Properties["displayName"][0]?.ToString() ?? ""
                                : "";
                            department = ExtractDepartmentFromDisplayName(managerDisplayName) ?? "";
                        }
                        
                        return new UserAd
                        {
                            UserId = objectGuidBytes != null ? new Guid(objectGuidBytes).ToString() : "",
                            Matricule = managerResult.Properties["sAMAccountName"]?.Count > 0
                                ? managerResult.Properties["sAMAccountName"][0]?.ToString() ?? ""
                                : "",
                            DisplayName = managerResult.Properties["displayName"]?.Count > 0
                                ? managerResult.Properties["displayName"][0]?.ToString() ?? ""
                                : "",
                            Email = managerResult.Properties["mail"]?.Count > 0
                                ? managerResult.Properties["mail"][0]?.ToString() ?? ""
                                : "",
                            Title = managerResult.Properties["title"]?.Count > 0
                                ? managerResult.Properties["title"][0]?.ToString() ?? ""
                                : "",
                            Department = department
                        };
                    }
                }
            }
            
            return null;
        }
        catch (DirectoryServicesCOMException ex)
        {
            _logger.LogError(ex, "AD Error in GetManager");
            throw new InvalidOperationException("Failed to access Active Directory.", ex);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected AD Error in GetManager");
            throw;
        }
    }

    public async Task<(int Added, int Updated, int Deleted)> ActualiseUsers(string domainPath)
    {
        try
        {
            _logger.LogInformation("Starting user synchronization for domain: {DomainPath}", domainPath);
            
            var adUsers = BuildFullOrganisationHierarchy(domainPath) ?? 
                throw new InvalidOperationException("Failed to retrieve users from Active Directory");
            
            var filteredAdUsers = adUsers
                .Where(x => !string.IsNullOrEmpty(x.Email) && !string.IsNullOrEmpty(x.UserId) && !string.IsNullOrEmpty(x.Matricule))
                .ToList();

            _logger.LogInformation("Found {Count} valid users in AD", filteredAdUsers.Count);

            var filteredDbUsers = new List<User>();
            await foreach (var batch in await _userService.GetAllInBatchesAsync(batchSize: 1000))
            {
                var users = batch.Select(dto => new User
                {
                    UserId = dto.UserId,
                    Email = dto.Email,
                    Name = dto.Name,
                    Department = dto.Department,
                    Position = dto.Position,
                    SuperiorId = dto.SuperiorId,
                    SuperiorName = dto.SuperiorName
                }).Where(u => !string.IsNullOrEmpty(u.Email));

                filteredDbUsers.AddRange(users);
            }

            _logger.LogInformation("Found {Count} users in database", filteredDbUsers.Count);

            var adUserDict = filteredAdUsers.ToDictionary(x => x.UserId!);
            var dbUsersDict = filteredDbUsers.ToDictionary(x => x.UserId);

            var toAdd = GetUsersToAdd(filteredAdUsers, dbUsersDict);
            var (toUpdate, toDelete) = GetUsersToUpdateOrDelete(filteredDbUsers, adUserDict);
            
            _logger.LogInformation("Changes: {Add} to add, {Update} to update, {Delete} to delete", 
                toAdd.Count, toUpdate.Count, toDelete.Count);
            
            await ApplyUserChanges(toAdd, toUpdate, toDelete);
            
            return (toAdd.Count, toUpdate.Count, toDelete.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error actualizing users for domain: {DomainPath}", domainPath);
            throw new InvalidOperationException($"Failed to actualize users: {ex.Message}", ex);
        }
    }

    private List<User> GetUsersToAdd(List<UserAd> adUsers, Dictionary<string, User> dbUsersDict)
    {
        var usersToAdd = new List<User>();
        foreach (var adUser in adUsers)
        {
            if (!dbUsersDict.ContainsKey(adUser.UserId!))
            {
                string cleanName = adUser.DisplayName ?? "";
                if (!string.IsNullOrEmpty(adUser.Matricule) && cleanName.StartsWith(adUser.Matricule))
                {
                    cleanName = cleanName.Substring(adUser.Matricule.Length).Trim();
                }
                
                string department = adUser.Department ?? "";
                if (string.IsNullOrEmpty(department) && !string.IsNullOrEmpty(adUser.DisplayName))
                {
                    department = ExtractDepartmentFromDisplayName(adUser.DisplayName) ?? "";
                }
                
                usersToAdd.Add(new User
                {
                    UserId = adUser.UserId!,
                    Matricule = adUser.Matricule ?? "",
                    Name = cleanName,
                    Email = adUser.Email ?? "",
                    Department = department,
                    Position = adUser.Title ?? "",
                    SuperiorId = adUser.Manager?.UserId,
                    SuperiorName = adUser.Manager?.DisplayName
                });
            }
        }
        return usersToAdd;
    }

    private (List<User> ToUpdate, List<User> ToDelete) GetUsersToUpdateOrDelete(
        List<User> dbUsers, 
        Dictionary<string, UserAd> adUserDict)
    {
        var usersToUpdate = new List<User>();
        var usersToDelete = new List<User>();

        foreach (var dbUser in dbUsers)
        {
            if (adUserDict.TryGetValue(dbUser.UserId, out var adUser))
            {
                string cleanName = adUser.DisplayName ?? "";
                if (!string.IsNullOrEmpty(adUser.Matricule) && cleanName.StartsWith(adUser.Matricule))
                {
                    cleanName = cleanName.Substring(adUser.Matricule.Length).Trim();
                }
                
                string department = adUser.Department ?? "";
                if (string.IsNullOrEmpty(department) && !string.IsNullOrEmpty(adUser.DisplayName))
                {
                    department = ExtractDepartmentFromDisplayName(adUser.DisplayName) ?? "";
                }

                var superiorId = adUser.Manager?.UserId;
                var superiorName = adUser.Manager?.DisplayName;

                bool needsUpdate = false;
                
                if (dbUser.Name != cleanName) 
                {
                    dbUser.Name = cleanName;
                    needsUpdate = true;
                }
                
                if (dbUser.Matricule != adUser.Matricule) 
                {
                    dbUser.Matricule = adUser.Matricule ?? "";
                    needsUpdate = true;
                }
                
                if (dbUser.Email != adUser.Email) 
                {
                    dbUser.Email = adUser.Email ?? "";
                    needsUpdate = true;
                }
                
                if (dbUser.Department != department) 
                {
                    dbUser.Department = department;
                    needsUpdate = true;
                }
                
                if (dbUser.Position != adUser.Title) 
                {
                    dbUser.Position = adUser.Title ?? "";
                    needsUpdate = true;
                }
                
                if (dbUser.SuperiorId != superiorId) 
                {
                    dbUser.SuperiorId = superiorId;
                    needsUpdate = true;
                }
                
                if (dbUser.SuperiorName != superiorName) 
                {
                    dbUser.SuperiorName = superiorName;
                    needsUpdate = true;
                }
                
                if (needsUpdate)
                {
                    usersToUpdate.Add(dbUser);
                }
            }
            else
            {
                usersToDelete.Add(dbUser);
            }
        }

        return (usersToUpdate, usersToDelete);
    }

    private async Task ApplyUserChanges(List<User> usersToAdd, List<User> usersToUpdate, List<User> usersToDelete)
    {
        const int batchSize = 50;

        try
        {
            if (usersToAdd.Count > 0)
            {
                _logger.LogInformation("Adding {Count} new users", usersToAdd.Count);
                for (int i = 0; i < usersToAdd.Count; i += batchSize)
                {
                    var batch = usersToAdd.Skip(i).Take(batchSize).ToList();
                    await _userService.AddUsersAsync(batch);
                }
            }

            if (usersToUpdate.Count > 0)
            {
                _logger.LogInformation("Updating {Count} users", usersToUpdate.Count);
                for (int i = 0; i < usersToUpdate.Count; i += batchSize)
                {
                    var batch = usersToUpdate.Skip(i).Take(batchSize).ToList();
                    await _userService.UpdateUsersAsync(batch);
                }
            }


            if (usersToDelete.Count > 0)
            {
                _logger.LogInformation("Deleting {Count} users", usersToDelete.Count);
                for (int i = 0; i < usersToDelete.Count; i += batchSize)
                {
                    var batch = usersToDelete.Skip(i).Take(batchSize).ToList();
                    await _userService.DeleteUsersAsync(batch);
                }
            }
            
            _logger.LogInformation("Successfully applied all user changes");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error applying user changes");
            throw new InvalidOperationException("Failed to apply user changes", ex);
        }
    }

    private string? ExtractDepartmentFromDisplayName(string displayName)
    {
        if (string.IsNullOrEmpty(displayName))
            return null;

        if (displayName.Contains('(') && displayName.Contains(')'))
        {
            int start = displayName.IndexOf('(') + 1;
            int end = displayName.IndexOf(')', start);
            if (end > start)
            {
                string department = displayName.Substring(start, end - start).Trim();
                department = department.ToUpper().Replace("DEPARTMENT", "").Replace("DEPT", "").Trim();
                return string.IsNullOrEmpty(department) ? null : department;
            }
        }
        
        return null;
    }

    private string EscapeLdapFilter(string filter)
    {
        if (string.IsNullOrEmpty(filter))
            return filter;

        return filter
            .Replace("\\", "\\5c")
            .Replace("*", "\\2a")
            .Replace("(", "\\28")
            .Replace(")", "\\29")
            .Replace("\0", "\\00");
    }
}
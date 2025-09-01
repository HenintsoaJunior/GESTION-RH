using MyApp.Api.Models.classes.user;
using System.DirectoryServices;
using System.Runtime.InteropServices;
using MyApp.Api.Entities.users;
using MyApp.Api.Services.users;

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

    public LdapService(IUserService userService)
    {
        _userService = userService ?? throw new ArgumentNullException(nameof(userService));
    }
    public List<UserAd>? BuildFullOrganisationHierarchy(string domainPath)
    {
        try
        {
            List<UserAd>? users = GetUsersFromActiveDirectory(domainPath);
            if (users != null)
            {
                foreach (var user in users)
                {
                    if (!string.IsNullOrWhiteSpace(user.DisplayName))
                    {
                        var manager = GetManager(domainPath, user.DisplayName);
                        if (manager != null)
                        {
                            user.DirectReports.Add(manager);
                        }
                    }
                }
                return users;
            }
            return null;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error building full organisation hierarchy: {ex.Message}");
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
            searcher.Filter = "(objectClass=user)";
            searcher.PageSize = 2000;
            searcher.PropertiesToLoad.AddRange(new[] { "displayName", "mail", "title", "distinguishedName", "department", "objectGUID", "userAccountControl", "sAMAccountName" });

            foreach (SearchResult result in searcher.FindAll())
            {
                using var userEntry = result.GetDirectoryEntry();
                users.Add(new UserAd
                {
                    UserId = userEntry.Properties["objectGUID"]?.Value is byte[] guid ? new Guid(guid).ToString() : "",
                    Matricule = userEntry.Properties["sAMAccountName"]?.Value?.ToString() ?? "",
                    DisplayName = userEntry.Properties["displayName"]?.Value?.ToString() ?? "",
                    Email = userEntry.Properties["mail"]?.Value?.ToString() ?? "",
                    Title = userEntry.Properties["title"]?.Value?.ToString() ?? "",
                    UserDn = userEntry.Properties["distinguishedName"]?.Value?.ToString() ?? "",
                    Department = userEntry.Properties["department"]?.Value?.ToString() ?? "",
                    IsActive = userEntry.Properties["userAccountControl"]?.Value is int uac && (uac & 2) == 0
                });
            }
        }
        catch (DirectoryServicesCOMException ex)
        {
            Console.WriteLine($"AD Error: {ex.Message}");
            throw new InvalidOperationException("Failed to access Active Directory.", ex);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Unexpected AD Error: {ex.Message}");
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

        string? managerDn = null;
        UserAd? manager = null;

        try
        {
            using var directoryEntry = new DirectoryEntry(domainPath);
            using var searcher = new DirectorySearcher(directoryEntry);
            searcher.Filter = string.IsNullOrWhiteSpace(displayName)
                ? $"(&(objectClass=user)(mail={mail}))"
                : $"(&(objectClass=user)(displayName={displayName}))";
            searcher.PropertiesToLoad.Add("manager");

            var result = searcher.FindOne();
            if (result != null)
            {
                managerDn = result.Properties["manager"]?.Count > 0
                    ? result.Properties["manager"][0]?.ToString()
                    : null;
            }

            if (!string.IsNullOrWhiteSpace(managerDn))
            {
                using var managerEntry = new DirectoryEntry(domainPath);
                using var managerSearcher = new DirectorySearcher(managerEntry);
                managerSearcher.Filter = $"(distinguishedName={managerDn})";
                managerSearcher.PropertiesToLoad.AddRange(new[] { "displayName", "mail", "title", "department", "objectGUID", "sAMAccountName" });

                var managerResult = managerSearcher.FindOne();
                if (managerResult != null)
                {
                    var objectGuidBytes = managerResult.Properties["objectGUID"]?.Count > 0
                        ? (byte[])managerResult.Properties["objectGUID"][0]
                        : null;
                    manager = new UserAd
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
                        Department = managerResult.Properties["department"]?.Count > 0
                            ? managerResult.Properties["department"][0]?.ToString() ?? ""
                            : ""
                    };
                }
            }
        }
        catch (DirectoryServicesCOMException ex)
        {
            Console.WriteLine($"AD Error in GetManager: {ex.Message}");
            throw new InvalidOperationException("Failed to access Active Directory.", ex);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Unexpected AD Error in GetManager: {ex.Message}");
            throw;
        }
        return manager;
    }

    public async Task<(int Added, int Updated, int Deleted)> ActualiseUsers(string domainPath)
    {
        try
        {
            var adUsers = BuildFullOrganisationHierarchy(domainPath) ?? throw new InvalidOperationException("Failed to retrieve users from Active Directory");
            var filteredAdUsers = adUsers
                .Where(x => !string.IsNullOrEmpty(x.Email))
                .ToList();

            var filteredDbUsers = new List<User>();
            await foreach (var batch in await _userService.GetAllInBatchesAsync(batchSize: 1000))
            {
                var users = await Task.Run(() => batch.Select(dto => new User
                {
                    UserId = dto.UserId,
                    Email = dto.Email,
                    Name = dto.Name,
                    Department = dto.Department,
                    Position = dto.Position,
                    SuperiorId = dto.SuperiorId,
                    SuperiorName = dto.SuperiorName
                }).Where(u => !string.IsNullOrEmpty(u.Email)));

                filteredDbUsers.AddRange(users);
            }

            var adUserDict = filteredAdUsers
                .Where(x => !string.IsNullOrEmpty(x.UserId))
                .ToDictionary(x => x.UserId!);

            var dbUsersDict = filteredDbUsers
                .ToDictionary(x => x.UserId);

            var toAdd = GetUsersToAdd(filteredAdUsers, dbUsersDict);
            var (toUpdate, toDelete) = GetUsersToUpdateOrDelete(filteredDbUsers, adUserDict);
            await ApplyUserChanges(toAdd, toUpdate, toDelete);
            return (toAdd.Count, toUpdate.Count, toDelete.Count);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error actualizing users: {ex.Message}");
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
                var superior = adUser.DirectReports?.FirstOrDefault();
                usersToAdd.Add(new User
                {
                    UserId = adUser.UserId!,
                    Matricule = adUser.Matricule!,
                    Name = adUser.DisplayName,
                    Email = adUser.Email!,
                    Department = adUser.Department,
                    Position = adUser.Title,
                    SuperiorId = superior?.UserId,
                    SuperiorName = superior?.DisplayName,
                });
            }
        }
        return usersToAdd;
    }

    private (List<User> ToUpdate, List<User> ToDelete) GetUsersToUpdateOrDelete(List<User> dbUsers, Dictionary<string, UserAd> adUserDict)
    {
        var usersToUpdate = new List<User>();
        var usersToDelete = new List<User>();

        foreach (var dbUser in dbUsers)
        {
            if (adUserDict.TryGetValue(dbUser.UserId, out var adUser))
            {
                string? depart = adUser.Department;
                if (string.IsNullOrEmpty(adUser.Department) && adUser.DisplayName != null && adUser.DisplayName.Contains('('))
                {
                    var parts = adUser.DisplayName.Split('(', ')');
                    if (parts.Length > 1)
                    {
                        depart = parts[1].Trim();
                    }
                }

                var superiorId = adUser.DirectReports?.FirstOrDefault()?.UserId;
                var superiorName = adUser.DirectReports?.FirstOrDefault()?.DisplayName;

                if (dbUser.Name != adUser.DisplayName || 
                    dbUser.Matricule != adUser.Matricule ||
                    dbUser.Email != adUser.Email ||
                    dbUser.Department != depart || 
                    dbUser.Position != adUser.Title ||
                    dbUser.SuperiorId != superiorId || 
                    dbUser.SuperiorName != superiorName)
                {
                    dbUser.Name = adUser.DisplayName;
                    dbUser.Matricule = adUser.Matricule!;
                    dbUser.Email = adUser.Email!;
                    dbUser.Department = depart;
                    dbUser.Position = adUser.Title;
                    dbUser.SuperiorId = superiorId;
                    dbUser.SuperiorName = superiorName;
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
        const int batchSize = 10;

        try
        {
            if (usersToAdd.Count > 0)
            {
                for (int i = 0; i < usersToAdd.Count; i += batchSize)
                {
                    var batch = usersToAdd.Skip(i).Take(batchSize).ToList();
                    await _userService.AddUsersAsync(batch);
                }
            }

            if (usersToUpdate.Count > 0)
            {
                for (int i = 0; i < usersToUpdate.Count; i += batchSize)
                {
                    var batch = usersToUpdate.Skip(i).Take(batchSize).ToList();
                    await _userService.UpdateUsersAsync(batch);
                }
            }

            if (usersToDelete.Count > 0)
            {
                for (int i = 0; i < usersToDelete.Count; i += batchSize)
                {
                    var batch = usersToDelete.Skip(i).Take(batchSize).ToList();
                    await _userService.DeleteUsersAsync(batch);
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error applying user changes: {ex.Message}");
            throw new InvalidOperationException("Failed to apply user changes", ex);
        }
    }
}

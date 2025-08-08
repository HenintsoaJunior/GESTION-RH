using MyApp.Api.Models.classes.user;
using System.DirectoryServices;
using System.Runtime.InteropServices;

namespace MyApp.Api.Services.ldap.user;

public interface ILdapService
{
    List<UserAd>? GetUsersFromActiveDirectory(string domainPath);
    UserAd? GetManager(string domainPath, string? displayName = null, string? mail = null);
}

public class LdapService : ILdapService
{
    public List<UserAd>? GetUsersFromActiveDirectory(string domainPath)
    {
        if (string.IsNullOrWhiteSpace(domainPath))
            throw new ArgumentException("Domain path cannot be null or empty.", nameof(domainPath));

        if (!RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            throw new PlatformNotSupportedException("Active Directory access is only supported on Windows.");
        
        List<UserAd>? users = new();
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
                    Id = userEntry.Properties["objectGUID"]?.Value is byte[] guid ? new Guid(guid).ToString() : "",
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
                        Id = objectGuidBytes != null ? new Guid(objectGuidBytes).ToString() : "",
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
}
using MyApp.Api.Models.classes.objectclass;
using System.DirectoryServices;
using System.Runtime.InteropServices;

namespace MyApp.Api.Services.ldap.objectclass;

public interface IObjectClassService
{
    List<ObjectClassAd>? GetObjectClassesFromActiveDirectory(string domainPath);
    List<ObjectClassSchema>? GetObjectClassSchema(string domainPath);
    Dictionary<string, int>? GetObjectClassCounts(string domainPath);
    
    ObjectClassSchema? GetObjectClassAttributes(string domainPath, string objectClassName); // Nouvelle méthode
}

public class ObjectClassService : IObjectClassService
{
    
    public ObjectClassSchema? GetObjectClassAttributes(string domainPath, string objectClassName)
    {
        if (string.IsNullOrWhiteSpace(domainPath))
            throw new ArgumentException("Domain path cannot be null or empty.", nameof(domainPath));
        
        if (string.IsNullOrWhiteSpace(objectClassName))
            throw new ArgumentException("Object class name cannot be null or empty.", nameof(objectClassName));

        if (!RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            throw new PlatformNotSupportedException("Active Directory access is only supported on Windows.");

        try
        {
            // Accès au schéma Active Directory
            var rootDse = new DirectoryEntry("LDAP://RootDSE");
            var schemaNamingContext = rootDse.Properties["schemaNamingContext"].Value?.ToString();
            
            if (string.IsNullOrEmpty(schemaNamingContext))
            {
                throw new InvalidOperationException("Could not retrieve schema naming context.");
            }

            using var schemaEntry = new DirectoryEntry($"LDAP://{schemaNamingContext}");
            using var searcher = new DirectorySearcher(schemaEntry);
            
            // Filtre pour une classe spécifique
            searcher.Filter = $"(&(objectCategory=classSchema)(cn={objectClassName}))";
            searcher.PropertiesToLoad.AddRange(new[] { 
                "cn", "description", "governsID", "subClassOf", 
                "mustContain", "mayContain", "systemMustContain", "systemMayContain" 
            });

            var result = searcher.FindOne();
            if (result == null)
            {
                return null;
            }

            var schema = new ObjectClassSchema
            {
                Name = result.Properties["cn"]?.Count > 0 
                    ? result.Properties["cn"][0]?.ToString() ?? ""
                    : "",
                Description = result.Properties["description"]?.Count > 0 
                    ? result.Properties["description"][0]?.ToString() 
                    : null,
                Oid = result.Properties["governsID"]?.Count > 0 
                    ? result.Properties["governsID"][0]?.ToString() 
                    : null
            };

            // Superior classes
            if (result.Properties["subClassOf"]?.Count > 0)
            {
                foreach (string superClass in result.Properties["subClassOf"])
                {
                    if (!string.IsNullOrEmpty(superClass))
                        schema.SuperiorClasses.Add(superClass);
                }
            }

            // Mandatory attributes
            var mustContain = new List<string>();
            if (result.Properties["mustContain"]?.Count > 0)
            {
                foreach (string attr in result.Properties["mustContain"])
                {
                    if (!string.IsNullOrEmpty(attr))
                        mustContain.Add(attr);
                }
            }
            if (result.Properties["systemMustContain"]?.Count > 0)
            {
                foreach (string attr in result.Properties["systemMustContain"])
                {
                    if (!string.IsNullOrEmpty(attr))
                        mustContain.Add(attr);
                }
            }
            schema.MustContain = mustContain.Distinct().ToList();

            // Optional attributes
            var mayContain = new List<string>();
            if (result.Properties["mayContain"]?.Count > 0)
            {
                foreach (string attr in result.Properties["mayContain"])
                {
                    if (!string.IsNullOrEmpty(attr))
                        mayContain.Add(attr);
                }
            }
            if (result.Properties["systemMayContain"]?.Count > 0)
            {
                foreach (string attr in result.Properties["systemMayContain"])
                {
                    if (!string.IsNullOrEmpty(attr))
                        mayContain.Add(attr);
                }
            }
            schema.MayContain = mayContain.Distinct().ToList();

            return schema;
        }
        catch (DirectoryServicesCOMException ex)
        {
            Console.WriteLine($"AD Schema Error: {ex.Message}");
            throw new InvalidOperationException($"Failed to access Active Directory schema for object class {objectClassName}.", ex);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Unexpected Schema Error: {ex.Message}");
            throw;
        }
    }
    public List<ObjectClassAd>? GetObjectClassesFromActiveDirectory(string domainPath)
    {
        if (string.IsNullOrWhiteSpace(domainPath))
            throw new ArgumentException("Domain path cannot be null or empty.", nameof(domainPath));

        if (!RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            throw new PlatformNotSupportedException("Active Directory access is only supported on Windows.");

        List<ObjectClassAd> objectClasses = new();
        try
        {
            using var entry = new DirectoryEntry(domainPath);
            using var searcher = new DirectorySearcher(entry);
            
            // Recherche tous les objets pour identifier les objectClass utilisés
            searcher.Filter = "(objectClass=*)";
            searcher.PageSize = 2000;
            searcher.PropertiesToLoad.AddRange(new[] { "objectClass", "distinguishedName" });

            var objectClassCounts = new Dictionary<string, int>();
            
            foreach (SearchResult result in searcher.FindAll())
            {
                var objectClassProperty = result.Properties["objectClass"];
                if (objectClassProperty?.Count > 0)
                {
                    foreach (string objClass in objectClassProperty)
                    {
                        if (!string.IsNullOrEmpty(objClass))
                        {
                            objectClassCounts[objClass] = objectClassCounts.GetValueOrDefault(objClass, 0) + 1;
                        }
                    }
                }
            }

            // Convertir en ObjectClassAd
            foreach (var kvp in objectClassCounts)
            {
                objectClasses.Add(new ObjectClassAd
                {
                    ObjectClassName = kvp.Key,
                    ObjectCount = kvp.Value,
                    Description = GetObjectClassDescription(kvp.Key),
                    MandatoryAttributes = GetMandatoryAttributes(kvp.Key),
                    OptionalAttributes = GetOptionalAttributes(kvp.Key)
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

        return objectClasses.OrderBy(x => x.ObjectClassName).ToList();
    }

    public List<ObjectClassSchema>? GetObjectClassSchema(string domainPath)
    {
        if (string.IsNullOrWhiteSpace(domainPath))
            throw new ArgumentException("Domain path cannot be null or empty.", nameof(domainPath));

        if (!RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            throw new PlatformNotSupportedException("Active Directory access is only supported on Windows.");

        List<ObjectClassSchema> schemaList = new();
        try
        {
            // Accès au schéma Active Directory
            var rootDse = new DirectoryEntry("LDAP://RootDSE");
            var schemaNamingContext = rootDse.Properties["schemaNamingContext"].Value?.ToString();
            
            if (string.IsNullOrEmpty(schemaNamingContext))
            {
                throw new InvalidOperationException("Could not retrieve schema naming context.");
            }

            using var schemaEntry = new DirectoryEntry($"LDAP://{schemaNamingContext}");
            using var searcher = new DirectorySearcher(schemaEntry);
            
            searcher.Filter = "(objectCategory=classSchema)";
            searcher.PageSize = 1000;
            searcher.PropertiesToLoad.AddRange(new[] { 
                "cn", "description", "governsID", "subClassOf", "mustContain", 
                "mayContain", "systemMustContain", "systemMayContain" 
            });

            foreach (SearchResult result in searcher.FindAll())
            {
                var schema = new ObjectClassSchema
                {
                    Name = result.Properties["cn"]?.Count > 0 
                        ? result.Properties["cn"][0]?.ToString() ?? ""
                        : "",
                    Description = result.Properties["description"]?.Count > 0 
                        ? result.Properties["description"][0]?.ToString() 
                        : null,
                    Oid = result.Properties["governsID"]?.Count > 0 
                        ? result.Properties["governsID"][0]?.ToString() 
                        : null
                };

                // Superior classes
                if (result.Properties["subClassOf"]?.Count > 0)
                {
                    foreach (string superClass in result.Properties["subClassOf"])
                    {
                        if (!string.IsNullOrEmpty(superClass))
                            schema.SuperiorClasses.Add(superClass);
                    }
                }

                // Mandatory attributes
                var mustContain = new List<string>();
                if (result.Properties["mustContain"]?.Count > 0)
                {
                    foreach (string attr in result.Properties["mustContain"])
                    {
                        if (!string.IsNullOrEmpty(attr))
                            mustContain.Add(attr);
                    }
                }
                if (result.Properties["systemMustContain"]?.Count > 0)
                {
                    foreach (string attr in result.Properties["systemMustContain"])
                    {
                        if (!string.IsNullOrEmpty(attr))
                            mustContain.Add(attr);
                    }
                }
                schema.MustContain = mustContain.Distinct().ToList();

                // Optional attributes
                var mayContain = new List<string>();
                if (result.Properties["mayContain"]?.Count > 0)
                {
                    foreach (string attr in result.Properties["mayContain"])
                    {
                        if (!string.IsNullOrEmpty(attr))
                            mayContain.Add(attr);
                    }
                }
                if (result.Properties["systemMayContain"]?.Count > 0)
                {
                    foreach (string attr in result.Properties["systemMayContain"])
                    {
                        if (!string.IsNullOrEmpty(attr))
                            mayContain.Add(attr);
                    }
                }
                schema.MayContain = mayContain.Distinct().ToList();

                schemaList.Add(schema);
            }
        }
        catch (DirectoryServicesCOMException ex)
        {
            Console.WriteLine($"AD Schema Error: {ex.Message}");
            throw new InvalidOperationException("Failed to access Active Directory schema.", ex);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Unexpected Schema Error: {ex.Message}");
            throw;
        }

        return schemaList.OrderBy(x => x.Name).ToList();
    }

    public Dictionary<string, int>? GetObjectClassCounts(string domainPath)
    {
        if (string.IsNullOrWhiteSpace(domainPath))
            throw new ArgumentException("Domain path cannot be null or empty.", nameof(domainPath));

        if (!RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            throw new PlatformNotSupportedException("Active Directory access is only supported on Windows.");

        var objectClassCounts = new Dictionary<string, int>();
        try
        {
            using var entry = new DirectoryEntry(domainPath);
            using var searcher = new DirectorySearcher(entry);
            
            searcher.Filter = "(objectClass=*)";
            searcher.PageSize = 2000;
            searcher.PropertiesToLoad.Add("objectClass");

            foreach (SearchResult result in searcher.FindAll())
            {
                var objectClassProperty = result.Properties["objectClass"];
                if (objectClassProperty?.Count > 0)
                {
                    foreach (string objClass in objectClassProperty)
                    {
                        if (!string.IsNullOrEmpty(objClass))
                        {
                            objectClassCounts[objClass] = objectClassCounts.GetValueOrDefault(objClass, 0) + 1;
                        }
                    }
                }
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

        return objectClassCounts;
    }

    private string? GetObjectClassDescription(string objectClassName)
    {
        // Descriptions communes pour les objectClass standards
        return objectClassName.ToLower() switch
        {
            "user" => "User account objects",
            "computer" => "Computer account objects",
            "group" => "Security and distribution groups",
            "organizationalunit" => "Organizational unit containers",
            "container" => "General purpose containers",
            "domain" => "Domain objects",
            "contact" => "Contact objects",
            "inetorgperson" => "Internet organizational person",
            "person" => "Person objects",
            "organizationalperson" => "Organizational person objects",
            "top" => "Base object class for all objects",
            _ => null
        };
    }

    private List<string> GetMandatoryAttributes(string objectClassName)
    {
        // Attributs obligatoires pour les objectClass courants
        return objectClassName.ToLower() switch
        {
            "user" => new List<string> { "cn", "sAMAccountName" },
            "computer" => new List<string> { "cn", "sAMAccountName" },
            "group" => new List<string> { "cn", "sAMAccountName" },
            "organizationalunit" => new List<string> { "ou" },
            "contact" => new List<string> { "cn" },
            "person" => new List<string> { "cn", "sn" },
            "organizationalperson" => new List<string> { "cn", "sn" },
            _ => new List<string>()
        };
    }

    private List<string> GetOptionalAttributes(string objectClassName)
    {
        // Attributs optionnels pour les objectClass courants
        return objectClassName.ToLower() switch
        {
            "user" => new List<string> { "displayName", "mail", "title", "department", "manager", "telephoneNumber" },
            "computer" => new List<string> { "description", "operatingSystem", "operatingSystemVersion" },
            "group" => new List<string> { "description", "mail", "member" },
            "organizationalunit" => new List<string> { "description", "managedBy" },
            "contact" => new List<string> { "mail", "telephoneNumber", "title", "company" },
            "person" => new List<string> { "description", "telephoneNumber" },
            "organizationalperson" => new List<string> { "title", "ou", "telephoneNumber", "facsimileTelephoneNumber" },
            _ => new List<string>()
        };
    }
}
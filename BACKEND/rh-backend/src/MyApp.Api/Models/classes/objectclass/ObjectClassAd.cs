// Models/classes/objectclass/ObjectClassAd.cs
namespace MyApp.Api.Models.classes.objectclass;

public class ObjectClassAd
{
    public string ObjectClassName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public List<string> MandatoryAttributes { get; set; } = new();
    public List<string> OptionalAttributes { get; set; } = new();
    public string? SuperiorClass { get; set; }
    public int ObjectCount { get; set; }
}

// Models/classes/objectclass/ObjectClassSchema.cs
public class ObjectClassSchema
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Oid { get; set; }
    public List<string> SuperiorClasses { get; set; } = new();
    public List<string> MustContain { get; set; } = new();
    public List<string> MayContain { get; set; } = new();
}
namespace MyApp.Api.Models.classes.user;

public class UserAd
{
    public string? UserId { get; set; }
    public string? Matricule {get; set;}
    public string? DisplayName { get; set; }
    public string? Email { get; set; }
    public string? Title { get; set; }
    public string? UserDn { get; set; }
    public string? Department { get; set; }
    public List<UserAd?> DirectReports { get; set; } = new List<UserAd?>();
    public bool IsActive { get; set; }   
}
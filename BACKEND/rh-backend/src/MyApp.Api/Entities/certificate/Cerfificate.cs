namespace MyApp.Api.Entities.certificate;

public class Cerfificate
{
    public string? EmployeeName {get; set;}
    public DateTime BirthDate {get; set;} 
    public string? BirthPlace {get; set;} 
    public string Gender {get; set;} = null!;
    public string? JobTitle {get; set;}
    public string? IssuePlace {get; set;} 
    public string? SignatoryName {get; set;}

    public string? CompanyName { get; set; }
    public string? FooterDetails { get; set; }
}
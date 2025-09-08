namespace MyApp.Api.Entities.certificate;

public class EmployeeCertificate : Cerfificate
{
    
    public string? CinNumber {get; set;} 
    public string? CinIssueDate {get; set;} 
    public string? CinIssuePlace {get; set;} 
    public DateTime HiringDate { get; set; }
    public string? ProfessionalCategory {get; set;} 
    public string? ContractType {get; set;} 
    public string? Service {get; set;} 
}
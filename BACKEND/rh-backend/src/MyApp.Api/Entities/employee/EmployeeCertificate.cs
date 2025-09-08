namespace MyApp.Api.Entities.employee;

public class EmployeeCertificate(
    string employeeName,
    string birthDate,
    string birthPlace,
    string gender,
    string cinNumber,
    string cinIssueDate,
    string cinIssuePlace,
    string jobTitle,
    string professionalCategory,
    string issuePlace,
    string service,
    string signatory)
{
    public string EmployeeName {get; set;} = employeeName;
    public string BirthDate {get; set;} = birthDate;
    public string BirthPlace {get; set;} = birthPlace;
    public string Gender {get; set;} = gender;
    public string CinNumber {get; set;} = cinNumber;
    public string CinIssueDate {get; set;} = cinIssueDate;
    public string CinIssuePlace {get; set;} = cinIssuePlace;
    public string JobTitle {get; set;} = jobTitle;
    public string ProfessionalCategory {get; set;} = professionalCategory;
    public string IssuePlace {get; set;} = issuePlace;
    public string Service {get; set;} = service;
    public string Signatory {get; set;} = signatory;
}
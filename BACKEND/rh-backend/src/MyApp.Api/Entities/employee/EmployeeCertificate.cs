namespace MyApp.Api.Entities.employee;

public class EmployeeCertificate(
    string employeeName,
    string birthDate,
    string birthPlace,
    string cinNumber,
    string cinIssueDate,
    string cinIssuePlace,
    string jobTitle,
    string professionalCategory,
    string companyName,
    string? issueDate,
    string issuePlace)
{
    public string EmployeeName {get; set;} = employeeName;
    public string BirthDate {get; set;} = birthDate;
    public string BirthPlace {get; set;} = birthPlace;
    public string CinNumber {get; set;} = cinNumber;
    public string CinIssueDate {get; set;} = cinIssueDate;
    public string CinIssuePlace {get; set;} = cinIssuePlace;
    public string JobTitle {get; set;} = jobTitle;
    public string ProfessionalCategory {get; set;} = professionalCategory;
    public string CompanyName {get; set;} = companyName;
    public string? IssueDate {get; set;} = issueDate;
    public string IssuePlace {get; set;} = issuePlace;
}
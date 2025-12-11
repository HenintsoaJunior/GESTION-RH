namespace MyApp.Api.Models.dto.recruitment;

public class RequestListDTO
{
    public string Id  {get; set;} = null!;
    public string Post {get; set;} = null!;
    public short Effective {get; set;}
    public string? Contract {get; set;}
    public DateOnly WishedDate {get; set;}
    public string Status {get; set;} = null!;
    public DateOnly SendingDate {get; set;}
}


public class RequestDetailsDTO
{
    public string Id  {get; set;} = null!;
    public string ApplicantUser {get; set;} = null!;
    public string Status {get; set;} = null!;
    public bool IsReplacement {get; set;}
    public DateOnly? ReplacementDate {get; set;}
    public string? ReplacementReason {get; set;}
    public string? ReasonPrecision {get; set;}
    public string? LastTitular {get; set;}
    public string[] Sites {get; set;} = [];
    public string? Contract {get; set;}
    public string? ContractPrecision {get; set;}
    public short? MonthDuration {get; set;}
    public DateOnly BeginningDate {get; set;}
    public int ValidationLevel {get; set;}
    public bool IsPlanned {get; set;}
    public string? NotPlannedReason {get; set;}
}


public class ValidationDTO
{
    public RequestDetailsDTO RequestDetails {get; set;} = null!;
    public byte[] Signatures {get; set;} = null!;
}


public class FilterRequestListDTO
{
    public string? post {get; set;}
    public string? contract {get; set;}
    public string? status {get; set;}
    public string? direction {get; set;}
    public DateOnly? maxDate {get; set;}
    public DateOnly? minDate {get; set;}
}

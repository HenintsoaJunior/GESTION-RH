using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Models.dto.recruitment;

public class RequestListDTO
{
    public string Id  {get; set;} = null!;
    public string Post {get; set;} = null!;
    public int Effective {get; set;}
    public string Contract {get; set;} = null!;
    public DateOnly WishedDate {get; set;}
    public string Status {get; set;} = null!;
    public DateOnly SendingDate {get; set;}
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

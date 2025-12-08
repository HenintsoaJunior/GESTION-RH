using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Models.dto.mission
{
    public class CompensationStatusFilter
    {
        public string? Status { get; set; }
        public string? EmployeeId { get; set; }
        public string? EmployeeMatricule { get; set; }
        public string? RequestDateFrom { get; set; }
        public string? RequestDateTo { get; set; }
        public string? ValidationDateFrom { get; set; }
        public string? ValidationDateTo { get; set; }
    }
}
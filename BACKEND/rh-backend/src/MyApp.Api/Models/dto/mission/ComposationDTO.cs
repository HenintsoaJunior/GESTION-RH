using MyApp.Api.Entities.mission;

namespace MyApp.Api.Models.dto.mission;

public class CompensationDTO
{
    public decimal TransportAmount { get; set; }
    public decimal BreakfastAmount { get; set; }
    public decimal LunchAmount { get; set; }
    public decimal DinnerAmount { get; set; }
    public decimal AccommodationAmount { get; set; }
    
    public decimal CommunicationAmount { get; set; }
    
    public decimal VisaAmount { get; set; }
    public decimal MedicalExpensesAmount { get; set; }
    public decimal TaxesAmount { get; set; }
    public string Status { get; set; } = "unpaid";
    public DateTime? PaymentDate { get; set; }
    public string Devise { get; set; } = null!;
    public string MissionId { get; set; } = null!;
    public string EmployeeId { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class AssignationWithCompensationsDto
{
    public Mission Mission { get; set; } = null!;
    public IEnumerable<Compensation> Compensations { get; set; } = Enumerable.Empty<Compensation>();
}
using MyApp.Api.Entities.mission;

namespace MyApp.Api.Models.dto.mission;

public class CompensationDTO
{
    public decimal TransportAmount { get; set; }
    public decimal BreakfastAmount { get; set; }
    public decimal LunchAmount { get; set; }
    public decimal DinnerAmount { get; set; }
    public decimal AccommodationAmount { get; set; }
    public string Status { get; set; } = "unpaid";
    public DateTime? PaymentDate { get; set; }
    public string Devise { get; set; } = null!;
    public string AssignationId { get; set; } = null!;
    public string EmployeeId { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class AssignationWithCompensationsDto
{
    public MissionAssignation Assignation { get; set; } = null!;
    public IEnumerable<Compensation> Compensations { get; set; } = Enumerable.Empty<Compensation>();
}
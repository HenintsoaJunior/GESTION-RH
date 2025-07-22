namespace MyApp.Api.Models.form.mission
{
    public class MissionAssignationDTOForm
    {
        public string EmployeeId { get; set; } = null!;
        public string MissionId { get; set; } = null!;
        public string TransportId { get; set; } = null!;
        public DateTime DepartureDate { get; set; }
        public TimeSpan? DepartureTime { get; set; }
        public DateTime? ReturnDate { get; set; }
        public TimeSpan? ReturnTime { get; set; }
        public int? Duration { get; set; }
    }
}

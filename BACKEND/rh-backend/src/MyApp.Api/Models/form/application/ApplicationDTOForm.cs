namespace MyApp.Api.Models.form.application;

public class ApplicationDTOForm
{
    public DateTime ApplicationDate { get; set; } = DateTime.UtcNow;
    public byte[] Cv { get; set; } = null!;
    public byte[] MotivationLetter { get; set; } = null!;
    public short? MatchingScore { get; set; }
    public string Status { get; set; } = "SOUMIS";
    public string? OfferId { get; set; }
    public string CandidateId { get; set; } = null!;
}
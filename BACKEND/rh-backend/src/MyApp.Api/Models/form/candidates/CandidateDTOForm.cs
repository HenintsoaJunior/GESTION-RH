namespace MyApp.Api.Models.form.candidates
{
    public class CandidateDTOForm
    {
        public string LastName { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public DateTime? BirthDate { get; set; }
        public string? Address { get; set; }
        public string Email { get; set; } = string.Empty;
    }
}

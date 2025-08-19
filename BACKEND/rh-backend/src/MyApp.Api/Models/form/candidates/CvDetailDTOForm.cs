namespace MyApp.Api.Models.form.candidates
{
    public class CvDetailDTOForm
    {
        public string? ExtractedSkills { get; set; }
        public string? ExtractedExperience { get; set; }
        public string? ExtractedEducation { get; set; }
        public string? ExtractedLanguages { get; set; }
        public string ApplicationId { get; set; } = null!;
    }
}
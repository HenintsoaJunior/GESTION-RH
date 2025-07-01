namespace MyApp.Api.Models.menu
{
    public class LanguageDto
    {
        public string LanguageId { get; set; } = default!;
        public string LanguageName { get; set; } = default!;
        public string Abr { get; set; } = default!;
        public string CountryCode { get; set; } = default!;
        public bool IsActive { get; set; } = true;
    }
}

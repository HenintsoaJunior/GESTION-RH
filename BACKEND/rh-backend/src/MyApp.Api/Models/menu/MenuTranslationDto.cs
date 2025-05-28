namespace MyApp.Api.Models.menu
{
    public class MenuTranslationDto
    {
        public string TranslationId { get; set; } = null!;
        public string Label { get; set; } = null!;
        public string LanguageId { get; set; } = null!;
        public string MenuId { get; set; } = null!;
    }
}

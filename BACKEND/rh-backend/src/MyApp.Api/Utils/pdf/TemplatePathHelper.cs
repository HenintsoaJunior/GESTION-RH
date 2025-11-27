namespace MyApp.Api.Utils.pdf
{
    public static class TemplatePathHelper
    {
        private static readonly string TemplatesFolder = Path.Combine(AppContext.BaseDirectory, "Templates");

        public static string GetTemplatePath(string templateName)
        {
            var path = Path.Combine(TemplatesFolder, templateName);
            if (!File.Exists(path))
            {
                throw new FileNotFoundException($"Template non trouvé : {templateName}", path);
            }
            return path;
        }
    }
}
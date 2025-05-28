using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json;
using rh_backend.Models.CV;

namespace rh_backend.Models.CV
{
    public class ScanCV
    {
        private readonly HttpClient _httpClient;

        public ScanCV()
        {
            _httpClient = new HttpClient();
        }

        public CVData Scan(string filePath)
        {
            using var form = new MultipartFormDataContent();
            using var fileStream = File.OpenRead(filePath);
            using var fileContent = new StreamContent(fileStream);

            fileContent.Headers.ContentType = MediaTypeHeaderValue.Parse("application/pdf");
            form.Add(fileContent, "cv", Path.GetFileName(filePath));

            var response = _httpClient.PostAsync("http://localhost:5000/parse-cv", form).Result;
            response.EnsureSuccessStatusCode();

            var json = response.Content.ReadAsStringAsync().Result;

            // Désérialisation simple (tu peux adapter selon les clés de l'API Python)
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;

            var data = new CVData
            {
                Name = root.GetPropertyOrDefault("name"),
                Email = root.GetPropertyOrDefault("email"),
                Phone = root.GetPropertyOrDefault("mobile_number")
            };

            if (root.TryGetProperty("experience", out var expArray) && expArray.ValueKind == JsonValueKind.Array)
            {
                foreach (var exp in expArray.EnumerateArray())
                {
                    data.Experiences.Add(new Experience
                    {
                        Company = exp.GetPropertyOrDefault("company"),
                        JobTitle = exp.GetPropertyOrDefault("designation"),
                        StartDate = exp.GetPropertyOrDefault("start_date"),
                        EndDate = exp.GetPropertyOrDefault("end_date"),
                        Description = exp.GetPropertyOrDefault("job_description")
                    });
                }
            }

            if (root.TryGetProperty("education", out var eduArray) && eduArray.ValueKind == JsonValueKind.Array)
            {
                foreach (var edu in eduArray.EnumerateArray())
                {
                    data.Educations.Add(new Education
                    {
                        Degree = edu.GetPropertyOrDefault("degree"),
                        Institution = edu.GetPropertyOrDefault("institution"),
                        Date = edu.GetPropertyOrDefault("date")
                    });
                }
            }

            return data;
        }
    }

    public static class JsonElementExtensions
    {
        public static string GetPropertyOrDefault(this JsonElement element, string propertyName)
        {
            return element.TryGetProperty(propertyName, out var prop) ? prop.GetString() : null;
        }
    }
}

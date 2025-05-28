using System.Collections.Generic;

namespace rh_backend.Models.CV
{
    public class CVData
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }

        public List<Experience> Experiences { get; set; } = new();
        public List<Education> Educations { get; set; } = new();
    }

    public class Experience
    {
        public string Company { get; set; }
        public string JobTitle { get; set; }
        public string StartDate { get; set; }
        public string EndDate { get; set; }
        public string Description { get; set; }
    }

    public class Education
    {
        public string Degree { get; set; }
        public string Institution { get; set; }
        public string Date { get; set; }
    }
}

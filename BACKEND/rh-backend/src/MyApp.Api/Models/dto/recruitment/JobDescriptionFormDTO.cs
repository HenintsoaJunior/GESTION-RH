using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Models.dto.recruitment
{
    public class JobDescriptionFormDTO
    {
    // Infos générales
        [Required(ErrorMessage = "Demande de recrutement obligatoire")]
        public string RequestId { get; set; } = null!;

        [Required(ErrorMessage = "Mission obligatoire")]
        public string Mission { get; set; } = null!;

        [Required(ErrorMessage = "Les attributions sont obligatoires.")]
        [MinLength(1, ErrorMessage = "Au moins une attribution est requise.")]
        public string[] Attributions { get; set; } = null!;

    // Formations et expériences
        [Required(ErrorMessage = "Les formations sont obligatoires.")]
        [MinLength(1)]
        public FormationDTO[] Formations { get; set; } = null!;

        [Required(ErrorMessage = "Les expériences sont obligatoires.")]
        [MinLength(1)]
        public ExperienceDTO[] Experiences { get; set; } = null!;

    // Qualités perso et compétences
        [Required(ErrorMessage = "Les qualités personnelles sont obligatoires.")]
        [MinLength(1)]
        public SuitabilityDTO[] Suitabilities { get; set; } = null!;

        [Required(ErrorMessage = "Les compétences sont obligatoires.")]
        [MinLength(1, ErrorMessage = "Au moins une compétence est requise.")]
        public SkillDTO[] Skills { get; set; } = null!;
    }

    public class FormationDTO
    {
        [Required]
        public string EducationId { get; set; } = null!;

        [Required]
        public string LevelEducationId { get; set; } = null!;
    }

    public class ExperienceDTO
    {
        [Required]
        public string ExperiencePost { get; set; } = null!;

        [Required]
        public short ExperienceYears { get; set; }
    }

    public class SuitabilityDTO
    {
        [Required]
        public string PersonnalSuitabilityId { get; set; } = null!;
    }

    public class SkillDTO
    {
        [Required]
        public string Label { get; set; } = null!;
    }
}

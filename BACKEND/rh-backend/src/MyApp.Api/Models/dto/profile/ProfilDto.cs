using System.ComponentModel.DataAnnotations;
using MyApp.Api.Entities.users_simple;
using MyApp.Api.Models.dto.users_simple;
namespace MyApp.Api.Models.dto.profile
{
    public class EducationDto
    {
        public string UtilisateurId { get; set; } = null!;
        public string Etablissement { get; set; } = null!;
        public string Diplome { get; set; } = null!;
        public string Annee { get; set; } = null!;
    }

    public class ExperienceDto
    {
        public string UtilisateurId { get; set; } = null!;
        public string Entreprise { get; set; } = null!;
        public string Poste { get; set; } = null!;
        public string Duree { get; set; } = null!;
        public string? Description { get; set; }
    }


    public class LanguageDto
    {
        public string UtilisateurId { get; set; } = null!;
        public string Langue { get; set; } = null!;
        public string Niveau { get; set; } = null!;
    }

    public class PersonalQualityDto
    {
        public string UtilisateurId { get; set; } = null!;
        public string Qualite { get; set; } = null!;
    }

    public class SkillDto
    {
        public string UtilisateurId { get; set; } = null!;
        public string Competence { get; set; } = null!;
    }


    public enum ProfileEntityType
    {
        Education = 0,
        Experience = 1,
        Skill = 2,
        PersonalQuality = 3,
        Language = 4
    }

    public class ProfileItemDto
    {
        public ProfileEntityType EntityType { get; set; }
        public string UtilisateurId { get; set; } = string.Empty;
        public string? EducationId { get; set; }
        public string Etablissement { get; set; } = string.Empty;
        public string Diplome { get; set; } = string.Empty;
        public string Annee { get; set; } = string.Empty;
        public string? ExperienceId { get; set; }
        public string Entreprise { get; set; } = string.Empty;
        public string Poste { get; set; } = string.Empty;
        public string Duree { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? SkillId { get; set; }
        public string Competence { get; set; } = string.Empty;
        public string? QualityId { get; set; }
        public string Qualite { get; set; } = string.Empty;
        public string? LanguageId { get; set; }
        public string Langue { get; set; } = string.Empty;
        public string Niveau { get; set; } = string.Empty;
    }

    // DTO pour la récupération des données groupées
    public class ProfileItemsResponseDto
    {
        public IEnumerable<Education> Educations { get; set; } = new List<Education>();
        public IEnumerable<Experience> Experiences { get; set; } = new List<Experience>();
        public IEnumerable<Skill> Skills { get; set; } = new List<Skill>();
        public IEnumerable<PersonalQuality> PersonalQualities { get; set; } = new List<PersonalQuality>();
        public IEnumerable<Language> Languages { get; set; } = new List<Language>();
        public IEnumerable<UserSimpleResponseDto> Users_Simple { get; set; } = new List<UserSimpleResponseDto>();
    }
}
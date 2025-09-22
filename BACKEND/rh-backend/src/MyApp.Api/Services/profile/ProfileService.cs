using MyApp.Api.Data;
using MyApp.Api.Entities;
using MyApp.Api.Services.logs;
using MyApp.Api.Utils.generator;
using MyApp.Api.Models.dto.profile;
using MyApp.Api.Repositories.profile;

using MyApp.Api.Entities.users_simple;
namespace MyApp.Api.Services.profile
{
    public interface IProfileService
    {
        Task<string> CreateProfileItemAsync(ProfileItemDto profileItemDto);
        Task UpdateProfileItemAsync(ProfileItemDto profileItemDto);
        Task DeleteProfileItemAsync(string id, ProfileEntityType entityType);
        Task<ProfileItemsResponseDto> GetAllProfileItemsAsync(string utilisateurId);
        Task<Education?> GetEducationByIdAsync(string educationId);
        Task<Experience?> GetExperienceByIdAsync(string experienceId);
        Task<Skill?> GetSkillByIdAsync(string skillId);
        Task<PersonalQuality?> GetPersonalQualityByIdAsync(string qualityId);
        Task<Language?> GetLanguageByIdAsync(string languageId);
    }

    public class ProfileService : IProfileService
    {
        private readonly IProfileRepository _repository;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly ILogger<ProfileService> _logger;
        private readonly ILogService _logService;

        public ProfileService(
            IProfileRepository repository,
            ISequenceGenerator sequenceGenerator,
            ILogger<ProfileService> logger,
            ILogService logService)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _sequenceGenerator = sequenceGenerator ?? throw new ArgumentNullException(nameof(sequenceGenerator));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _logService = logService ?? throw new ArgumentNullException(nameof(logService));
        }

        public async Task<string> CreateProfileItemAsync(ProfileItemDto profileItemDto)
        {
            try
            {
                if (profileItemDto == null)
                    throw new ArgumentNullException(nameof(profileItemDto), "Les données du profil ne peuvent pas être nulles");

                await using var transaction = await _repository.BeginTransactionAsync();
                try
                {
                    string id;
                    object entity;

                    switch (profileItemDto.EntityType)
                    {
                        case ProfileEntityType.Education:
                            if (string.IsNullOrWhiteSpace(profileItemDto.Etablissement) ||
                                string.IsNullOrWhiteSpace(profileItemDto.Diplome) ||
                                string.IsNullOrWhiteSpace(profileItemDto.Annee))
                                throw new ArgumentException("Les champs Etablissement, Diplome et Annee sont requis pour une formation");

                            id = _sequenceGenerator.GenerateSequence("seq_education_id", "EDU", 6, "-");
                            var education = new Education
                            {
                                EducationId = id,
                                UtilisateurId = profileItemDto.UtilisateurId,
                                Etablissement = profileItemDto.Etablissement,
                                Diplome = profileItemDto.Diplome,
                                Annee = profileItemDto.Annee
                            };
                            await _repository.AddEducationAsync(education);
                            entity = education;
                            break;

                        case ProfileEntityType.Experience:
                            if (string.IsNullOrWhiteSpace(profileItemDto.Entreprise) ||
                                string.IsNullOrWhiteSpace(profileItemDto.Poste) ||
                                string.IsNullOrWhiteSpace(profileItemDto.Duree))
                                throw new ArgumentException("Les champs Entreprise, Poste et Duree sont requis pour une expérience");

                            id = _sequenceGenerator.GenerateSequence("seq_experience_id", "EXP", 6, "-");
                            var experience = new Experience
                            {
                                ExperienceId = id,
                                UtilisateurId = profileItemDto.UtilisateurId,
                                Entreprise = profileItemDto.Entreprise,
                                Poste = profileItemDto.Poste,
                                Duree = profileItemDto.Duree,
                                Description = profileItemDto.Description
                            };
                            await _repository.AddExperienceAsync(experience);
                            entity = experience;
                            break;

                        case ProfileEntityType.Skill:
                            if (string.IsNullOrWhiteSpace(profileItemDto.Competence))
                                throw new ArgumentException("Le champ Competence est requis pour une compétence");

                            id = _sequenceGenerator.GenerateSequence("seq_skill_id", "SKL", 6, "-");
                            var skill = new Skill
                            {
                                SkillId = id,
                                UtilisateurId = profileItemDto.UtilisateurId,
                                Competence = profileItemDto.Competence
                            };
                            await _repository.AddSkillAsync(skill);
                            entity = skill;
                            break;

                        case ProfileEntityType.PersonalQuality:
                            if (string.IsNullOrWhiteSpace(profileItemDto.Qualite))
                                throw new ArgumentException("Le champ Qualite est requis pour une qualité personnelle");

                            id = _sequenceGenerator.GenerateSequence("seq_quality_id", "QLT", 6, "-");
                            var quality = new PersonalQuality
                            {
                                QualityId = id,
                                UtilisateurId = profileItemDto.UtilisateurId,
                                Qualite = profileItemDto.Qualite
                            };
                            await _repository.AddPersonalQualityAsync(quality);
                            entity = quality;
                            break;

                        case ProfileEntityType.Language:
                            if (string.IsNullOrWhiteSpace(profileItemDto.Langue) ||
                                string.IsNullOrWhiteSpace(profileItemDto.Niveau))
                                throw new ArgumentException("Les champs Langue et Niveau sont requis pour une langue");

                            id = _sequenceGenerator.GenerateSequence("seq_language_id", "LNG", 6, "-");
                            var language = new Language
                            {
                                LanguageId = id,
                                UtilisateurId = profileItemDto.UtilisateurId,
                                Langue = profileItemDto.Langue,
                                Niveau = profileItemDto.Niveau
                            };
                            await _repository.AddLanguageAsync(language);
                            entity = language;
                            break;

                        default:
                            throw new ArgumentException("Type d'entité non valide");
                    }

                    await _repository.SaveChangesAsync();
                    await transaction.CommitAsync();
                    return id;
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la création de l'élément de profil de type {EntityType}", profileItemDto.EntityType);
                throw;
            }
        }

        public async Task UpdateProfileItemAsync(ProfileItemDto profileItemDto)
        {
            try
            {
                if (profileItemDto == null)
                    throw new ArgumentNullException(nameof(profileItemDto), "Les données du profil ne peuvent pas être nulles");

                await using var transaction = await _repository.BeginTransactionAsync();
                try
                {
                    switch (profileItemDto.EntityType)
                    {
                        case ProfileEntityType.Education:
                            if (string.IsNullOrWhiteSpace(profileItemDto.EducationId))
                                throw new ArgumentException("L'ID de la formation est requis pour la mise à jour");
                            var education = await _repository.GetEducationByIdAsync(profileItemDto.EducationId);
                            if (education == null)
                                throw new ArgumentException("Formation non trouvée");
                            education.Etablissement = profileItemDto.Etablissement;
                            education.Diplome = profileItemDto.Diplome;
                            education.Annee = profileItemDto.Annee;
                            await _repository.UpdateEducationAsync(education);
                            break;

                        case ProfileEntityType.Experience:
                            if (string.IsNullOrWhiteSpace(profileItemDto.ExperienceId))
                                throw new ArgumentException("L'ID de l'expérience est requis pour la mise à jour");
                            var experience = await _repository.GetExperienceByIdAsync(profileItemDto.ExperienceId);
                            if (experience == null)
                                throw new ArgumentException("Expérience non trouvée");
                            experience.Entreprise = profileItemDto.Entreprise;
                            experience.Poste = profileItemDto.Poste;
                            experience.Duree = profileItemDto.Duree;
                            experience.Description = profileItemDto.Description;
                            await _repository.UpdateExperienceAsync(experience);
                            break;

                        case ProfileEntityType.Skill:
                            if (string.IsNullOrWhiteSpace(profileItemDto.SkillId))
                                throw new ArgumentException("L'ID de la compétence est requis pour la mise à jour");
                            var skill = await _repository.GetSkillByIdAsync(profileItemDto.SkillId);
                            if (skill == null)
                                throw new ArgumentException("Compétence non trouvée");
                            skill.Competence = profileItemDto.Competence;
                            await _repository.UpdateSkillAsync(skill);
                            break;

                        case ProfileEntityType.PersonalQuality:
                            if (string.IsNullOrWhiteSpace(profileItemDto.QualityId))
                                throw new ArgumentException("L'ID de la qualité est requis pour la mise à jour");
                            var quality = await _repository.GetPersonalQualityByIdAsync(profileItemDto.QualityId);
                            if (quality == null)
                                throw new ArgumentException("Qualité non trouvée");
                            quality.Qualite = profileItemDto.Qualite;
                            await _repository.UpdatePersonalQualityAsync(quality);
                            break;

                        case ProfileEntityType.Language:
                            if (string.IsNullOrWhiteSpace(profileItemDto.LanguageId))
                                throw new ArgumentException("L'ID de la langue est requis pour la mise à jour");
                            var language = await _repository.GetLanguageByIdAsync(profileItemDto.LanguageId);
                            if (language == null)
                                throw new ArgumentException("Langue non trouvée");
                            language.Langue = profileItemDto.Langue;
                            language.Niveau = profileItemDto.Niveau;
                            await _repository.UpdateLanguageAsync(language);
                            break;

                        default:
                            throw new ArgumentException("Type d'entité non valide");
                    }

                    await _repository.SaveChangesAsync();
                    await transaction.CommitAsync();
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour de l'élément de profil de type {EntityType}", profileItemDto.EntityType);
                throw;
            }
        }

        public async Task DeleteProfileItemAsync(string id, ProfileEntityType entityType)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                    throw new ArgumentException("L'ID est requis pour la suppression");

                await using var transaction = await _repository.BeginTransactionAsync();
                try
                {
                    switch (entityType)
                    {
                        case ProfileEntityType.Education:
                            await _repository.DeleteEducationAsync(id);
                            break;
                        case ProfileEntityType.Experience:
                            await _repository.DeleteExperienceAsync(id);
                            break;
                        case ProfileEntityType.Skill:
                            await _repository.DeleteSkillAsync(id);
                            break;
                        case ProfileEntityType.PersonalQuality:
                            await _repository.DeletePersonalQualityAsync(id);
                            break;
                        case ProfileEntityType.Language:
                            await _repository.DeleteLanguageAsync(id);
                            break;
                        default:
                            throw new ArgumentException("Type d'entité non valide");
                    }

                    await _repository.SaveChangesAsync();
                    await transaction.CommitAsync();
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression de l'élément de profil de type {EntityType} avec l'ID {Id}", entityType, id);
                throw;
            }
        }

        public async Task<ProfileItemsResponseDto> GetAllProfileItemsAsync(string utilisateurId)
        {
            try
            {
                _logger.LogInformation("Récupération de toutes les informations de profil pour l'utilisateur {UtilisateurId}", utilisateurId);

                var educations = await _repository.GetAllEducationsAsync(utilisateurId);
                var experiences = await _repository.GetAllExperiencesAsync(utilisateurId);
                var skills = await _repository.GetAllSkillsAsync(utilisateurId);
                var personalQualities = await _repository.GetAllPersonalQualitiesAsync(utilisateurId);
                var languages = await _repository.GetAllLanguagesAsync(utilisateurId);
                var users_simple = await _repository.GetAllUsers_SimpleAsync(utilisateurId);

                return new ProfileItemsResponseDto
                {
                    Users_Simple = users_simple,
                    Educations = educations,
                    Experiences = experiences,
                    Skills = skills,
                    PersonalQualities = personalQualities,
                    Languages = languages
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des informations de profil pour l'utilisateur {UtilisateurId}", utilisateurId);
                throw;
            }
        }

        public async Task<Education?> GetEducationByIdAsync(string educationId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(educationId))
                {
                    _logger.LogWarning("Tentative de récupération d'une formation avec un ID null ou vide");
                    return null;
                }

                _logger.LogInformation("Récupération de la formation avec l'ID: {EducationId}", educationId);
                return await _repository.GetEducationByIdAsync(educationId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de la formation {EducationId}", educationId);
                throw;
            }
        }

        public async Task<Experience?> GetExperienceByIdAsync(string experienceId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(experienceId))
                {
                    _logger.LogWarning("Tentative de récupération d'une expérience avec un ID null ou vide");
                    return null;
                }

                _logger.LogInformation("Récupération de l'expérience avec l'ID: {ExperienceId}", experienceId);
                return await _repository.GetExperienceByIdAsync(experienceId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de l'expérience {ExperienceId}", experienceId);
                throw;
            }
        }

        public async Task<Skill?> GetSkillByIdAsync(string skillId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(skillId))
                {
                    _logger.LogWarning("Tentative de récupération d'une compétence avec un ID null ou vide");
                    return null;
                }

                _logger.LogInformation("Récupération de la compétence avec l'ID: {SkillId}", skillId);
                return await _repository.GetSkillByIdAsync(skillId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de la compétence {SkillId}", skillId);
                throw;
            }
        }

        public async Task<PersonalQuality?> GetPersonalQualityByIdAsync(string qualityId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(qualityId))
                {
                    _logger.LogWarning("Tentative de récupération d'une qualité personnelle avec un ID null ou vide");
                    return null;
                }

                _logger.LogInformation("Récupération de la qualité personnelle avec l'ID: {QualityId}", qualityId);
                return await _repository.GetPersonalQualityByIdAsync(qualityId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de la qualité personnelle {QualityId}", qualityId);
                throw;
            }
        }

        public async Task<Language?> GetLanguageByIdAsync(string languageId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(languageId))
                {
                    _logger.LogWarning("Tentative de récupération d'une langue avec un ID null ou vide");
                    return null;
                }

                _logger.LogInformation("Récupération de la langue avec l'ID: {LanguageId}", languageId);
                return await _repository.GetLanguageByIdAsync(languageId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de la langue {LanguageId}", languageId);
                throw;
            }
        }
    }
}
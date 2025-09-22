using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Services.profile;
using MyApp.Api.Models.dto.profile;

namespace MyApp.Api.Controllers.profile
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProfileController : ControllerBase
    {
        private readonly IProfileService _profileService;
        private readonly ILogger<ProfileController> _logger;

        public ProfileController(IProfileService profileService, ILogger<ProfileController> logger)
        {
            _profileService = profileService ?? throw new ArgumentNullException(nameof(profileService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        [HttpPost]
        public async Task<IActionResult> CreateProfileItem([FromBody] ProfileItemDto profileItemDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Données invalides pour la création d'un élément de profil");
                    return BadRequest(ModelState);
                }

                var id = await _profileService.CreateProfileItemAsync(profileItemDto);
                return CreatedAtAction(nameof(GetProfileItemById), new { id, entityType = profileItemDto.EntityType }, new { Id = id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la création de l'élément de profil de type {EntityType}", profileItemDto.EntityType);
                return StatusCode(500, "Une erreur est survenue lors de la création de l'élément de profil");
            }
        }

        [HttpPut("item/{id}/{entityType}")]
        public async Task<IActionResult> UpdateProfileItem(string id, ProfileEntityType entityType, [FromBody] ProfileItemDto profileItemDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Données invalides pour la mise à jour d'un élément de profil");
                    return BadRequest(ModelState);
                }

                if (id != profileItemDto.EducationId && id != profileItemDto.ExperienceId && id != profileItemDto.SkillId && id != profileItemDto.QualityId && id != profileItemDto.LanguageId)
                {
                    return BadRequest("L'ID fourni ne correspond pas à l'élément à mettre à jour");
                }

                profileItemDto.EntityType = entityType;
                await _profileService.UpdateProfileItemAsync(profileItemDto);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour de l'élément de profil de type {EntityType} avec l'ID {Id}", entityType, id);
                return StatusCode(500, "Une erreur est survenue lors de la mise à jour de l'élément de profil");
            }
        }

        [HttpDelete("item/{id}/{entityType}")]
        public async Task<IActionResult> DeleteProfileItem(string id, ProfileEntityType entityType)
        {
            try
            {
                await _profileService.DeleteProfileItemAsync(id, entityType);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression de l'élément de profil de type {EntityType} avec l'ID {Id}", entityType, id);
                return StatusCode(500, "Une erreur est survenue lors de la suppression de l'élément de profil");
            }
        }

        [HttpGet("{utilisateurId}")]
        public async Task<IActionResult> GetAllProfileItems(string utilisateurId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(utilisateurId))
                {
                    _logger.LogWarning("Tentative de récupération des informations de profil avec un utilisateurId null ou vide");
                    return BadRequest("L'ID de l'utilisateur est requis");
                }

                var profileItems = await _profileService.GetAllProfileItemsAsync(utilisateurId);
                return Ok(profileItems);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des informations de profil pour l'utilisateur {UtilisateurId}", utilisateurId);
                return StatusCode(500, "Une erreur est survenue lors de la récupération des informations de profil");
            }
        }

        [HttpGet("item/{id}/{entityType}")]
        public async Task<IActionResult> GetProfileItemById(string id, ProfileEntityType entityType)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    _logger.LogWarning("Tentative de récupération d'un élément de profil avec un ID null ou vide");
                    return BadRequest("L'ID de l'élément est requis");
                }

                object? result = entityType switch
                {
                    ProfileEntityType.Education => await _profileService.GetEducationByIdAsync(id),
                    ProfileEntityType.Experience => await _profileService.GetExperienceByIdAsync(id),
                    ProfileEntityType.Skill => await _profileService.GetSkillByIdAsync(id),
                    ProfileEntityType.PersonalQuality => await _profileService.GetPersonalQualityByIdAsync(id),
                    ProfileEntityType.Language => await _profileService.GetLanguageByIdAsync(id),
                    _ => throw new ArgumentException("Type d'entité non valide")
                };

                if (result == null)
                {
                    _logger.LogWarning("Élément de profil de type {EntityType} avec l'ID {Id} non trouvé", entityType, id);
                    return NotFound();
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de l'élément de profil de type {EntityType} avec l'ID {Id}", entityType, id);
                return StatusCode(500, "Une erreur est survenue lors de la récupération de l'élément de profil");
            }
        }
    }
}
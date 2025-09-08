using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.employee;
using MyApp.Api.Services.employee;

namespace MyApp.Api.Controllers.employee
{
    [Route("api/[controller]")]
    [ApiController]
    public class GenderController(
        IGenderService genderService,
        ILogger<GenderController> logger)
        : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Gender>>> GetAll()
        {
            try
            {
                logger.LogInformation("Récupération de tous les genres");
                var genders = await genderService.GetAllAsync();
                return Ok(genders);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération des genres");
                return StatusCode(500, "Une erreur est survenue lors de la récupération des genres.");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Gender>> GetById(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    logger.LogWarning("Tentative de récupération d'un genre avec un ID null ou vide");
                    return BadRequest("L'ID du genre ne peut pas être null ou vide.");
                }

                logger.LogInformation("Récupération du genre avec l'ID: {GenderId}", id);
                var gender = await genderService.GetByIdAsync(id);
                if (gender == null)
                {
                    logger.LogWarning("Genre non trouvé pour l'ID: {GenderId}", id);
                    return NotFound();
                }

                return Ok(gender);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération du genre avec l'ID: {GenderId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la récupération du genre.");
            }
        }

        [HttpPost]
        public async Task<ActionResult<Gender>> Create([FromBody] Gender gender)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    logger.LogWarning("Données invalides lors de la création d'un genre: {ModelStateErrors}", ModelState);
                    return BadRequest(ModelState);
                }

                logger.LogInformation("Création d'un nouveau genre");
                await genderService.AddAsync(gender);

                // Récupérer le genre créé
                var createdGender = await genderService.GetByIdAsync(gender.GenderId);
                if (createdGender == null)
                {
                    logger.LogWarning("Genre non trouvé après création");
                    return StatusCode(500, "Le genre n'a pas été trouvé après création.");
                }

                logger.LogInformation("Genre créé avec succès avec l'ID: {GenderId}", createdGender.GenderId);
                return Ok(createdGender);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la création du genre");
                return StatusCode(500, "Une erreur est survenue lors de la création du genre.");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] Gender gender)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    logger.LogWarning("Données invalides lors de la mise à jour d'un genre: {ModelStateErrors}", ModelState);
                    return BadRequest(ModelState);
                }

                if (string.IsNullOrWhiteSpace(id))
                {
                    logger.LogWarning("Tentative de mise à jour d'un genre avec un ID null ou vide");
                    return BadRequest("L'ID du genre ne peut pas être null ou vide.");
                }

                logger.LogInformation("Vérification de l'existence du genre avec l'ID: {GenderId}", id);
                var existingGender = await genderService.GetByIdAsync(id);
                if (existingGender == null)
                {
                    logger.LogWarning("Genre non trouvé pour l'ID: {GenderId}", id);
                    return NotFound();
                }

                logger.LogInformation("Mise à jour du genre avec l'ID: {GenderId}", id);
                await genderService.UpdateAsync(id, gender);

                logger.LogInformation("Genre mis à jour avec succès pour l'ID: {GenderId}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la mise à jour du genre avec l'ID: {GenderId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la mise à jour du genre.");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    logger.LogWarning("Tentative de suppression d'un genre avec un ID null ou vide");
                    return BadRequest("L'ID du genre ne peut pas être null ou vide.");
                }

                logger.LogInformation("Vérification de l'existence du genre avec l'ID: {GenderId}", id);
                var gender = await genderService.GetByIdAsync(id);
                if (gender == null)
                {
                    logger.LogWarning("Genre non trouvé pour l'ID: {GenderId}", id);
                    return NotFound();
                }

                logger.LogInformation("Suppression du genre avec l'ID: {GenderId}", id);
                await genderService.DeleteAsync(id);

                logger.LogInformation("Genre supprimé avec succès pour l'ID: {GenderId}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la suppression du genre avec l'ID: {GenderId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la suppression du genre.");
            }
        }
    }
}
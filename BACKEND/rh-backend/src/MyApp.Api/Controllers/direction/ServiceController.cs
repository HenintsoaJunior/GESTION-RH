using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using MyApp.Api.Entities.direction;
using MyApp.Api.Models.form.direction;
using MyApp.Api.Services.direction;
using System;
using System.Threading.Tasks;

namespace MyApp.Api.Controllers.direction
{
    [Route("api/[controller]")]
    [ApiController]
    public class ServiceController(
        IServiceService serviceService,
        ILogger<ServiceController> logger)
        : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Service>>> GetAll()
        {
            try
            {
                logger.LogInformation("Récupération de tous les services");
                var services = await serviceService.GetAllAsync();
                return Ok(services);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération de tous les services");
                return StatusCode(500, "Une erreur est survenue lors de la récupération des services.");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Service>> GetById(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    logger.LogWarning("Tentative de récupération d'un service avec un ID null ou vide");
                    return BadRequest("L'ID du service ne peut pas être null ou vide.");
                }

                logger.LogInformation("Récupération du service avec l'ID: {ServiceId}", id);
                var service = await serviceService.GetByIdAsync(id);
                if (service == null)
                {
                    logger.LogWarning("Service non trouvé pour l'ID: {ServiceId}", id);
                    return NotFound();
                }

                return Ok(service);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération du service avec l'ID: {ServiceId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la récupération du service.");
            }
        }

        [HttpPost]
        public async Task<ActionResult<Service>> Add([FromBody] ServiceDTOForm form)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    logger.LogWarning("Données invalides lors de l'ajout d'un service: {ModelStateErrors}", ModelState);
                    return BadRequest(ModelState);
                }

                var service = new Service
                {
                    ServiceName = form.ServiceName,
                    DepartmentId = form.DepartmentId
                };

                logger.LogInformation("Ajout d'un nouveau service: {ServiceName}", service.ServiceName);
                await serviceService.AddAsync(service);

                logger.LogInformation("Service créé avec succès avec l'ID: {ServiceId}", service.ServiceId);
                return CreatedAtAction(nameof(GetById), new { id = service.ServiceId }, service);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de l'ajout du service: {ServiceName}", form?.ServiceName);
                return StatusCode(500, "Une erreur est survenue lors de l'ajout du service.");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, Service service)
        {
            try
            {
                if (id != service.ServiceId)
                {
                    logger.LogWarning("L'ID dans l'URL ({Id}) ne correspond pas à l'ID du service ({ServiceId})", id, service.ServiceId);
                    return BadRequest("L'ID dans l'URL ne correspond pas à l'ID du service.");
                }

                if (string.IsNullOrWhiteSpace(id))
                {
                    logger.LogWarning("Tentative de mise à jour d'un service avec un ID null ou vide");
                    return BadRequest("L'ID du service ne peut pas être null ou vide.");
                }

                logger.LogInformation("Vérification de l'existence du service avec l'ID: {ServiceId}", id);
                var existingService = await serviceService.GetByIdAsync(id);
                if (existingService == null)
                {
                    logger.LogWarning("Service non trouvé pour l'ID: {ServiceId}", id);
                    return NotFound();
                }

                logger.LogInformation("Mise à jour du service avec l'ID: {ServiceId}", id);
                await serviceService.UpdateAsync(service);

                logger.LogInformation("Service mis à jour avec succès pour l'ID: {ServiceId}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la mise à jour du service avec l'ID: {ServiceId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la mise à jour du service.");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    logger.LogWarning("Tentative de suppression d'un service avec un ID null ou vide");
                    return BadRequest("L'ID du service ne peut pas être null ou vide.");
                }

                logger.LogInformation("Vérification de l'existence du service avec l'ID: {ServiceId}", id);
                var service = await serviceService.GetByIdAsync(id);
                if (service == null)
                {
                    logger.LogWarning("Service non trouvé pour l'ID: {ServiceId}", id);
                    return NotFound();
                }

                logger.LogInformation("Suppression du service avec l'ID: {ServiceId}", id);
                await serviceService.DeleteAsync(id);

                logger.LogInformation("Service supprimé avec succès pour l'ID: {ServiceId}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la suppression du service avec l'ID: {ServiceId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la suppression du service.");
            }
        }
    }
}
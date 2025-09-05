using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.mission;
using MyApp.Api.Models.dto.mission;
using MyApp.Api.Services.mission;

namespace MyApp.Api.Controllers.mission
{
    [ApiController]
    [Route("api/[controller]")]
    public class MissionBudgetController : ControllerBase
    {
        private readonly IMissionBudgetService _missionBudgetService;
        private readonly ILogger<MissionBudgetController> _logger;

        public MissionBudgetController(IMissionBudgetService missionBudgetService, ILogger<MissionBudgetController> logger)
        {
            _missionBudgetService = missionBudgetService;
            _logger = logger;
        }

        // GET: api/missionbudget
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var budgets = await _missionBudgetService.GetAllAsync();
                return Ok(budgets);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des budgets mission");
                return StatusCode(500, "Erreur serveur");
            }
        }

        // GET: api/missionbudget/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            try
            {
                var budget = await _missionBudgetService.GetByIdAsync(id);
                if (budget == null) return NotFound($"MissionBudget avec ID {id} introuvable");
                return Ok(budget);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du budget mission par ID {MissionBudgetId}", id);
                return StatusCode(500, "Erreur serveur");
            }
        }

        // GET: api/missionbudget/direction/{directionName}
        [HttpGet("direction/{directionName}")]
        public async Task<IActionResult> GetByDirectionName(string directionName)
        {
            try
            {
                var budget = await _missionBudgetService.GetByDirectionNameAsync(directionName);
                if (budget == null) return NotFound($"Aucun budget trouvé pour la direction {directionName}");
                return Ok(budget);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du budget mission par direction {DirectionName}", directionName);
                return StatusCode(500, "Erreur serveur");
            }
        }

        // POST: api/missionbudget
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] MissionBudgetDTOForm dto)
        {
            try
            {
                await _missionBudgetService.AddAsync(dto);
                return Ok("MissionBudget ajouté avec succès");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la création du budget mission");
                return StatusCode(500, "Erreur serveur");
            }
        }

        // PUT: api/missionbudget/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] MissionBudgetDTOForm dto)
        {
            try
            {
                await _missionBudgetService.UpdateAsync(id, dto);
                return Ok("MissionBudget mis à jour avec succès");
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour du budget mission avec ID {MissionBudgetId}", id);
                return StatusCode(500, "Erreur serveur");
            }
        }

        // DELETE: api/missionbudget/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id, [FromQuery] string userId)
        {
            try
            {
                await _missionBudgetService.DeleteAsync(id, userId);
                return Ok("MissionBudget supprimé avec succès");
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression du budget mission avec ID {MissionBudgetId}", id);
                return StatusCode(500, "Erreur serveur");
            }
        }
    }
}

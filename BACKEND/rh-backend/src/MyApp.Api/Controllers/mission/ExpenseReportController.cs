using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.mission;
using MyApp.Api.Models.dto.mission;
using MyApp.Api.Services.mission;

namespace MyApp.Api.Controllers.mission
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExpenseReportController : ControllerBase
    {
        private readonly IExpenseReportService _service;
        private readonly ILogger<ExpenseReportController> _logger;

        public ExpenseReportController(IExpenseReportService service, ILogger<ExpenseReportController> logger)
        {
            _service = service ?? throw new ArgumentNullException(nameof(service));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        [HttpGet("status/{assignationId}")]
        public async Task<ActionResult<IEnumerable<string>>> GetStatusByAssignationId(string assignationId)
        {
            try
            {
                var statuses = await _service.GetStatusByAssignationIdAsync(assignationId);
                return Ok(statuses);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des statuts pour AssignationId: {AssignationId}", assignationId);
                return StatusCode(500, new { message = "Erreur interne du serveur." });
            }
        }
        [HttpPost("reimburse/{assignationId}")]
        public async Task<ActionResult> ReimburseByAssignationId(string assignationId, [FromQuery] string userId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(userId))
                {
                    return BadRequest(new { message = "L'ID utilisateur est requis pour le remboursement." });
                }

                var success = await _service.ReimburseByAssignationIdAsync(assignationId, userId);
                if (!success)
                {
                    return NotFound(new { message = $"Aucun rapport de frais trouvé pour assignationId: {assignationId}." });
                }

                return Ok(new { message = "Remboursement effectué avec succès.", assignationId });
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning("Paramètres invalides pour ReimburseByAssignationId: {AssignationId} - {Message}", assignationId, ex.Message);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors du remboursement pour assignationId: {AssignationId}", assignationId);
                return StatusCode(500, new { message = "Erreur interne du serveur." });
            }
        }

        [HttpGet("distinct-mission-assignations")]
        public async Task<ActionResult<object>> GetDistinctMissionAssignations([FromQuery] MissionAssignationQueryDTO query)
        {
            try
            {
                var (items, totalCount) = await _service.GetDistinctMissionAssignationsAsync(query.Status, query.Page, query.PageSize);
                return Ok(new { items, totalCount, pageNumber = query.Page, pageSize = query.PageSize });
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning("Paramètres invalides pour GetDistinctMissionAssignations: {Message}", ex.Message);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des assignations de mission distinctes");
                return StatusCode(500, new { message = "Erreur interne du serveur." });
            }
        }

        [HttpGet("total-reimbursed")]
        public async Task<ActionResult<object>> GetTotalReimbursedAmount()
        {
            try
            {
                var totalReimbursed = await _service.GetTotalReimbursedAmountAsync();
                return Ok(new { totalReimbursedAmount = totalReimbursed });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du total des montants remboursés");
                return StatusCode(500, new { message = "Erreur interne du serveur." });
            }
        }

        [HttpGet("total-notreimbursed")]
        public async Task<ActionResult<object>> GetTotalNotReimbursedAmount()
        {
            try
            {
                var totalNotReimbursed = await _service.GetTotalNotReimbursedAmountAsync();
                return Ok(new { totalNotReimbursedAmount = totalNotReimbursed });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du total des montants non remboursés");
                return StatusCode(500, new { message = "Erreur interne du serveur." });
            }
        }

        [HttpGet("count-reimbursed")]
        public async Task<ActionResult<object>> GetTotalReimbursedCount()
        {
            try
            {
                var totalReimbursedCount = await _service.GetTotalReimbursedCountAsync();
                return Ok(new { totalReimbursedCount });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du nombre total de rapports remboursés");
                return StatusCode(500, new { message = "Erreur interne du serveur." });
            }
        }

        [HttpGet("count-notreimbursed")]
        public async Task<ActionResult<object>> GetTotalNotReimbursedCount()
        {
            try
            {
                var totalNotReimbursedCount = await _service.GetTotalNotReimbursedCountAsync();
                return Ok(new { totalNotReimbursedCount });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du nombre total de rapports non remboursés");
                return StatusCode(500, new { message = "Erreur interne du serveur." });
            }
        }

        [HttpGet("total-amount/{assignationId}")]
        public async Task<ActionResult<object>> GetTotalAmountByAssignationId(string assignationId)
        {
            try
            {
                var totalAmount = await _service.GetTotalAmountByAssignationIdAsync(assignationId);
                return Ok(new { totalAmount });
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning("AssignationId invalide: {AssignationId}, Message: {Message}", assignationId, ex.Message);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du montant total pour AssignationId: {AssignationId}", assignationId);
                return StatusCode(500, new { message = "Erreur interne du serveur." });
            }
        }

        // GET: api/ExpenseReport
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ExpenseReport>>> GetAll()
        {
            var reports = await _service.GetAllAsync();
            return Ok(reports);
        }

        // GET: api/ExpenseReport/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ExpenseReport>> GetById(string id)
        {
            try
            {
                var report = await _service.GetByIdAsync(id);
                return Ok(report);
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("n'existe pas"))
            {
                _logger.LogWarning("Rapport de frais avec l'ID {ExpenseReportId} n'existe pas", id);
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de GetById pour ExpenseReportId: {ExpenseReportId}", id);
                return StatusCode(500, new { message = "Erreur interne du serveur." });
            }
        }

        // GET: api/ExpenseReport/assignation/{assignationId}
        [HttpGet("assignation/{assignationId}")]
        public async Task<ActionResult<object>> GetByAssignationId(string assignationId)
        {
            try
            {
                var (reports, totalAmount, attachments) = await _service.GetByAssignationIdAsync(assignationId);
                return Ok(new { reports, totalAmount, attachments });
            }
            catch (ArgumentException ex) when (ex.ParamName == nameof(assignationId))
            {
                _logger.LogWarning("AssignationId invalide: {AssignationId}", assignationId);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de GetByAssignationId pour AssignationId: {AssignationId}", assignationId);
                return StatusCode(500, new { message = "Erreur interne du serveur." });
            }
        }

        [HttpPost]
        public async Task<ActionResult<List<string>>> Create([FromBody] ExpenseReportDTOForm dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.ToDictionary(kvp => kvp.Key, kvp => kvp.Value!.Errors.Select(e => e.ErrorMessage).ToArray());
                    return BadRequest(new { fieldErrors = errors });
                }

                var affectedIds = await _service.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = affectedIds.FirstOrDefault() }, new { affectedIds });
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning("Données invalides pour Create ExpenseReport: {Message}", ex.Message);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de Create ExpenseReport");
                return StatusCode(500, new { message = "Erreur interne du serveur." });
            }
        }

        // PUT: api/ExpenseReport/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult> Update(string id, [FromBody] ExpenseLineDTO dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.ToDictionary(kvp => kvp.Key, kvp => kvp.Value!.Errors.Select(e => e.ErrorMessage).ToArray());
                    return BadRequest(new { fieldErrors = errors });
                }

                var success = await _service.UpdateAsync(id, dto);
                if (!success)
                {
                    return NotFound(new { message = $"Rapport de frais avec l'ID {id} introuvable." });
                }
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning("Données invalides pour Update ExpenseReportId: {ExpenseReportId} - {Message}", id, ex.Message);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de Update pour ExpenseReportId: {ExpenseReportId}", id);
                return StatusCode(500, new { message = "Erreur interne du serveur." });
            }
        }

        // DELETE: api/ExpenseReport/{id}?userId=USER123
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id, [FromQuery] string userId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(userId))
                {
                    return BadRequest(new { message = "L'ID utilisateur est requis pour la suppression." });
                }

                var success = await _service.DeleteAsync(id, userId);
                if (!success)
                {
                    return NotFound(new { message = $"Rapport de frais avec l'ID {id} introuvable." });
                }
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning("Paramètres invalides pour Delete ExpenseReportId: {ExpenseReportId} - {Message}", id, ex.Message);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de Delete pour ExpenseReportId: {ExpenseReportId}", id);
                return StatusCode(500, new { message = "Erreur interne du serveur." });
            }
        }
    }
}
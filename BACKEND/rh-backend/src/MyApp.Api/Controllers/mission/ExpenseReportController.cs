using Microsoft.AspNetCore.Authorization;
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

        [HttpPost]
        [AllowAnonymous]
        public async Task<ActionResult> Create([FromBody] ExpenseReportDTOForm dto)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (dto == null)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "ExpenseReport data cannot be null" });
            }

            if (!ModelState.IsValid)
            {
                var errors = ModelState.ToDictionary(kvp => kvp.Key, kvp => kvp.Value!.Errors.Select(e => e.ErrorMessage).ToArray());
                return BadRequest(new { data = new { fieldErrors = errors }, status = 400, message = "validation error" });
            }

            try
            {
                var affectedIds = await _service.CreateAsync(dto);
                var responseData = new { affectedIds };
                return CreatedAtAction(nameof(GetById), new { id = affectedIds.FirstOrDefault() }, new { data = responseData, status = 201, message = "success" });
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning("Données invalides pour Create ExpenseReport: {Message}", ex.Message);
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Erreur lors de Create ExpenseReport");
                Console.WriteLine(e);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpGet("assignation/{assignationId}")]
        [AllowAnonymous]
        public async Task<ActionResult> GetByAssignationId(string assignationId)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            try
            {
                var (reports, totalAmount, attachments) = await _service.GetByAssignationIdAsync(assignationId);
                var responseData = new { reports, totalAmount, attachments };
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex) when (ex.ParamName == nameof(assignationId))
            {
                _logger.LogWarning("AssignationId invalide: {AssignationId}", assignationId);
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Erreur lors de GetByAssignationId pour AssignationId: {AssignationId}", assignationId);
                Console.WriteLine(e);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpGet("status/{assignationId}")]
        [AllowAnonymous]
        public async Task<ActionResult> GetStatusByAssignationId(string assignationId)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            try
            {
                var statuses = await _service.GetStatusByAssignationIdAsync(assignationId);
                var responseData = statuses;
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Erreur lors de la récupération des statuts pour AssignationId: {AssignationId}", assignationId);
                Console.WriteLine(e);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpPost("reimburse/{assignationId}")]
        [AllowAnonymous]
        public async Task<ActionResult> ReimburseByAssignationId(string assignationId, [FromQuery] string userId)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (string.IsNullOrWhiteSpace(userId))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "L'ID utilisateur est requis pour le remboursement." });
            }

            try
            {
                var success = await _service.ReimburseByAssignationIdAsync(assignationId, userId);
                if (!success)
                {
                    return NotFound(new { data = (object?)null, status = 404, message = $"Aucun rapport de frais trouvé pour assignationId: {assignationId}." });
                }

                var responseData = new { message = "Remboursement effectué avec succès.", assignationId };
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning("Paramètres invalides pour ReimburseByAssignationId: {AssignationId} - {Message}", assignationId, ex.Message);
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Erreur lors du remboursement pour assignationId: {AssignationId}", assignationId);
                Console.WriteLine(e);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpGet("distinct-mission-assignations")]
        // [AllowAnonymous]
        public async Task<ActionResult> GetDistinctMissionAssignations([FromQuery] MissionAssignationQueryDTO query, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            // if (!User.Identity?.IsAuthenticated ?? true)
            // {
            //     return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            // }

            try
            {
                var (items, totalCount) = await _service.GetDistinctMissionAssignationsAsync(query.Status, page, pageSize);
                var responseData = new { items, totalCount, pageNumber = page, pageSize = pageSize };
                return Ok(new { data = responseData, status = 200, message = "success" });
            }

            catch (ArgumentException ex)
            {
                _logger.LogWarning("Paramètres invalides pour GetDistinctMissionAssignations: {Message}", ex.Message);
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Erreur lors de la récupération des assignations de mission distinctes");
                Console.WriteLine(e);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpGet("total-reimbursed")]
        [AllowAnonymous]
        public async Task<ActionResult> GetTotalReimbursedAmount()
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            try
            {
                var totalReimbursed = await _service.GetTotalReimbursedAmountAsync();
                var responseData = new { totalReimbursedAmount = totalReimbursed };
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Erreur lors de la récupération du total des montants remboursés");
                Console.WriteLine(e);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpGet("total-notreimbursed")]
        [AllowAnonymous]
        public async Task<ActionResult> GetTotalNotReimbursedAmount()
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            try
            {
                var totalNotReimbursed = await _service.GetTotalNotReimbursedAmountAsync();
                var responseData = new { totalNotReimbursedAmount = totalNotReimbursed };
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Erreur lors de la récupération du total des montants non remboursés");
                Console.WriteLine(e);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpGet("count-reimbursed")]
        [AllowAnonymous]
        public async Task<ActionResult> GetTotalReimbursedCount()
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            try
            {
                var totalReimbursedCount = await _service.GetTotalReimbursedCountAsync();
                var responseData = new { totalReimbursedCount };
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Erreur lors de la récupération du nombre total de rapports remboursés");
                Console.WriteLine(e);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpGet("count-notreimbursed")]
        [AllowAnonymous]
        public async Task<ActionResult> GetTotalNotReimbursedCount()
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            try
            {
                var totalNotReimbursedCount = await _service.GetTotalNotReimbursedCountAsync();
                var responseData = new { totalNotReimbursedCount };
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Erreur lors de la récupération du nombre total de rapports non remboursés");
                Console.WriteLine(e);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpGet("total-amount/{assignationId}")]
        [AllowAnonymous]
        public async Task<ActionResult> GetTotalAmountByAssignationId(string assignationId)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            try
            {
                var totalAmount = await _service.GetTotalAmountByAssignationIdAsync(assignationId);
                var responseData = new { totalAmount };
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning("AssignationId invalide: {AssignationId}, Message: {Message}", assignationId, ex.Message);
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Erreur lors de la récupération du montant total pour AssignationId: {AssignationId}", assignationId);
                Console.WriteLine(e);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        // GET: api/ExpenseReport
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult> GetAll()
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            try
            {
                var reports = await _service.GetAllAsync();
                return Ok(new { data = reports, status = 200, message = "success" });
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        // GET: api/ExpenseReport/{id}
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult> GetById(string id)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            try
            {
                var report = await _service.GetByIdAsync(id);
                var responseData = report;
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("n'existe pas"))
            {
                _logger.LogWarning("Rapport de frais avec l'ID {ExpenseReportId} n'existe pas", id);
                return NotFound(new { data = (object?)null, status = 404, message = ex.Message });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Erreur lors de GetById pour ExpenseReportId: {ExpenseReportId}", id);
                Console.WriteLine(e);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        // PUT: api/ExpenseReport/{id}
        [HttpPut("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult> Update(string id, [FromBody] ExpenseLineDTO dto)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (dto == null)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "ExpenseLine data cannot be null" });
            }

            if (!ModelState.IsValid)
            {
                var errors = ModelState.ToDictionary(kvp => kvp.Key, kvp => kvp.Value!.Errors.Select(e => e.ErrorMessage).ToArray());
                return BadRequest(new { data = new { fieldErrors = errors }, status = 400, message = "validation error" });
            }

            try
            {
                var success = await _service.UpdateAsync(id, dto);
                if (!success)
                {
                    return NotFound(new { data = (object?)null, status = 404, message = $"Rapport de frais avec l'ID {id} introuvable." });
                }
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning("Données invalides pour Update ExpenseReportId: {ExpenseReportId} - {Message}", id, ex.Message);
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Erreur lors de Update pour ExpenseReportId: {ExpenseReportId}", id);
                Console.WriteLine(e);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        // DELETE: api/ExpenseReport/{id}?userId=USER123
        [HttpDelete("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult> Delete(string id, [FromQuery] string userId)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (string.IsNullOrWhiteSpace(userId))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "L'ID utilisateur est requis pour la suppression." });
            }

            try
            {
                var success = await _service.DeleteAsync(id, userId);
                if (!success)
                {
                    return NotFound(new { data = (object?)null, status = 404, message = $"Rapport de frais avec l'ID {id} introuvable." });
                }
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning("Paramètres invalides pour Delete ExpenseReportId: {ExpenseReportId} - {Message}", id, ex.Message);
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Erreur lors de Delete pour ExpenseReportId: {ExpenseReportId}", id);
                Console.WriteLine(e);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }
    }
}
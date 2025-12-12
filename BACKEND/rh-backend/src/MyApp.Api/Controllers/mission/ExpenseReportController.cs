using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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

        // POST: api/ExpenseReport
        [HttpPost]
        public async Task<ActionResult> Create([FromBody] ExpenseReportDTOForm dto)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });

            if (dto == null)
                return BadRequest(new { data = (object?)null, status = 400, message = "Les données du rapport de frais ne peuvent pas être nulles" });

            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .ToDictionary(kvp => kvp.Key, kvp => kvp.Value!.Errors.Select(e => e.ErrorMessage).ToArray());
                return BadRequest(new { data = new { fieldErrors = errors }, status = 400, message = "validation error" });
            }

            try
            {
                var affectedIds = await _service.CreateAsync(dto);
                var responseData = new { affectedIds };
                return CreatedAtAction(nameof(GetById), new { id = affectedIds.FirstOrDefault() }, 
                    new { data = responseData, status = 201, message = "Rapports de frais créés/mis à jour avec succès" });
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Données invalides lors de la création des rapports de frais");
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur serveur lors de la création des rapports de frais");
                return StatusCode(500, new { data = (object?)null, status = 500, message = "Une erreur est survenue" });
            }
        }

        // GET: api/ExpenseReport/mission/{missionId}
        [HttpGet("mission/{missionId}")]
        public async Task<ActionResult> GetByMissionId(string missionId)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });

            try
            {
                var (reports, totalAmount, attachments) = await _service.GetByMissionIdAsync(missionId);
                var responseData = new { reports, totalAmount, attachments };
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning("MissionId invalide : {MissionId} - {Message}", missionId, ex.Message);
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des rapports pour la mission {MissionId}", missionId);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        // GET: api/ExpenseReport/status/mission/{missionId}
        [HttpGet("status/mission/{missionId}")]
        public async Task<ActionResult> GetStatusByMissionId(string missionId)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });

            try
            {
                var statuses = await _service.GetStatusByMissionIdAsync(missionId);
                return Ok(new { data = statuses, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des statuts pour la mission {MissionId}", missionId);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        // POST: api/ExpenseReport/reimburse/mission/{missionId}?userId=xxx
        [HttpPost("reimburse/mission/{missionId}")]
        public async Task<ActionResult> ReimburseByMissionId(string missionId, [FromQuery] string userId)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });

            if (string.IsNullOrWhiteSpace(userId))
                return BadRequest(new { data = (object?)null, status = 400, message = "L'ID utilisateur est requis pour le remboursement" });

            try
            {
                var success = await _service.ReimburseByMissionIdAsync(missionId, userId);
                if (!success)
                    return NotFound(new { data = (object?)null, status = 404, message = $"Aucun rapport de frais non remboursé trouvé pour la mission {missionId}" });

                return Ok(new { data = new { message = "Remboursement effectué avec succès", missionId }, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors du remboursement de la mission {MissionId}", missionId);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        // GET: api/ExpenseReport/total-amount/mission/{missionId}
        [HttpGet("total-amount/mission/{missionId}")]
        public async Task<ActionResult> GetTotalAmountByMissionId(string missionId)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });

            try
            {
                var totalAmount = await _service.GetTotalAmountByMissionIdAsync(missionId);
                return Ok(new { data = new { totalAmount }, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors du calcul du montant total pour la mission {MissionId}", missionId);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        // GET: api/ExpenseReport/total-reimbursed
        [HttpGet("total-reimbursed")]
        public async Task<ActionResult> GetTotalReimbursedAmount()
        {
            if (!User.Identity?.IsAuthenticated ?? true)
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });

            try
            {
                var total = await _service.GetTotalReimbursedAmountAsync();
                return Ok(new { data = new { totalReimbursedAmount = total }, status = 200, message = "success" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du total remboursé");
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        // GET: api/ExpenseReport/total-notreimbursed
        [HttpGet("total-notreimbursed")]
        public async Task<ActionResult> GetTotalNotReimbursedAmount()
        {
            if (!User.Identity?.IsAuthenticated ?? true)
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });

            try
            {
                var total = await _service.GetTotalNotReimbursedAmountAsync();
                return Ok(new { data = new { totalNotReimbursedAmount = total }, status = 200, message = "success" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du total non remboursé");
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        // GET: api/ExpenseReport/count-reimbursed
        [HttpGet("count-reimbursed")]
        public async Task<ActionResult> GetTotalReimbursedCount()
        {
            if (!User.Identity?.IsAuthenticated ?? true)
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });

            var count = await _service.GetTotalReimbursedCountAsync();
            return Ok(new { data = new { totalReimbursedCount = count }, status = 200, message = "success" });
        }

        // GET: api/ExpenseReport/count-notreimbursed
        [HttpGet("count-notreimbursed")]
        public async Task<ActionResult> GetTotalNotReimbursedCount()
        {
            if (!User.Identity?.IsAuthenticated ?? true)
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });

            var count = await _service.GetTotalNotReimbursedCountAsync();
            return Ok(new { data = new { totalNotReimbursedCount = count }, status = 200, message = "success" });
        }

        // GET: api/ExpenseReport
        [HttpGet]
        public async Task<ActionResult> GetAll()
        {
            if (!User.Identity?.IsAuthenticated ?? true)
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });

            var reports = await _service.GetAllAsync();
            return Ok(new { data = reports, status = 200, message = "success" });
        }

        // GET: api/ExpenseReport/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult> GetById(string id)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });

            try
            {
                var report = await _service.GetByIdAsync(id);
                if (report == null)
                    return NotFound(new { data = (object?)null, status = 404, message = "Rapport de frais non trouvé" });

                return Ok(new { data = report, status = 200, message = "success" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du rapport {Id}", id);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpGet("by-filters")]
        public async Task<ActionResult> GetByFilter([FromQuery] ExpenseReportFilterDto filterDto, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var (reports, totalCount) = await _service.GetByFilterAsync(filterDto, page, pageSize);
                var response = new
                {
                    reports,
                    totalCount,
                    pageNumber = page,
                    pageSize,
                    totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
                };
                return Ok(new { data = response, status = 200, message = "success" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des rapports" ?? "all");
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        // PUT: api/ExpenseReport/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult> Update(string id, [FromBody] ExpenseLineDTO dto)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });

            if (dto == null)
                return BadRequest(new { data = (object?)null, status = 400, message = "Les données sont requises" });

            if (!ModelState.IsValid)
            {
                var errors = ModelState.ToDictionary(k => k.Key, k => k.Value!.Errors.Select(e => e.ErrorMessage).ToArray());
                return BadRequest(new { data = new { fieldErrors = errors }, status = 400, message = "validation error" });
            }

            var success = await _service.UpdateAsync(id, dto);
            if (!success)
                return NotFound(new { data = (object?)null, status = 404, message = "Rapport de frais non trouvé" });

            return NoContent();
        }

        // DELETE: api/ExpenseReport/{id}?userId=xxx
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id, [FromQuery] string userId)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });

            if (string.IsNullOrWhiteSpace(userId))
                return BadRequest(new { data = (object?)null, status = 400, message = "userId est requis" });

            var success = await _service.DeleteAsync(id, userId);
            if (!success)
                return NotFound(new { data = (object?)null, status = 404, message = "Rapport de frais non trouvé" });

            return NoContent();
        }
    }
}
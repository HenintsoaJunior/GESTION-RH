using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.recruitment;
using MyApp.Api.Services.recruitment;

namespace MyApp.Api.Controllers.recruitment
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReplacementReasonController(IReplacementReasonService reasonService) : ControllerBase
    {
        // GET: api/replacementreason
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ReplacementReason>>> GetAll()
        {
            try
            {
                var reasons = await reasonService.GetAllAsync();
                return Ok(reasons);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Une erreur est survenue lors de la récupération des motifs de remplacement: {ex.Message}");
            }
        }

        // GET: api/replacementreason/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ReplacementReason>> GetById(string id)
        {
            try
            {
                var reason = await reasonService.GetByIdAsync(id);
                if (reason == null)
                    return NotFound();

                return Ok(reason);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Une erreur est survenue lors de la récupération du motif de remplacement: {ex.Message}");
            }
        }

        // POST: api/replacementreason
        [HttpPost]
        public async Task<ActionResult> Create([FromBody] ReplacementReason reason)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                await reasonService.AddAsync(reason);
                return CreatedAtAction(nameof(GetById), new { id = reason.ReplacementReasonId }, reason);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Une erreur est survenue lors de la création du motif de remplacement: {ex.Message}");
            }
        }

        // PUT: api/replacementreason/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult> Update(string id, [FromBody] ReplacementReason reason)
        {
            try
            {
                if (id != reason.ReplacementReasonId)
                    return BadRequest("L'ID dans l'URL ne correspond pas à l'entité.");

                var existing = await reasonService.GetByIdAsync(id);
                if (existing == null)
                    return NotFound();

                await reasonService.UpdateAsync(reason);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Une erreur est survenue lors de la mise à jour du motif de remplacement: {ex.Message}");
            }
        }

        // DELETE: api/replacementreason/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            try
            {
                var reason = await reasonService.GetByIdAsync(id);
                if (reason == null)
                    return NotFound();

                await reasonService.DeleteAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Une erreur est survenue lors de la suppression du motif de remplacement: {ex.Message}");
            }
        }
    }
}
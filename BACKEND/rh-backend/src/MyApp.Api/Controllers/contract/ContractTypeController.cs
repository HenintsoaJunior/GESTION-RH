using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.contract;
using MyApp.Api.Services.contract;
using MyApp.Api.Models.form.contract;
namespace MyApp.Api.Controllers.contract
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContractTypeController(IContractTypeService contractTypeService) : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ContractType>>> GetAll()
        {
            try
            {
                var contractTypes = await contractTypeService.GetAllAsync();
                return Ok(contractTypes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Une erreur est survenue: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ContractType>> GetById(string id)
        {
            try
            {
                var contractType = await contractTypeService.GetByIdAsync(id);
                if (contractType == null)
                {
                    return NotFound();
                }
                return Ok(contractType);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Une erreur est survenue: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult> Add([FromBody] ContractTypeDTOForm form)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var contractType = new ContractType
                {
                    Code = form.Code,
                    Label = form.Label
                };


                await contractTypeService.AddAsync(contractType);
                return CreatedAtAction(nameof(GetById), new { id = contractType.ContractTypeId }, contractType);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Une erreur est survenue: {ex.Message}");
            }
        }


        [HttpPut("{id}")]
        public async Task<ActionResult> Update(string id, [FromBody] ContractType contractType)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                if (id != contractType.ContractTypeId)
                {
                    return BadRequest("L'ID dans l'URL ne correspond pas à l'ID du contrat");
                }

                var existingContractType = await contractTypeService.GetByIdAsync(id);
                if (existingContractType == null)
                {
                    return NotFound();
                }

                await contractTypeService.UpdateAsync(contractType);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Une erreur est survenue: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            try
            {
                var contractType = await contractTypeService.GetByIdAsync(id);
                if (contractType == null)
                {
                    return NotFound();
                }

                await contractTypeService.DeleteAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Une erreur est survenue: {ex.Message}");
            }
        }
    }
}   
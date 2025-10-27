using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Models.dto.currency;
using MyApp.Api.Services.currency;
using System;
using System.Threading.Tasks;

namespace MyApp.Api.Controllers.currency
{
    [Route("api/[controller]")]
    [ApiController]
    public class CurrencyController : ControllerBase
    {
        private readonly ICurrencyService _currencyService;

        public CurrencyController(ICurrencyService currencyService)
        {
            _currencyService = currencyService ?? throw new ArgumentNullException(nameof(currencyService));
        }

        
        [HttpGet("rates")]
        // [AllowAnonymous]
        public async Task<ActionResult> GetRates()
        {
            try
            {
                // if (!User.Identity?.IsAuthenticated ?? true)
                // {
                //     return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
                // }


                var rates = await _currencyService.GetCurrencyRatesAsync();

                var responseData = rates;
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (InvalidOperationException ex)
            {
               return StatusCode(503, new { data = (object?)null, status = 503, message = $"Service Unavailable: {ex.Message}" });
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error during rates fetching" });
            }
        }

        [HttpGet("convert-to-mga")]
        // [AllowAnonymous]
        public async Task<ActionResult> ConvertToMGA([FromQuery] decimal amount, [FromQuery] string fromCurrency)
        {
            try
            {
                // if (!User.Identity?.IsAuthenticated ?? true)
                // {
                //     return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
                // }

                if (amount <= 0)
                {
                    return BadRequest(new { data = (object?)null, status = 400, message = "Amount must be greater than zero" });
                }

                if (string.IsNullOrWhiteSpace(fromCurrency))
                {
                    return BadRequest(new { data = (object?)null, status = 400, message = "Source currency (fromCurrency) is required" });
                }

                var convertedAmountDto = await _currencyService.ConvertToMGAAsync(amount, fromCurrency);

                var responseData = convertedAmountDto;
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error during conversion" });
            }
        }
    }
}
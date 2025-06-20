using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.recruitment;
using MyApp.Api.Services.recruitment;

[ApiController]
[Route("api/[controller]")]
public class RecruitmentRequestController : ControllerBase
{
    private readonly IRecruitmentRequestService _service;

    public RecruitmentRequestController(IRecruitmentRequestService service)
    {
        _service = service;
    }

    [HttpPost("search")]
    public async Task<IActionResult> Search([FromBody] RecruitmentRequestCriteria criteria)
    {
        var results = await _service.GetByCriteriaAsync(criteria);
        return Ok(results);
    }


    [HttpGet("paginated")]
    public async Task<IActionResult> GetPaginated([FromQuery] int start, [FromQuery] int count)
    {
        var results = await _service.GetPaginatedRequestsAsync(start, count);
        return Ok(results);
    }


    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await _service.GetAllRequestsAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var request = await _service.GetRequestByIdAsync(id);
        if (request == null) return NotFound();
        return Ok(request);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] RecruitmentRequest request)
    {
        await _service.AddRequestAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = request.RecruitmentRequestId }, request);
    }
}

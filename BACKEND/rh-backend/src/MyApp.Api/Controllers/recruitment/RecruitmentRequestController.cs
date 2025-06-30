using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.recruitment;
using MyApp.Api.Services.recruitment;
using Microsoft.AspNetCore.Http;
using System.IO;
using MyApp.Api.Models.recruitment;

[ApiController]
[Route("api/[controller]")]
public class RecruitmentRequestController : ControllerBase
{
    private readonly IRecruitmentApprovalService _approvalService;
    private readonly IRecruitmentRequestFileService _fileService; // Ajout du service pour les fichiers
    private readonly IRecruitmentRequestService _requestService;

    public RecruitmentRequestController(
        IRecruitmentRequestService requestService,
        IRecruitmentRequestFileService fileService,
        IRecruitmentApprovalService approvalService) // Injection du nouveau service
    {
        _requestService = requestService;
        _fileService = fileService;
        _approvalService = approvalService;
    }

    [HttpGet("by-request/{requestId}")]
    public async Task<IActionResult> GetApprovalByRequestId(string requestId)
    {
        var approvals = await _approvalService.GetApprovalsByRequestIdAsync(requestId);
        return Ok(approvals);
    }

    [HttpGet("by-approver/{approverId}")]
    public async Task<IActionResult> GetApprovalByApprover(string approverId)
    {
        var approvals = await _approvalService.GetByApproverAsync(approverId);
        return Ok(approvals);
    }

    [HttpPost("validate")]
    public async Task<IActionResult> ValidateApproval([FromBody] RecruitmentApproval approval)
    {
        await _approvalService.ValidateApprovalAsync(approval);
        return Ok("Approval validated.");
    }

    [HttpPost("recommend")]
    public async Task<IActionResult> RecommendApproval([FromBody] RecruitmentApproval approval)
    {
        await _approvalService.RecommendApprovalAsync(approval);
        return Ok("Approval recommended.");
    }

    [HttpGet("files")]
    public async Task<IActionResult> GetFilesByRecruitmentRequestId([FromQuery] string recruitment_request_id)
    {
        var results = await _fileService.GetFilesByRecruitmentRequestIdAsync(recruitment_request_id  );
        return Ok(results);
    }

    [HttpPost("search")]
    public async Task<IActionResult> Search([FromBody] RecruitmentRequestCriteria criteria)
    {
        var results = await _requestService.GetByCriteriaAsync(criteria);
        return Ok(results);
    }

    [HttpGet("paginated")]
    public async Task<IActionResult> GetPaginated([FromQuery] int start, [FromQuery] int count)
    {
        var results = await _requestService.GetPaginatedRequestsAsync(start, count);
        return Ok(results);
    }

    [HttpGet("requests/{idRequester}")]
    public async Task<IActionResult> GetRequestsByRequester(string idRequester)
    {
        var requests = await _requestService.GetRequestsByRequesterAsync(idRequester);
        if (requests == null) return NotFound();
        return Ok(requests);
    }
    // toutes les demandes
    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await _requestService.GetAllRequestsAsync());

    [HttpGet("request/{id}")]
    public async Task<IActionResult> GetRequestById(string id)
    {
        var request = await _requestService.GetRequestByIdAsync(id);
        if (request == null) return NotFound();
        return Ok(request);
    }

    // création de la demande
   [HttpPost]
    public async Task<IActionResult> Create([FromForm] CreateRecruitmentRequestDto requestDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (!string.IsNullOrEmpty(requestDto.RecruitmentRequestId))
        {
            var existingRequest = await _requestService.GetRequestByIdAsync(requestDto.RecruitmentRequestId);
            if (existingRequest != null)
            {
                ModelState.AddModelError("RecruitmentRequestId", "L'ID de la demande existe déjà.");
                return BadRequest(ModelState);
            }
        }

        var request = new RecruitmentRequest
        {
            RecruitmentRequestId = string.IsNullOrEmpty(requestDto.RecruitmentRequestId) 
                ? Guid.NewGuid().ToString() 
                : requestDto.RecruitmentRequestId,
            JobTitle = requestDto.JobTitle ?? string.Empty,
            Description = requestDto.Description,
            Status = requestDto.Status ?? "En Attente",
            RequesterId = requestDto.RequesterId ?? string.Empty,
            RequestDate = requestDto.RequestDate,
            ApprovalDate = requestDto.ApprovalDate
        };                                                                                                                                 

        await _requestService.AddRequestAsync(request);

        if (requestDto.Files != null && requestDto.Files.Count > 0)
        {
            foreach (var file in requestDto.Files)
            {
                if (file.Length > 0)
                {
                    using var memoryStream = new MemoryStream();
                    await file.CopyToAsync(memoryStream);
                    var fileBytes = memoryStream.ToArray();

                    var recruitmentRequestFile = new RecruitmentRequestFile
                    {
                        FileId = Guid.NewGuid().ToString(),
                        FileName = fileBytes,
                        RecruitmentRequestId = request.RecruitmentRequestId
                    };

                    await _fileService.AddFileAsync(recruitmentRequestFile);
                }
            }
        }
        return CreatedAtAction(nameof(GetRequestById), new { id = request.RecruitmentRequestId }, request);
    }
}
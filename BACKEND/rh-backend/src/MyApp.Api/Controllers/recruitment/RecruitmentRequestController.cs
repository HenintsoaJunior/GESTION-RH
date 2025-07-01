using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.recruitment;
using MyApp.Api.Services.recruitment;
using Microsoft.AspNetCore.Http;
using System.IO;
using MyApp.Api.Models.recruitment;

namespace MyApp.Api.Controllers.recruitment
{
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

        // les recommandations pour une demande
        [HttpGet("approval-recommanded/{requesterId}")]
        public async Task<IActionResult> GetRecommendedApprovalsByRequester(string requesterId)
        {
            var approvals = await _approvalService.GetRecommendedApprovalsByRequesterAsync(requesterId);
            return Ok(approvals);
        }

        // les demandes qu'un approuveur a validé
        [HttpGet("approval-validated-by-approver-id/{approverId}")]
        public async Task<IActionResult> GetValidatedByApprover(string approverId)
        {
            var result = await _approvalService.GetValidatedApprovalsByApproverAsync(approverId);
            return Ok(result);
        }

        // les demandes reçus par id approuveur
        [HttpGet("approval-by-approver-id/{approverId}")]
        public async Task<IActionResult> GetApprovalByApprover(string approverId)
        {
            var approvals = await _approvalService.GetByApproverAsync(approverId);
            return Ok(approvals);
        }

        // les validations d'une demande par id demande
        [HttpGet("approval-by-request-id/{requestId}")]
        public async Task<IActionResult> GetApprovalByRequestId(string requestId)
        {
            var approvals = await _approvalService.GetApprovalsByRequestIdAsync(requestId);
            return Ok(approvals);
        }

        // valider une demande
        [HttpPost("approval/validate")]
        public async Task<IActionResult> ValidateApproval([FromBody] RecruitmentApproval approval)
        {
            await _approvalService.ValidateApprovalAsync(approval);
            return Ok("Approval validated.");
        }

        // recommander une demande
        [HttpPost("approval/recommend")]
        public async Task<IActionResult> RecommendApproval([FromBody] RecruitmentApproval approval)
        {
            await _approvalService.RecommendApprovalAsync(approval);
            return Ok("Approval recommended.");
        }

        // les fichiers d'une demande
        [HttpGet("requests/files")]
        public async Task<IActionResult> GetFilesByRecruitmentRequestId([FromQuery] string recruitment_request_id)
        {
            var results = await _fileService.GetFilesByRecruitmentRequestIdAsync(recruitment_request_id);
            return Ok(results);
        }

        // multi-critères
        [HttpPost("requests/search")]
        public async Task<IActionResult> Search([FromBody] RecruitmentRequestCriteria criteria)
        {
            var results = await _requestService.GetByCriteriaAsync(criteria);
            return Ok(results);
        }

        // demandes paginé
        [HttpGet("requests/paginated")]
        public async Task<IActionResult> GetPaginated([FromQuery] int start, [FromQuery] int count, [FromQuery] string requesterId)
        {
            var results = await _requestService.GetPaginatedRequestsAsync(start, count, requesterId);
            return Ok(results);
        }

        // les demandes par id demandeur
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

        // get demande par id demande
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

            if (requestDto.Files != null)
            {
                await ProcessRecruitmentRequestFilesAsync(requestDto.Files, request.RecruitmentRequestId);
            }

            return CreatedAtAction(nameof(GetRequestById), new { id = request.RecruitmentRequestId }, request);
        }

        private async Task ProcessRecruitmentRequestFilesAsync(IFormFileCollection files, string recruitmentRequestId)
        {
            if (files == null || files.Count == 0)
                return;

            foreach (var file in files)
            {
                if (file.Length > 0)
                {
                    await SaveRecruitmentRequestFileAsync(file, recruitmentRequestId);
                }
            }
        }

        private async Task SaveRecruitmentRequestFileAsync(IFormFile file, string recruitmentRequestId)
        {
            using var memoryStream = new MemoryStream();
            await file.CopyToAsync(memoryStream);
            var fileBytes = memoryStream.ToArray();

            var recruitmentRequestFile = new RecruitmentRequestFile
            {
                FileId = Guid.NewGuid().ToString(),
                FileName = fileBytes,
                RecruitmentRequestId = recruitmentRequestId
            };

            await _fileService.AddFileAsync(recruitmentRequestFile);
        }
    
    }
}
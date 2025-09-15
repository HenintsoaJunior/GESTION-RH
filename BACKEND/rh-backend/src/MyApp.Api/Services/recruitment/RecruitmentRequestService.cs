using Microsoft.EntityFrameworkCore.Storage;
using MyApp.Api.Entities.recruitment;
using MyApp.Api.Repositories.employee;
using MyApp.Api.Repositories.recruitment;
using MyApp.Api.Services.employee;
using MyApp.Api.Services.users;
using MyApp.Api.Utils.generator;
using Newtonsoft.Json;
using static MyApp.Api.Models.dto.recruitment.RecruitmentValidationDTO;

namespace MyApp.Api.Services.recruitment
{
    public interface IRecruitmentRequestService
    {
        Task<string> CreateRequest(RecruitmentRequest request, RecruitmentRequestDetail detail, IEnumerable<RecruitmentRequestReplacementReason> requestReplacementReasons);
        Task<IEnumerable<RecruitmentRequest>> GetAllAsync();
        Task<RecruitmentRequest?> GetByRequestIdAsync(string requestId);
        Task<IEnumerable<RecruitmentRequest>> GetByRequesterIdAsync(string requesterId);
        Task<IEnumerable<RecruitmentRequest>> GetByRequesterIdAndValidatedAsync(string requesterId);
        Task AddAsync(RecruitmentRequest request);
        Task UpdateAsync(RecruitmentRequest request);
        Task DeleteAsync(string requestId);
    }

    public class RecruitmentRequestService : IRecruitmentRequestService
    {
        private readonly IRecruitmentRequestRepository _requestRepository;
        private readonly IRecruitmentRequestDetailService _requestDetailService;
        private readonly IRecruitmentRequestReplacementReasonService _replacementReasonService;
        private readonly IRecruitmentValidationService _validationService;  
        private readonly IUserService _userService;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly ILogger<RecruitmentRequestService> _logger;

        public RecruitmentRequestService(
            IRecruitmentRequestRepository requestRepository,
            IRecruitmentRequestDetailService requestDetailService,
            IRecruitmentRequestReplacementReasonService replacementReasonService,
            IRecruitmentValidationService validationService,
            IUserService userService,
            ISequenceGenerator sequenceGenerator,
            ILogger<RecruitmentRequestService> logger)
        {
            _requestRepository = requestRepository;
            _requestDetailService = requestDetailService;
            _replacementReasonService = replacementReasonService;
            _validationService = validationService;
            _userService = userService;
            _sequenceGenerator = sequenceGenerator;
            _logger = logger;
        }

        public async Task<string> CreateRequest(RecruitmentRequest request, RecruitmentRequestDetail detail, IEnumerable<RecruitmentRequestReplacementReason> requestReplacementReasons)
        {
            using var transaction = await _requestRepository.BeginTransactionAsync();
            try
            {
                if (string.IsNullOrWhiteSpace(request.RecruitmentRequestId))
                {
                    request.RecruitmentRequestId = _sequenceGenerator.GenerateSequence("seq_recruitment_request_id", "REQ", 6, "-");
                }

                await _requestRepository.AddAsync(request);
                await _requestRepository.SaveChangesAsync();

                if (detail != null)
                {
                    detail.RecruitmentRequestId = request.RecruitmentRequestId;
                    await _requestDetailService.AddAsync(detail);
                }

                if (requestReplacementReasons != null && requestReplacementReasons.Any())
                {
                    var reasonsToAdd = requestReplacementReasons.Select(r => new RecruitmentRequestReplacementReason
                    {
                        RecruitmentRequestId = request.RecruitmentRequestId,
                        ReplacementReasonId = r.ReplacementReasonId,
                        Description = r.Description,
                    }).ToList();

                    await _replacementReasonService.AddRangeAsync(reasonsToAdd);
                }
                var requester = await GetByRequesterIdAsync(request.RequesterId);
                var firstRequester = requester.FirstOrDefault();

                var superior = await _userService.GetSuperiorAsync(firstRequester?.Requester?.Matricule);

                var departments = new List<string>();
                if (!string.IsNullOrWhiteSpace(superior?.Department) && !departments.Contains(superior.Department))
                {
                    departments.Add(superior.Department);
                }
                
                var fixedDepartments = new[] { "DRH", "DAF", "DGE" };
                departments.AddRange(fixedDepartments.Where(dept => !departments.Contains(dept)));

                foreach (var department in departments)
                {
                    var director = await _userService.GetDirectorByDepartmentAsync(department);
                    if (director != null)
                    {
                        var validationDto = new RecruitmentValidationDTOForm
                        {
                            RecruitmentRequestId = request.RecruitmentRequestId,
                            RecruitmentCreator = request.RequesterId,
                            Status = department == superior?.Department ? "En attente" : "Brouillon",
                            ToWhom = director.UserId,
                            Type = department,
                            ValidationDate = null
                        };

                        await _validationService.CreateAsync(validationDto, request.RequesterId);
                    }
                    else
                    {
                        _logger.LogWarning("No director found for department: {Department}", department);
                    }
                }

                await transaction.CommitAsync();
                return request.RecruitmentRequestId;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error creating recruitment request with ID: {RequestId}", request.RecruitmentRequestId);
                throw;
            }
        }
        
        public async Task<IEnumerable<RecruitmentRequest>> GetAllAsync()
        {
            try
            {
                return await _requestRepository.GetAllAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de toutes les demandes de recrutement");
                throw;
            }
        }

        public async Task<RecruitmentRequest?> GetByRequestIdAsync(string requestId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(requestId))
                {
                    return null;
                }

                return await _requestRepository.GetByRequestIdAsync(requestId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de la demande avec l'ID: {RequestId}", requestId);
                throw;
            }
        }

        public async Task<IEnumerable<RecruitmentRequest>> GetByRequesterIdAsync(string requesterId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(requesterId))
                {
                    return Enumerable.Empty<RecruitmentRequest>();
                }

                return await _requestRepository.GetByRequesterIdAsync(requesterId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des demandes pour le demandeur: {RequesterId}", requesterId);
                throw;
            }
        }

        public async Task<IEnumerable<RecruitmentRequest>> GetByRequesterIdAndValidatedAsync(string requesterId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(requesterId))
                {
                    return Enumerable.Empty<RecruitmentRequest>();
                }

                return await _requestRepository.GetByRequesterIdAndValidatedAsync(requesterId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des demandes validées pour le demandeur: {RequesterId}", requesterId);
                throw;
            }
        }

        public async Task AddAsync(RecruitmentRequest request)
        {
            try
            {
                if (request == null)
                {
                    throw new ArgumentNullException(nameof(request), "La demande de recrutement ne peut pas être null");
                }

                if (string.IsNullOrWhiteSpace(request.RecruitmentRequestId))
                {
                    request.RecruitmentRequestId = _sequenceGenerator.GenerateSequence("seq_recruitment_request_id", "REQ", 6, "-");
                }

                await _requestRepository.AddAsync(request);
                await _requestRepository.SaveChangesAsync();
                
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l'ajout de la demande de recrutement");
                throw;
            }
        }

        public async Task UpdateAsync(RecruitmentRequest request)
        {
            try
            {
                if (request == null)
                {
                    throw new ArgumentNullException(nameof(request), "La demande de recrutement ne peut pas être null");
                }

                await _requestRepository.UpdateAsync(request);
                await _requestRepository.SaveChangesAsync();
                
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour de la demande de recrutement avec l'ID: {RequestId}", request?.RecruitmentRequestId);
                throw;
            }
        }

        public async Task DeleteAsync(string requestId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(requestId))
                {
                    throw new ArgumentException("L'ID de la demande ne peut pas être null ou vide", nameof(requestId));
                }

                await _requestRepository.DeleteAsync(requestId);
                await _requestRepository.SaveChangesAsync();
                
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression de la demande de recrutement avec l'ID: {RequestId}", requestId);
                throw;
            }
        }
    }
}
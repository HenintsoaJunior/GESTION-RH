using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.recruitment;
using MyApp.Api.Models.dto.recruitment;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Repositories.recruitment;

public interface IRequestRepository
{
    Task<List<RequestStatus>> GetAllStatuses();
    Task<(List<RequestListDTO>, int)> SearchRequests(FilterRequestListDTO dto, int page, int pageSize);
    Task AddRequest(RequestFormDTO data);
    Task<RequestDetailsDTO> GetRequestDetails(string id);
}


public class RequestRepository : IRequestRepository
{
    private readonly AppDbContext _dbCtx;
    private readonly ISequenceGenerator _generator;
    private readonly ILogger<RequestRepository> _logger;

    public RequestRepository(AppDbContext ctx, ISequenceGenerator sqc
    , ILogger<RequestRepository> log
    ) {
        _dbCtx = ctx; _generator = sqc;
        _logger = log;
    }


    public async Task<(List<RequestListDTO>, int)> SearchRequests(
        FilterRequestListDTO dto, int page, int pageSize
    ) {
        var query = _dbCtx.RecruitmentRequests
            .AsNoTracking()
            .Include(r => r.ApplicantUser)
            .Include(r => r.Contract)
            .Where(r => !r.IsDeleted)
            .AsQueryable();

        // --- Filtres ---
        if (!string.IsNullOrWhiteSpace(dto.post))
            query = query.Where(r => r.Post.ToLower().Contains(dto.post.ToLower()));

        if (!string.IsNullOrWhiteSpace(dto.contract))
            query = query.Where(r => r.Contract != null && r.Contract.Code == dto.contract);

        if (!string.IsNullOrWhiteSpace(dto.direction))
            query = query.Where(r => r.ApplicantUser.Department == dto.direction);

        if (dto.minDate.HasValue)
            query = query.Where(r => DateOnly.FromDateTime(r.CreatedAt) >= dto.minDate.Value);

        if (dto.maxDate.HasValue)
            query = query.Where(r => DateOnly.FromDateTime(r.CreatedAt) <= dto.maxDate.Value);

        // --- Filtre par statut (direct sans join) ---
        if (!string.IsNullOrWhiteSpace(dto.status))
            query = query.Where(r => r.LastStatus.ToLower() == dto.status.ToLower());

        // --- Compte ---
        int totalCount = await query.CountAsync();

        // --- Résultats paginés ---
        var list = await query
            .OrderByDescending(r => r.CreatedAt)
            .ThenBy(r => r.Post)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new RequestListDTO {
                Id = r.Id,
                Post = r.Post,
                Effective = r.Effective,
                Contract = r.Contract != null ? r.Contract.Code : "Autre",
                WishedDate = r.BeginningDate,
                Status = r.LastStatus,
                SendingDate = DateOnly.FromDateTime(r.CreatedAt)
            })
            .ToListAsync();

        return (list, totalCount);
    }


    public async Task AddRequest(RequestFormDTO data) {
        using var transaction = await _dbCtx.Database.BeginTransactionAsync();
        
        try {
            var replacementReason = data.ReplacementReasonId != null
                ? await _dbCtx.ReplacementReasons.FindAsync(data.ReplacementReasonId)
                : null;

            var lastTitular = data.LastTitularId != null
                ? await _dbCtx.Users.FindAsync(data.LastTitularId)
                : null;

            var contract = await _dbCtx.ContractTypes.FirstOrDefaultAsync(
                c => c.ContractTypeId == data.ContractId
            );

            var applicant = await _dbCtx.Users.FindAsync(data.ApplicantUserId)
                ?? throw new Exception("Utilisateur demandeur introuvable");

            var defaultStatus = await _dbCtx.RequestStatuses.FindAsync("STD_001")
                ?? throw new Exception("Statut par défaut introuvable");

        // Construire la demande
            var request = new RecruitmentRequest
            {
                Id = _generator.GenerateSequence("seq_request_id", "DMD_REC"),
                Post = data.Post,
                Effective = data.Effective,

                IsReplacement = data.IsReplacement,
                ReplacementReason = replacementReason,
                ReplacementDate = data.ReplacementDate,
                ReasonPrecision = data.ReasonPrecision,
                LastTitular = lastTitular,

                Contract = contract,
                ContractPrecision = data.ContractPrecision,
                MonthDuration = data.MonthDuration,

                BeginningDate = data.BeginningDate,
                ApplicantUser = applicant,
                IsDeleted = false,

                IsPlanned = data.IsPlanned,
                NotPlannedReason = data.NotPlannedReason
            };

            var reqValidation = new RequestValidation
            {
                Id = _generator.GenerateSequence("seq_request_validation_id", "DMD_REC_VAL"),
                Status = defaultStatus,
                Validator = applicant,
                Request = request
            };

            for(int i=0; i<data.Sites.Length; i++) {
                var siteRequest = new SiteRequest
                {
                    Id = _generator.GenerateSequence("seq_id_site_request", "DMD_REC_SITE"),
                    Request = request,
                    Site = await _dbCtx.Sites.FindAsync(data.Sites[i]) ?? throw new Exception("Site introuvable")
                };
                await _dbCtx.SitesRequests.AddAsync(siteRequest);
            }

            await _dbCtx.RecruitmentRequests.AddAsync(request);
            await _dbCtx.RequestValidations.AddAsync(reqValidation);

            await _dbCtx.SaveChangesAsync();
            await transaction.CommitAsync();
        }
        catch {
            await transaction.RollbackAsync();
            throw;
        }
    }


    public async Task<List<RequestStatus>> GetAllStatuses() {
        return await _dbCtx.RequestStatuses.AsNoTracking()
            .ToListAsync();
    }


    public async Task DeleteRequest(RecruitmentRequest req) {
        if(req.IsDeleted==false) {
            req.IsDeleted = true;
            await _dbCtx.SaveChangesAsync();
        }
        else {
           throw new Exception("Demande déjà supprimée."); 
        }
    }


    public async Task<RequestDetailsDTO> GetRequestDetails(string id) {
    // Charger la demande avec toutes les dépendances
        var request = await _dbCtx.RecruitmentRequests
        .Include(r => r.ApplicantUser)
        .Include(r => r.ReplacementReason)
        .Include(r => r.Contract)
        .Include(r => r.LastTitular)
        .FirstOrDefaultAsync(r => r.Id == id && !r.IsDeleted);

        if(request == null)
            throw new ArgumentException("Demande introuvable");

    // Charger les sites
        var sites = await _dbCtx.SitesRequests
            .Where(s => s.Request.Id == id)
            .Select(s => s.Site.SiteName)
            .AsNoTracking().ToListAsync();

    // Récupérer les validations + dernier statut
        var validations = await _dbCtx.RequestValidations
            .Where(v => v.Request.Id == id)
            .Include(v => v.Status)
            .OrderBy(v => v.CreatedAt)
            .AsNoTracking().ToListAsync();

        var lastStatus = validations.LastOrDefault()?.Status?.Name ?? "Inconnu";

        int validationLevel = validations.Count-1;

    // Construire le DTO
        return new RequestDetailsDTO
        {
            Id = request.Id,
            ApplicantUser = request.ApplicantUser.Name??"",
            Status = lastStatus,
            IsReplacement = request.IsReplacement,
            ReplacementDate = request.ReplacementDate,
            ReplacementReason = request.ReplacementReason?.Name,
            ReasonPrecision = request.ReasonPrecision,
            LastTitular = request.LastTitular?.Name,
            Sites = sites.ToArray(),
            Contract = request.Contract?.Code,
            ContractPrecision = request.ContractPrecision,
            MonthDuration = request.MonthDuration,
            BeginningDate = request.BeginningDate,
            ValidationLevel = validationLevel,
            IsPlanned = request.IsPlanned,
            NotPlannedReason = request.NotPlannedReason
        };
    }
}

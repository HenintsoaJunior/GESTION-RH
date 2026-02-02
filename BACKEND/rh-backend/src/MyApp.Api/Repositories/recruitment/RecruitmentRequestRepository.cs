using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.recruitment;
using MyApp.Api.Entities.site;
using MyApp.Api.Models.dto.recruitment;
using MyApp.Api.Services.users;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Repositories.recruitment;

public interface IRecruitmentRequestRepository
{
    Task<List<RequestStatus>> GetAllStatuses();
    Task<(List<RequestListDTO>, int)> SearchRequests(FilterRequestListDTO dto,
     string currentUserEmail, int page, int pageSize);
    Task<RecruitmentRequest> AddRequest(RequestFormDTO data);
    Task<RequestEditDTO> GetById(string id);
    Task DeleteRequest(RecruitmentRequest request);
    Task UpdateRequest(RecruitmentRequest lastRequest, RequestFormDTO data);
    Task<RequestDetailsDTO> GetRequestDetails(string id);
    Task<RecruitmentRequest> GetRecruitmentRequestById(string requestId);

    Task<List<Site>> GetSitesAsync(RecruitmentRequest request); 
}


public class RecruitmentRequestRepository : IRecruitmentRequestRepository
{
    private readonly AppDbContext _dbCtx;
    private readonly ISequenceGenerator _generator;
    private readonly IUserService _userService;

    public RecruitmentRequestRepository(AppDbContext ctx, ISequenceGenerator sqc,
     IUserService uService) {
        _dbCtx = ctx; _generator = sqc; _userService = uService;
    }


    public async Task<(List<RequestListDTO>, int)> SearchRequests(
        FilterRequestListDTO dto, string currentUserEmail, int page, int pageSize
    ) {
        var query = _dbCtx.RecruitmentRequests
            .AsNoTracking()
            .Include(r => r.Creator)
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
            query = query.Where(r => r.Creator.Department == dto.direction
             || r.ApplicantUser.Department == dto.direction);
        
        if (!string.IsNullOrWhiteSpace(dto.Scope) && dto.Scope.ToLower().Equals("mes"))
            query = query.Where(r => r.Creator.Email == currentUserEmail
             || r.ApplicantUser.Email == currentUserEmail);

        else if (!string.IsNullOrWhiteSpace(dto.Scope) && 
         dto.Scope.ToLower().Equals("collaborateurs")) {
            var user = await _userService.GetByEmailAsync(currentUserEmail);
            var collaborators = await _userService.GetCollaboratorsAsync(user!.UserId);

            query = query.Where(r => collaborators.Select(u => u.Email)
             .Contains(r.ApplicantUser.Email));
        }

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


    public async Task<RecruitmentRequest> AddRequest(RequestFormDTO data) {
        try {
        // Vérification des entités liées
            var replacementReason = data.ReplacementReasonId != null
                ? await _dbCtx.ReplacementReasons.FindAsync(data.ReplacementReasonId)
                : null;

            var lastTitular = data.LastTitularId != null
                ? await _dbCtx.Users.FindAsync(data.LastTitularId)
                : null;

            var contract = await _dbCtx.ContractTypes.FirstOrDefaultAsync(
                c => c.ContractTypeId == data.ContractId
            );

            var hierarchicalManager = await _dbCtx.Users.FindAsync(data.HierarchicalManagerId)
                ?? throw new ArgumentException("Rattachement hiérarchique introuvable");

            var functionalManager = await _dbCtx.Users.FindAsync(data.FunctionalManagerId)
                ?? throw new ArgumentException("Rattachement fonctionnel introuvable");

            var defaultStatus = await _dbCtx.RequestStatuses.FindAsync("STD_001")
                ?? throw new ArgumentException("Statut par défaut introuvable");

        // Construire la demande
            var request = new RecruitmentRequest
            {
                Id = _generator.GenerateSequence("seq_request_id", "DMD_REC"),
                Post = data.Post,
                Effective = data.Effective,

                IsReplacement = data.IsReplacement,
                ReplacementReasonId = replacementReason?.Id,
                ReplacementDate = data.ReplacementDate,
                ReasonPrecision = data.ReasonPrecision,
                LastTitularUserId = lastTitular?.UserId,

                ContractTypeId = data.ContractId,
                ContractPrecision = data.ContractPrecision,
                MonthDuration = data.MonthDuration,

                BeginningDate = data.BeginningDate,
                ApplicantUserId = data.ApplicantUserId,
                HierarchicalManagerId = data.HierarchicalManagerId,
                FunctionalManagerId = data.FunctionalManagerId,
                CreatorId = data.CreatorId,
                IsDeleted = false,

                IsPlanned = data.IsPlanned,
                NotPlannedReason = data.NotPlannedReason
            };

            var reqValidation = new RequestValidation
            {
                Id = _generator.GenerateSequence("seq_request_validation_id", "DMD_REC_VAL"),
                StatusId = defaultStatus.Id,
                ValidatorId = data.CreatorId,
                RequestId = request.Id
            };

            for(int i=0; i<data.Sites.Length; i++) {
                var siteRequest = new SiteRequest
                {
                    Id = _generator.GenerateSequence("seq_id_site_request", "DMD_REC_SITE"),
                    RequestId = request.Id,
                    SiteId = await _dbCtx.Sites.FindAsync(data.Sites[i])!=null 
                        ? data.Sites[i] : throw new Exception($"Site '{data.Sites[i]}' introuvable")
                };
                await _dbCtx.SitesRequests.AddAsync(siteRequest);
            }

            await _dbCtx.RecruitmentRequests.AddAsync(request);
            await _dbCtx.RequestValidations.AddAsync(reqValidation);

            return request;
        }
        catch {
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
        .Include(r => r.HierarchicalManager).Include(r => r.FunctionalManager)
        .Include(r => r.Creator).Include(r => r.ApplicantUser)
        .Include(r => r.ReplacementReason)
        .Include(r => r.Contract)
        .Include(r => r.LastTitular)
        .FirstOrDefaultAsync(r => r.Id == id && !r.IsDeleted);

        if(request == null) throw new ArgumentException("Demande introuvable");

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
            Post = request.Post,
            Effective = request.Effective,
            HierarchicalManager = request.HierarchicalManager.Name??"",
            FunctionalManager = request.FunctionalManager.Name??"",
            ApplicantUser = request.ApplicantUser.Name??"",
            Creator = request.Creator.Name??"",
            Status = lastStatus,
            IsReplacement = request.IsReplacement,
            ReplacementDate = request.ReplacementDate,
            ReplacementReason = request.ReplacementReason?.Name,
            ReasonPrecision = request.ReasonPrecision,
            LastTitular = request.LastTitular?.Name ?? request.LastTitular?.Matricule,
            Sites = sites.ToArray(),
            Contract = request.Contract?.Code,
            ContractPrecision = request.ContractPrecision,
            MonthDuration = request.MonthDuration,
            BeginningDate = request.BeginningDate,
            ValidationLevel = validationLevel,
            IsPlanned = request.IsPlanned,
            NotPlannedReason = request.NotPlannedReason,
            SendingDate = request.CreatedAt,
        };
    }


    public async Task<RecruitmentRequest> GetRecruitmentRequestById(string requestId) {
        var request = await _dbCtx.RecruitmentRequests
            .Include(r => r.HierarchicalManager).Include(r => r.FunctionalManager)
            .Include(r => r.Creator).Include(r => r.ApplicantUser)
            .Include(r => r.Contract)
            .Include(r => r.ReplacementReason)
            .Include(r => r.LastTitular)
            .Include(r => r.SitesRequests)
                .ThenInclude(sr => sr.Site)
            .FirstOrDefaultAsync(r => r.Id == requestId) ?? 
         throw new ArgumentException("Demande de recrutement introuvable");
        
        return request;
    }


    public async Task<List<Site>> GetSitesAsync(RecruitmentRequest request) {
        var recruitmentRequest = await _dbCtx.RecruitmentRequests
            .Include(r => r.SitesRequests)
                .ThenInclude(sr => sr.Site)
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == request.Id);

        return recruitmentRequest?
            .SitesRequests
            .Select(sr => sr.Site)
            .ToList() ?? new List<Site>();
    }


    public async Task<RequestEditDTO> GetById(string id) {
        var request = await this.GetRecruitmentRequestById(id);

        return new RequestEditDTO
        {
            Id = request.Id,
            Post = request.Post,
            Effective = request.Effective,
            BeginningDate = request.BeginningDate,

            ContractId = request.Contract?.ContractTypeId,
            ContractPrecision = request.ContractPrecision,
            MonthDuration = request.MonthDuration,

            Sites = request.SitesRequests.Select(sr => 
                sr.Site.SiteId).ToArray(),

            IsReplacement = request.IsReplacement,
            ReplacementReasonId = request.ReplacementReason?.Id,
            ReplacementDate = request.ReplacementDate,
            ReasonPrecision = request.ReasonPrecision,
            LastTitularId = request.LastTitular?.UserId,

            IsPlanned = request.IsPlanned,
            NotPlannedReason = request.NotPlannedReason,

            HierarchicalManagerId = request.HierarchicalManager.UserId,
            FunctionalManagerId = request.FunctionalManager.UserId,
            ApplicantUserId = request.ApplicantUser.UserId,
            CreatorId = request.Creator.UserId
        };
    }


    public async Task UpdateRequest(RecruitmentRequest lastRequest, RequestFormDTO data) {
        try {
            var replacementReason = await _dbCtx.ReplacementReasons.FirstOrDefaultAsync(
                r => r.Id == data.ReplacementReasonId);

            var lastTitular = await _dbCtx.Users.FirstOrDefaultAsync(l =>
                l.UserId == data.LastTitularId);

            var contract = await _dbCtx.ContractTypes.FirstOrDefaultAsync(
                c => c.ContractTypeId == data.ContractId
            );

            lastRequest.Post = data.Post;
            lastRequest.Effective = data.Effective;

            lastRequest.IsReplacement = data.IsReplacement;
            lastRequest.ReplacementReasonId = replacementReason?.Id;
            lastRequest.ReplacementDate = data.ReplacementDate;
            lastRequest.ReasonPrecision = data.ReasonPrecision;
            lastRequest.LastTitularUserId = lastTitular?.UserId;

            lastRequest.ContractTypeId = contract?.ContractTypeId;
            lastRequest.ContractPrecision = data.ContractPrecision;
            lastRequest.MonthDuration = data.MonthDuration;

            lastRequest.BeginningDate = data.BeginningDate;
            lastRequest.IsPlanned = data.IsPlanned;
            lastRequest.NotPlannedReason = data.NotPlannedReason;
            lastRequest.UpdatedAt = DateTime.UtcNow;

        // Demande de régularisation : Demandeur != Créateur
            if(data.ApplicantUserId != data.CreatorId) {
                lastRequest.ApplicantUserId = data.ApplicantUserId;
            }
        // Créateur reste inchangé
            lastRequest.CreatorId = lastRequest.CreatorId;
            
            lastRequest.FunctionalManagerId = data.FunctionalManagerId;
            lastRequest.HierarchicalManagerId = data.HierarchicalManagerId;

        // Mettre à jour les sites associés
            var existingSites = await _dbCtx.SitesRequests
                .Where(sr => sr.Request.Id == lastRequest.Id)
                .ToListAsync();

            _dbCtx.SitesRequests.RemoveRange(existingSites);

            for(int i=0; i<data.Sites.Length; i++) {
                var siteRequest = new SiteRequest
                {
                    Id = _generator.GenerateSequence("seq_id_site_request", "DMD_REC_SITE"),
                    RequestId = lastRequest.Id,
                    SiteId = data.Sites[i]
                };
                await _dbCtx.SitesRequests.AddAsync(siteRequest);
            }

            await _dbCtx.SaveChangesAsync();
        }
        catch {
            throw;
        }
    }
}

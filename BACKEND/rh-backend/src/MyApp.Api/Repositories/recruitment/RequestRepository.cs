using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using MyApp.Api.Data;
using MyApp.Api.Entities.contract;
using MyApp.Api.Entities.recruitment;
using MyApp.Api.Models.dto.recruitment;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Repositories.recruitment;

public interface IRequestRepository
{
    Task<IDbContextTransaction> BeginTransactionAsync();
    Task CommitTransactionAsync();
    Task RollbackTransactionAsync();
    Task<(List<RequestListDTO>, int)> SearchRequests(FilterRequestListDTO dto, int page, int pageSize);
    Task AddRequest(RequestFormDTO data);
}


public class RequestRepository : IRequestRepository
{
    private readonly AppDbContext _dbCtx;
    private readonly ISequenceGenerator _generator;

    public RequestRepository(AppDbContext ctx, ISequenceGenerator sqc) {
        _dbCtx = ctx; _generator = sqc;
    }

    public async Task<IDbContextTransaction> BeginTransactionAsync() {
        return await _dbCtx.Database.BeginTransactionAsync();
    }

    public async Task CommitTransactionAsync() {
        await _dbCtx.Database.CommitTransactionAsync();
    }

    public async Task RollbackTransactionAsync() {
        await _dbCtx.Database.RollbackTransactionAsync();
    }

    public async Task<(List<RequestListDTO>, int)> SearchRequests(
        FilterRequestListDTO dto, int page, int pageSize
    ) {
        var query = _dbCtx.RequestValidations.AsNoTracking()
            .Include(r => r.Status).Include(r => r.Request)
                .ThenInclude(req => req.ApplicantUser)
            .Include(r => r.Request.Contract)
            .AsQueryable();

    // --- Filtre: Post ---
        if(!string.IsNullOrWhiteSpace(dto.post)) 
            query = query.Where(r => r.Request.Post.ToLower().Contains(dto.post.ToLower()));

    // --- Filtre: Contract ---
        if(!string.IsNullOrWhiteSpace(dto.contract))
            query = query.Where(r => r.Request.Contract.ContractTypeId == dto.contract);

    // --- Filtre: Status ---
        if(!string.IsNullOrWhiteSpace(dto.status))
            query = query.Where(r => r.Status.Id == dto.status);

    // --- Filtre: Direction ---
        if(!string.IsNullOrWhiteSpace(dto.direction))
            query = query.Where(r =>
                r.Request.ApplicantUser.Department == dto.direction
            );

    // --- Filtre: Date début et Date fin ---
        if(dto.maxDate.HasValue)
            query = query.Where(r => 
                DateOnly.FromDateTime(r.Request.CreatedAt) >= dto.maxDate.Value
            );

        if(dto.minDate.HasValue)
            query = query.Where(r => 
                DateOnly.FromDateTime(r.Request.CreatedAt) <= dto.minDate.Value
            );

    // --- Compter avant la pagination ---
        int totalCount = await query.CountAsync();

    // --- Pagination + tri ---
        var list = await query
            .OrderByDescending(r => r.CreatedAt).ThenBy(r => r.Request.Post)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new RequestListDTO {
                Id = r.Request.Id,
                Post = r.Request.Post,
                Effective = r.Request.Effective,
                Contract = r.Request.Contract.Code,
                WishedDate = r.Request.BeginingDate,
                Status = r.Status.Name,
                SendingDate = DateOnly.FromDateTime(r.Request.CreatedAt)
            })
        .ToListAsync();

        return (list, totalCount);
    }


    public async Task AddRequest(RequestFormDTO data) {
        await this.BeginTransactionAsync();
        try {
            // Charger les entités liées (possible null)
            var replacementReason = data.ReplacementReasonId != null
                ? await _dbCtx.ReplacementReasons.FindAsync(data.ReplacementReasonId)
                : null;

            var lastTitular = data.LastTitularId != null
                ? await _dbCtx.Users.FindAsync(data.LastTitularId)
                : null;

            var contract = await _dbCtx.ContractTypes.FindAsync(data.ContractId)
                ?? throw new Exception("Type de contrat introuvable");

            var applicant = await _dbCtx.Users.FindAsync(data.ApplicantUserId)
                ?? throw new Exception("Utilisateur demandeur introuvable");

            var defaultStatus = await _dbCtx.RequestStatus.AsNoTracking()
                .FirstOrDefaultAsync(s => s.Id == "STT_DMD-001")
                ?? throw new Exception("Statut par défaut introuvable");

            // Construire la demande
            var request = new RecruitmentRequest
            {
                Id = _generator.GenerateSequence("seq_request_id", "DMD/REC"),
                Post = data.Post,
                Effective = data.Effective,

                IsReplacement = data.IsReplacement,
                ReplacementReason = replacementReason,
                ReplacementDate = data.ReplacementDate,
                LastTitular = lastTitular,

                Contract = contract,
                ContractPrecision = data.ContractPrecision,
                MonthDuration = data.MonthDuration,

                BeginingDate = data.BeginingDate,
                ApplicantUser = applicant,
                IsDeleted = false
            };

            var reqValidation = new RequestValidation
            {
                Id = _generator.GenerateSequence("seq_request_validation_id", "DMD/REC/VAL"),
                Status = defaultStatus,
                Request = request
            };

            await _dbCtx.RecruitmentRequests.AddAsync(request);
            await _dbCtx.RequestValidations.AddAsync(reqValidation);

            await this.CommitTransactionAsync();
        }
        catch {
            await this.RollbackTransactionAsync();
            throw;
        }
    }
}

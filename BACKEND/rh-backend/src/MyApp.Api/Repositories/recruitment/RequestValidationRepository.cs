using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.recruitment;
using MyApp.Api.Entities.users;
using MyApp.Api.Models.dto.recruitment;
using MyApp.Api.Models.dto.users;
using MyApp.Api.Repositories.users;
using MyApp.Api.Services.users;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Repositories.recruitment;

public interface IRequestValidationRepository
{
    Task<List<UserDto>> GetAllDirectorsValidator();
    Task<List<UserDto>> GetAllDirectorValidator(string requestId);
    Task<UserDto?> GetNextValidator(string requestId);
    Task<RequestStatus> GetNextValidatedStatus(RecruitmentRequest req, int validatorCount);
    Task<RecruitmentRequest> ValidateRequest(CreateRequestValidationDTO data);
    Task<bool> HasNotYetValidatedRequest(User user, RecruitmentRequest req);
    Task<(List<RequestDetailsDTO>, int)> GetAllPendedRecruitmentRequest(string validatorId, FilterRequestListDTO filters
     , int page, int pageSize);
    Task AddRequestInValidations(RecruitmentRequest req, List<UserDto> users);
    Task<List<RequestValidation>> GetAllValidations(string requestId);
    Task<List<RequestValidationDTO>> GetAllValidationsByRequest(string requestId);
}


public class RequestValidationRepository : IRequestValidationRepository
{
    private readonly AppDbContext _dbCtx;
    private readonly IUserService _userService;
    private readonly IRecruitmentRequestRepository _reqRepo;
    private readonly ISequenceGenerator _seqGenerator;

    public RequestValidationRepository(
     AppDbContext ctx, IUserService service,
     IRecruitmentRequestRepository reqRepo, ISequenceGenerator generator) {
        _dbCtx = ctx; _userService = service; _reqRepo = reqRepo;
        _seqGenerator = generator;
    }

    
    public async Task<List<UserDto>> GetAllDirectorsValidator() {
        var query = @"
            SELECT 
                u0.user_id       AS UserId,
                u0.name          AS Name,
                u0.email         AS Email,
                u0.matricule     AS Matricule,
                u0.department    AS Department,
                u0.position      AS Position,
                u0.superior_id   AS SuperiorId,
                u0.superior_name AS SuperiorName
            FROM users u0
            LEFT JOIN users u1 
                ON u0.superior_id = u1.user_id
            WHERE
                (u0.position LIKE 'Directeur%' OR u0.position LIKE 'Directrice%')
                AND u0.department IN (@p1, @p2, @p3)
                AND (
                    u1.department = @p0
                    OR (
                        u0.department = @p0
                        AND u0.superior_id IS NULL
                    )
                )
            ";

        var directors = await _dbCtx.Database.SqlQueryRaw<UserDto>(
            query, ["DGE", "DRH", "DAF", "DGE"]
        )
        .AsNoTracking()
        .ToListAsync();

        return directors;
    }


public async Task<List<UserDto>> GetAllDirectorValidator(string requestId)
{
    var validators = new List<UserDto>();

    // Ordre STRICT des directeurs
    var priorities = new Dictionary<string, int> {
        { "DRH", 1 },
        { "DAF", 2 },
        { "DGE", 3 }
    };

    // Directeurs fixes (DRH / DAF / DGE)
    var directors = await GetAllDirectorsValidator();

    // Hiérarchique de la demande
    var hierarchicalMg = await _dbCtx.RecruitmentRequests
        .AsNoTracking()
        .Where(r => r.Id == requestId)
        .Select(r => r.HierarchicalManager)
        .FirstOrDefaultAsync()
        ?? throw new ArgumentException("Demandeur introuvable");

    // Supérieur du hiérarchique (N+1)
    var superior = await _userService.GetSuperiorAsync(hierarchicalMg.Matricule);

    // Le hiérarchique est-il directeur ?
    bool hierarchicalIsDirector =
        directors.Any(d => d.Matricule == hierarchicalMg.Matricule);

    // Le supérieur du hiérarchique est-il directeur ?
    bool superiorIsDirector =
        superior != null &&
        directors.Any(d => d.Matricule == superior.Matricule);

    // 1. Ajouter le supérieur UNIQUEMENT si autorisé
    if (superior != null && !hierarchicalIsDirector && !superiorIsDirector) {
        validators.Add(superior);
    }

    // 2. Directeur de tutelle (AVANT les directeurs fixes)
    var tutelleDirector = await _userService
        .GetDirecteurTutelleAsync(hierarchicalMg.Matricule);

    if (tutelleDirector != null) {
        if (!priorities.ContainsKey(tutelleDirector.Department!)) {
            if (!validators.Any(v => v.UserId == tutelleDirector.UserId)) {
                validators.Add(new UserDto {
                    UserId = tutelleDirector.UserId,
                    Name = tutelleDirector.Name,
                    Email = tutelleDirector.Email,
                    Matricule = tutelleDirector.Matricule,
                    Department = tutelleDirector.Department,
                    Position = tutelleDirector.Position
                });
            }
        }
    }

    // 🔹 3. Directeurs fixes dans l’ordre DRH → DAF → DGE
    foreach (var dept in priorities.OrderBy(p => p.Value).Select(p => p.Key))
    {
        var director = directors.FirstOrDefault(d => d.Department == dept);

        if (director != null && !validators.Any(v => v.UserId == director.UserId))
        {
            validators.Add(director);
        }
    }

    return validators;
}


    public async Task<UserDto?> GetNextValidator(string requestId) {
        var request = await _dbCtx.RequestsPerValidators
            .Include(r => r.Validator)
            .Where(r => 
                r.RequestId==requestId && r.IsValidated==false)
            .FirstOrDefaultAsync();

        if(request==null) return null;

        var validator = new UserDto {
            UserId = request.Validator.UserId,
            Name = request.Validator.Name,
            Email = request.Validator.Email,
            Matricule = request.Validator.Matricule,
            Position = request.Validator.Position,
            SuperiorId = request.Validator.SuperiorId,
            SuperiorName = request.Validator.SuperiorName,
        };
        return validator;
    }


    public async Task<RequestStatus> GetNextValidatedStatus(
        RecruitmentRequest req, int validatorCount
    ) {
    // Prendre le niveau de validation
        var requestDetails = await _reqRepo.GetRequestDetails(req.Id);
        int validationLevel = requestDetails.ValidationLevel;

    // Prendre les statuts
        List<RequestStatus> statuses = await _dbCtx.RequestStatuses
            .AsNoTracking().ToListAsync();
        
    // Validée
        if(validatorCount==3 && validationLevel==2) return statuses[2];
        else if(validatorCount==4 && validationLevel==3) return statuses[2];
        else if(validatorCount==validationLevel) return statuses[2];
        
    // En cours
        else return statuses[1];
    }


    public async Task<bool> HasNotYetValidatedRequest(User user, RecruitmentRequest req) {
        var hasValidated = await _dbCtx.RequestValidations
            .AnyAsync(r =>
                r.Request.Id == req.Id &&
                r.Validator.UserId == user.UserId &&
                r.Status.Id != "STD_001"
            );

        return !hasValidated;
    }


    public async Task<RecruitmentRequest> ValidateRequest(CreateRequestValidationDTO data) {
        RequestStatus? newStatus = null;

        var userValidator = await _dbCtx.Users.FindAsync(data.ValidatorId)
            ?? throw new ArgumentException("Validateur introuvable");

        var request = await _dbCtx.RecruitmentRequests
            .Include(r => r.ApplicantUser)
            .FirstOrDefaultAsync(r => r.Id == data.RequestId)
            ?? throw new ArgumentException("Demande introuvable");

    // Vérifier l'accès sur la validation
        List<UserDto> validators = await this.GetAllDirectorValidator(request.Id);
        bool canValidate = validators.Any(v => v.UserId == userValidator.UserId);
        if(!canValidate)
            throw new ArgumentException("Utilisateur non accordé pour valider");

    // Vérification de l'utilisateur
        bool notYetValidated = await this.HasNotYetValidatedRequest(userValidator, request);
        if(!notYetValidated) 
            throw new ArgumentException("Demande déjà validée par le même utilisateur");

    // Traitement des statuts
        if (data.Status.Equals("Approuver", StringComparison.OrdinalIgnoreCase)) {
            newStatus = await this.GetNextValidatedStatus(request, validators.Count);
        }
        else if (data.Status.Equals("Refuser", StringComparison.OrdinalIgnoreCase)) {
            if (string.IsNullOrWhiteSpace(data.Comments))
                throw new ArgumentException("Commentaires obligatoires pour un refus");
            
            newStatus = await _dbCtx.RequestStatuses.FindAsync("STD_004")
                ?? throw new ArgumentException("Statut de demande introuvable");
        }
        else throw new ArgumentException("Décision inconnue");

        RequestValidation validation = new RequestValidation {
            Id = _seqGenerator.GenerateSequence("seq_request_validation_id", "DMD_REC_VAL"),
            Comments = data.Comments,
            RequestId = request.Id,
            StatusId = newStatus.Id,  
            ValidatorId = userValidator.UserId,
        };

    // Modification de la validation
        var req = await _dbCtx.RequestsPerValidators
            .FirstOrDefaultAsync(r => 
                r.Validator == userValidator && r.Request == request
            );

        if(req != null) req.IsValidated = true;

        await _dbCtx.RequestValidations.AddAsync(validation);
        await _dbCtx.SaveChangesAsync();

        return request;
    }


    public async Task<(List<RequestDetailsDTO>, int)> GetAllPendedRecruitmentRequest(
        string validatorId,
        FilterRequestListDTO filters,
        int page, int pageSize
    ) {
        // Vérifier l'existence du validateur
        if (!await _dbCtx.Users.AsNoTracking().AnyAsync(u => u.UserId == validatorId))
            throw new ArgumentException("Validateur introuvable");

        // Récupérer les IDs des demandes en attente via la TVF
        var baseQuery = _dbCtx.PendedRequestToValidates
            .FromSqlRaw(
                "SELECT * FROM dbo.fn_pending_recruitment_requests(@validator_id)",
                new SqlParameter("@validator_id", validatorId)
            )
            .AsNoTracking();

        var requestIdsQuery =
            from pr in baseQuery
            join r in _dbCtx.RecruitmentRequests on pr.RequestId equals r.Id
            where !r.IsDeleted && r.LastStatus != "Refusée"
            select r.Id;

        // Appliquer les filtres scalaires
        if (!string.IsNullOrWhiteSpace(filters.contract))
            requestIdsQuery = requestIdsQuery.Where(id =>
                _dbCtx.RecruitmentRequests.Any(r =>
                    r.Id == id &&
                    r.Contract != null &&
                    r.Contract.Code.ToUpper() == filters.contract.ToUpper()));

        if (!string.IsNullOrWhiteSpace(filters.post))
            requestIdsQuery = requestIdsQuery.Where(id =>
                _dbCtx.RecruitmentRequests.Any(r =>
                    r.Id == id &&
                    r.Post != null &&
                    r.Post.ToUpper().Contains(filters.post.ToUpper())));

        if (!string.IsNullOrWhiteSpace(filters.direction))
            requestIdsQuery = requestIdsQuery.Where(id =>
                _dbCtx.RecruitmentRequests.Any(r =>
                    r.Id == id &&
                    r.ApplicantUser.Department != null &&
                    r.ApplicantUser.Department.ToUpper() == filters.direction.ToUpper()));

        if (filters.minDate.HasValue)
            requestIdsQuery = requestIdsQuery.Where(id =>
                _dbCtx.RecruitmentRequests
                    .Where(r => r.Id == id)
                    .Select(r => r.CreatedAt)
                    .FirstOrDefault() >= filters.minDate.Value.ToDateTime(TimeOnly.MinValue));

        if (filters.maxDate.HasValue)
            requestIdsQuery = requestIdsQuery.Where(id =>
                _dbCtx.RecruitmentRequests
                    .Where(r => r.Id == id)
                    .Select(r => r.CreatedAt)
                    .FirstOrDefault() <= filters.maxDate.Value.ToDateTime(TimeOnly.MaxValue));

        int totalCount = await requestIdsQuery.CountAsync();
        var pageIds = await requestIdsQuery
            .OrderByDescending(id =>
                _dbCtx.RecruitmentRequests
                    .Where(r => r.Id == id)
                    .Select(r => r.BeginningDate)
                    .FirstOrDefault())
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var pagedRequests = await _dbCtx.RecruitmentRequests
            .Where(r => pageIds.Contains(r.Id))
            .Include(r => r.HierarchicalManager)
            .Include(r => r.Contract)
            .Include(r => r.SitesRequests)
                .ThenInclude(sr => sr.Site)
            .AsNoTracking()
            .Select(r => new RequestDetailsDTO
            {
                Id = r.Id,
                HierarchicalManager = r.HierarchicalManager.Name ?? "",
                FunctionalManager = r.FunctionalManager.Name ?? "",
                ApplicantUser = r.ApplicantUser.Name ?? "",
                Creator = r.Creator.Name ?? "",
                Direction = r.Creator.Department ?? "",
                Status = r.LastStatus,
                Sites = r.SitesRequests.Select(sr => sr.Site.SiteName).ToArray(),
                Contract = r.Contract != null ? r.Contract.Code : r.ContractPrecision,
                BeginningDate = r.BeginningDate,
                ValidationLevel = _dbCtx.RequestsPerValidators
                    .Count(v => v.Request.Id == r.Id && v.IsValidated),
                IsPlanned = r.IsPlanned,
                NotPlannedReason = r.NotPlannedReason,
                SendingDate = r.CreatedAt
            })
            .ToListAsync();

        return (pagedRequests, totalCount);
    }


    public async Task AddRequestInValidations(RecruitmentRequest req, List<UserDto> users) {
        var requests = new List<RequestsPerValidator>();

        foreach (var userDto in users) {
            var user = await _userService.GetByIdAsync(userDto.UserId) 
                ?? throw new ArgumentException("Utilisateur non trouvé");

            requests.Add(new RequestsPerValidator 
            {
                Id = _seqGenerator.GenerateSequence("seq_requests_per_validator_id", "DMD_PVLD"),
                ValidatorId = user.UserId,
                RequestId = req.Id, 
                IsValidated = false
            });
        }
        await _dbCtx.RequestsPerValidators.AddRangeAsync(requests);
    }


    public async Task<List<RequestValidation>> GetAllValidations(string requestId) {
        var request = await _reqRepo.GetRecruitmentRequestById(requestId);

        return await _dbCtx.RequestValidations
            .Include(r => r.Validator)
            .Include(r => r.Status)
            .Where(r => r.RequestId.Equals(requestId))
            .AsNoTracking()
            .ToListAsync();
    }


    public async Task<List<RequestValidationDTO>> GetAllValidationsByRequest(string requestId) {
        return await (
            from rpv in _dbCtx.RequestsPerValidators
            join rv in _dbCtx.RequestValidations
                on new { rpv.RequestId, rpv.ValidatorId }
                equals new { rv.RequestId, rv.ValidatorId }
                into validations
            from rv in validations.DefaultIfEmpty() // 🔥 LEFT JOIN
            where rpv.RequestId == requestId
            select new RequestValidationDTO
            {
                Direction = rpv.Validator.Department ?? "",
                ValidatorId = rpv.ValidatorId,
                Validator = rpv.Validator.Name,
                ValidatedAt = rv.CreatedAt,
                Status = rv.Status.Name
            }
        )
        .AsNoTracking()
        .ToListAsync();
    }

}

// userId-DRH : 00182 : 002b1f12-e8c5-4a30-81ca-e8532855de71
// userId-DGE : 00431 : ec738732-6e94-4288-be4a-c098408d199d

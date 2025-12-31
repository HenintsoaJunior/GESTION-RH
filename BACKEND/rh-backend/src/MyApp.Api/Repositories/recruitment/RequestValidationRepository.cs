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
    Task<RequestStatus> GetNextValidatedStatus(RecruitmentRequest req, int validatorCount);
    Task DoValidationForRequest(CreateRequestValidationDTO data);
    Task<bool> HasNotYetValidatedRequest(User user, RecruitmentRequest req);
    Task<(List<RequestDetailsDTO>, int)> GetAllPendedRecruitmentRequest(string validatorId, FilterRequestListDTO filters, int page, int pageSize);
    Task AddRequestInValidations(RecruitmentRequest req, List<UserDto> users);
    Task<List<RequestValidation>> GetAllValidation(string requestId);
}


public class RequestValidationRepository : IRequestValidationRepository
{
    private readonly AppDbContext _dbCtx;
    private readonly IUserService _userService;
    private readonly IRequestRepository _reqRepo;
    private readonly ISequenceGenerator _seqGenerator;

    public RequestValidationRepository(
     AppDbContext ctx, IUserService service,
     IRequestRepository reqRepo, ISequenceGenerator generator) {
        _dbCtx = ctx; _userService = service; _reqRepo = reqRepo;
        _seqGenerator = generator;
    }

    
    public async Task<List<UserDto>> GetAllDirectorsValidator() {
        var query = @"
            SELECT 
                user_id       AS UserId,
                name          AS Name,
                email         AS Email,
                matricule     AS Matricule,
                department    AS Department,
                position      AS Position,
                superior_id   AS SuperiorId,
                superior_name AS SuperiorName
            FROM users
            WHERE (position LIKE 'Directeur%' OR position LIKE 'Directrice%')
            AND (department = @p0 OR department = @p1 OR department = @p2)";

        var directors = await _dbCtx.Database.SqlQueryRaw<UserDto>(
            query, ["DAF", "DRH", "DGE"]
        )
        .AsNoTracking()
        .ToListAsync();

        return directors;
    }


    public async Task<List<UserDto>> GetAllDirectorValidator(string requestId) {
        List<UserDto> validators = new List<UserDto>();
    // Directeurs fixes
        List<UserDto> directors = await GetAllDirectorsValidator();
    
    // Directeur tutelle
        var requestor = await _dbCtx.RecruitmentRequests
            .AsNoTracking()
            .Where(r => r.Id == requestId)
            .Select(r => r.ApplicantUser)
            .FirstOrDefaultAsync() ?? throw new ArgumentException("Demandeur introuvable"); 
        
        var tutelleDirector = await _userService.GetDirecteurTutelleAsync(requestor.Matricule)
            ?? throw new ArgumentException("Directeur de tutelle introuvable");
        var tutelleDirectorDto = new UserDto {
            UserId = tutelleDirector.UserId,
            Name = tutelleDirector.Name,
            Email = tutelleDirector.Email,
            Matricule = tutelleDirector.Matricule,
            Department = tutelleDirector.Department,
            Position = tutelleDirector.Position,
            SuperiorId = tutelleDirector.SuperiorId,
            SuperiorName = tutelleDirector.SuperiorName
        };

    // Premier validateur
        validators.Add(tutelleDirectorDto);

    // Les autres validateurs
        var order = new[] { "DAF", "DRH", "DGE" };

        foreach(var dept in order) {
            var dir = directors.FirstOrDefault(d => d.Department == dept);

            if (dir != null && dir.Department != tutelleDirectorDto.Department) {
                validators.Add(dir);
            }
        }
        
        return validators;
    }


    public async Task<RequestStatus> GetNextValidatedStatus(
        RecruitmentRequest req, int validatorCount
    ) {
    // Prendre le niveau de validation
        var requestDetails = await _reqRepo.GetRequestDetails(req.Id);
        int validationLevel = requestDetails.ValidationLevel;

    // Prendre les statuts
        List<RequestStatus> statuses = await _dbCtx.RequestStatuses.AsNoTracking()
            .ToListAsync();
        
    // Validée
        if(validatorCount==3 && validationLevel==2) return statuses[2];
        else if(validatorCount==4 && validationLevel==3) return statuses[2]; 
        
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


    public async Task DoValidationForRequest(CreateRequestValidationDTO data) {
        byte[]? signatureBytes = null; 
        RequestStatus? newStatus = null;

        var userValidator = await _dbCtx.Users.FindAsync(data.ValidatorId)
            ?? throw new ArgumentException("Validateur introuvable");

        var request = await _dbCtx.RecruitmentRequests.FindAsync(data.RequestId)
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
            if (string.IsNullOrWhiteSpace(data.Signature))
                throw new ArgumentException("Signature obligatoire pour approuver la demande");

            var base64Data = data.Signature.Contains(',') 
                ? data.Signature.Split(',')[1] 
                : data.Signature;

            signatureBytes = Convert.FromBase64String(base64Data);

        // Renvoie un RequestStatus existant
            newStatus = await this.GetNextValidatedStatus(request, validators.Count);
        }
        else if (data.Status.Equals("Refuser", StringComparison.OrdinalIgnoreCase)) {
            if (string.IsNullOrWhiteSpace(data.Comments))
                throw new ArgumentException("Commentaires obligatoires pour un refus");
            
            newStatus = await _dbCtx.RequestStatuses.FindAsync("STD_004")
                ?? throw new ArgumentException("Statut de demande introuvable");
        }
        else throw new ArgumentException("Décision inconnue");

        _dbCtx.Attach(newStatus);
        RequestValidation validation = new RequestValidation {
            Id = _seqGenerator.GenerateSequence("seq_request_validation_id", "DMD_REC_VAL"),
            Comments = data.Comments,
            Request = request,
            Signature = signatureBytes,
            Status = newStatus,  
            Validator = userValidator,
        };

    // Modification de la validation
        var req = await _dbCtx.RequestsPerValidators
            .FirstOrDefaultAsync(r => 
                r.Validator == userValidator &&  r.Request == request
            );

        if(req != null) req.IsValidated = true;

        await _dbCtx.RequestValidations.AddAsync(validation);
        await _dbCtx.SaveChangesAsync();
    }


   public async Task<(List<RequestDetailsDTO>, int)> GetAllPendedRecruitmentRequest(
        string validatorId,
        FilterRequestListDTO filters,
        int page,
        int pageSize)
    {
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
            .Include(r => r.ApplicantUser)
            .Include(r => r.Contract)
            .Include(r => r.SitesRequests)
                .ThenInclude(sr => sr.Site)
            .AsNoTracking()
            .Select(r => new RequestDetailsDTO
            {
                Id = r.Id,
                ApplicantUser = r.ApplicantUser.Name ?? "",
                Status = r.LastStatus,
                Sites = r.SitesRequests.Select(sr => sr.Site.SiteName).ToArray(),
                Contract = r.Contract != null ? r.Contract.Code : null,
                BeginningDate = r.BeginningDate,
                ValidationLevel = _dbCtx.RequestsPerValidators
                    .Count(v => v.Request.Id == r.Id && v.IsValidated),
                IsPlanned = r.IsPlanned,
                NotPlannedReason = r.NotPlannedReason
            })
            .ToListAsync();

        return (pagedRequests, totalCount);
    }


    public async Task AddRequestInValidations(RecruitmentRequest req, List<UserDto> users) {
        var requests = new List<RequestsPerValidator>();

        foreach (var userDto in users) {
            var user = await _userService.GetByIdAsync(userDto.UserId) 
                    ?? throw new ArgumentException("Utilisateur non trouvé");

            _dbCtx.Users.Attach(user);
            requests.Add(
             new RequestsPerValidator {
                Id = _seqGenerator.GenerateSequence("seq_requests_per_validator_id", "DMD_PVLD"),
                Validator = user,
                Request = req, IsValidated = false
            });
        }
        await _dbCtx.RequestsPerValidators.AddRangeAsync(requests);
    }


    public async Task<List<RequestValidation>> GetAllValidation(string requestId) {
        var request = await _reqRepo.GetRecruitmentRequestById(requestId);

        return await _dbCtx.RequestValidations.Include(r => r.Validator)
            .Where(r => 
                r.Signature!=null && r.Request == request)
            .AsNoTracking().ToListAsync();
    }
}

// userId-DAF : 00425 : 11715a63-e237-46b3-b568-ffa6fc087000
// userId-DRH : 00182 : 002b1f12-e8c5-4a30-81ca-e8532855de71
// userId-DGE : 00431 : ec738732-6e94-4288-be4a-c098408d199d

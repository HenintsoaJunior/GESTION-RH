using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.recruitment;
using MyApp.Api.Models.dto.recruitment;
using MyApp.Api.Models.dto.users;
using MyApp.Api.Services.users;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Repositories.recruitment;

public interface IRequestValidationRepository
{
    Task<List<UserDto>> GetAllDirectorsValidator();
    Task<List<UserDto>> GetAllDirectorValidator(string requestId);
    Task<RequestStatus> GetNextValidatedStatus(RecruitmentRequest req, int validatorCount);
    Task DoValidationForRequest(CreateRequestValidationDTO data);
}

public class RequestValidationRepository : IRequestValidationRepository
{
    private readonly AppDbContext _dbCtx;
    private readonly IUserService _userService;
    private readonly IRequestRepository _reqRepo;
    private readonly ISequenceGenerator _seqGenerator;

    public RequestValidationRepository(AppDbContext ctx, IUserService service,
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


    public async Task DoValidationForRequest(CreateRequestValidationDTO data) {
        byte[]? signatureBytes = null; 
        RequestStatus? newStatus = null;   // On ne crée plus l'entité

        var userValidator = await _dbCtx.Users.FindAsync(data.ValidatorId)
            ?? throw new ArgumentException("Validateur introuvable");

        var request = await _dbCtx.RecruitmentRequests.FindAsync(data.RequestId)
            ?? throw new ArgumentException("Demande introuvable");

    // Vérifier l'accès sur la validation
        List<UserDto> validators = await this.GetAllDirectorValidator(request.Id);
        bool canValidate = validators.Any(v => v.UserId == userValidator.UserId);

        if (!canValidate)
            throw new ArgumentException("Utilisateur non accordé pour valider");

    // Traitement des statuts
        if (data.Status.Equals("Approuver", StringComparison.OrdinalIgnoreCase)) {
            if (string.IsNullOrWhiteSpace(data.Signature))
                throw new ArgumentException("Signature obligatoire pour approuver la demande");

            var base64Data = data.Signature.Contains(',') 
                ? data.Signature.Split(',')[1] 
                : data.Signature;

            signatureBytes = Convert.FromBase64String(base64Data);

        // renvoie un RequestStatus existant
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
        RequestValidation validation = new RequestValidation 
        {
            Id = _seqGenerator.GenerateSequence("seq_request_validation_id", "DMD_REC_VAL"),
            Comments = data.Comments,
            Request = request,
            Signature = signatureBytes,
            Status = newStatus,   // toujours un statut existant
            Validator = userValidator,
        };

        await _dbCtx.RequestValidations.AddAsync(validation);
        await _dbCtx.SaveChangesAsync();
    }

}

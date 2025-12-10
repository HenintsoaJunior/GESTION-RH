using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Models.dto.recruitment;
using MyApp.Api.Models.dto.users;
using MyApp.Api.Services.users;

namespace MyApp.Api.Repositories.recruitment;

public interface IRequestValidationRepository
{
    Task<List<UserDto>> GetAllDirectorsValidator();
    Task<List<UserDto>> GetAllDirectorValidator(string requestId);
    Task DoValidationForRequest(CreateRequestValidationDTO data);
}

public class RequestValidationRepository : IRequestValidationRepository
{
    private readonly AppDbContext _dbCtx;
    private readonly IUserService _userService;

    public RequestValidationRepository(AppDbContext ctx, IUserService service) {
        _dbCtx = ctx; _userService = service;
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

        foreach (var dept in order) {
            var dir = directors.FirstOrDefault(d => d.Department == dept);

            if (dir != null && dir.Department != tutelleDirectorDto.Department) {
                validators.Add(dir);
            }
        }
        
        return validators;
    }


    public async Task DoValidationForRequest(CreateRequestValidationDTO data) {
        // byte[]? signatureBytes = null;

        // if (data.Status.Equals("Approuver", StringComparison.OrdinalIgnoreCase))
        // {
        //     if (string.IsNullOrWhiteSpace(data.Signature))
        //         throw new ArgumentException("Signature obligatoire pour approuver la demande");

        //     // Enlever le préfixe data:image/png;base64, si présent
        //     var base64Data = data.Signature.Contains(",") 
        //         ? data.Signature.Split(',')[1] 
        //         : data.Signature;

        //     signatureBytes = Convert.FromBase64String(base64Data);
        // }
        // else if (data.Status.Equals("Refuser", StringComparison.OrdinalIgnoreCase))
        // {
        //     if (string.IsNullOrWhiteSpace(data.Comments))
        //         throw new ArgumentException("Commentaires obligatoires pour un refus");
        // }
    }
}

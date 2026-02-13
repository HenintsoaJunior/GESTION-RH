using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.recruitment;
using MyApp.Api.Entities.users;
using MyApp.Api.Models.dto.recruitment;
using MyApp.Api.Models.dto.users;
using MyApp.Api.Repositories.users;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Repositories.recruitment;

public interface IJobDescriptionValidationRepository
{
    Task<List<UserDto>> GetAllJobDescriptionValidators();
    Task<List<JobDescriptionValidationDetailsDTO>> GetAllValidationsByRequestId(string requestId);
    Task<JobDescription> ValidateJobDescription(JobDescriptionValidationDTO data);
    Task<bool> HasNotYetValidatedJobDescription(User user, JobDescription jobDesc);
}


public class JobDescriptionValidationRepository(AppDbContext ctx, 
ISequenceGenerator seq, IRoleHabilitationRepository repo1
) : IJobDescriptionValidationRepository
{
    private readonly AppDbContext _dbCtx = ctx;
    private readonly ISequenceGenerator _seqGenerator = seq;
    private readonly IRoleHabilitationRepository _roleHabRepo = repo1;


    public async Task<bool> HasNotYetValidatedJobDescription(User user, JobDescription jobDesc) {
        var hasValidated = await _dbCtx.JobDescriptionValidations
            .AnyAsync(j =>
                j.Id == jobDesc.Id &&j.ValidatorId == user.UserId &&
                j.Status.Id != "STF_001"
            );

        return !hasValidated;
    }


    public async Task<JobDescription> ValidateJobDescription(JobDescriptionValidationDTO data) {
        var userValidator = await _dbCtx.Users.FindAsync(data.ValidatorId)
            ?? throw new ArgumentException("Validateur introuvable");

        var jobDescription = await _dbCtx.JobDescriptions
            .Include(j => j.Request)
                .ThenInclude(r => r.ApplicantUser)
            .FirstOrDefaultAsync(j => j.Id==data.JobDescId)
            ?? throw new ArgumentException("TDR introuvable");

    // Vérifier l'accès sur la validation
        IEnumerable<Habilitation> habilitations = await _roleHabRepo
            .GetHabilitationsByUserIdAsync(data.ValidatorId);
        bool canValidate = habilitations.Any(h => h.Label == "Valider TDR");
        if(!canValidate)
            throw new ArgumentException("Utilisateur non accordé pour valider");

    // Vérification de l'utilisateur
        bool notYetValidated = await this.HasNotYetValidatedJobDescription(userValidator, jobDescription);
        if(!notYetValidated) 
            throw new ArgumentException("TDR déjà validée par le même utilisateur");

        JobDescriptionValidation validation = new() {
            Id = _seqGenerator.GenerateSequence("seq_job_validation_id", "VAL_TDR"),
            JobDescriptionId = jobDescription.Id,
            StatusId = "STF_002",  
            ValidatorId = userValidator.UserId,
        };

    // MAJ du statut en accès rapide
        jobDescription.LastStatus = "Validée";

        await _dbCtx.JobDescriptionValidations.AddAsync(validation);
        await _dbCtx.SaveChangesAsync();

        return jobDescription;
    }


    public async Task<List<UserDto>> GetAllJobDescriptionValidators() {
        const string habilitationName = "Valider TDR";

        var users = await (
            from u in _dbCtx.Users
            join ur in _dbCtx.UserRoles on u.UserId 
                equals ur.UserId
            join rh in _dbCtx.RoleHabilitations on ur.RoleId 
                equals rh.RoleId
            join h in _dbCtx.Habilitations on rh.HabilitationId 
                equals h.HabilitationId
            where h.Label == habilitationName
            select new UserDto {
                UserId = u.UserId, Name = u.Name,
                Email = u.Email, Matricule = u.Matricule,
                Position = u.Position
            }
        ).Distinct().ToListAsync();

        return users;
    }


    public async Task<List<JobDescriptionValidationDetailsDTO>> GetAllValidationsByRequestId(string requestId) {
        var validations = await (
            from jv in _dbCtx.JobDescriptionValidations
            join u in _dbCtx.Users on jv.ValidatorId equals u.UserId
            join j in _dbCtx.JobDescriptions on jv.JobDescriptionId equals j.Id
            where j.RequestId == requestId
            select new JobDescriptionValidationDetailsDTO {
                Direction = u.Department ?? "N/A",
                Validator = u.Name,
                ValidatorId = u.UserId,
                ValidatedAt = jv.CreatedAt,
                Status = j.LastStatus
            }
        ).OrderBy(v => v.ValidatedAt)
        .Skip(1)
        .ToListAsync();

        return validations;
    }
}

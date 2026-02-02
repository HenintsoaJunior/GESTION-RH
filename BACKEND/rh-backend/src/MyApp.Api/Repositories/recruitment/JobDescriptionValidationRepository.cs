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
    Task<List<UserDto>> GetAllValidators(string jobDescId);
    Task<JobDescription> ValidateJobDescription(JobDescriptionValidationDTO data);
    Task<bool> HasNotYetValidatedJobDescription(User user, JobDescription jobDesc);
}


public class JobDescriptionValidationRepository(AppDbContext ctx, 
UserHabilitationRepository repo1, ISequenceGenerator seq) : IJobDescriptionValidationRepository
{
    private readonly AppDbContext _dbCtx = ctx;
    private readonly UserHabilitationRepository _uHabRepo = repo1;
    private readonly ISequenceGenerator _seqGenerator = seq;


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
            .FirstOrDefaultAsync(j => j.Id==data.JobDescId)
            ?? throw new ArgumentException("TDR introuvable");

    // Vérifier l'accès sur la validation
        IEnumerable<Habilitation> habilitations = await _uHabRepo
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
            StatusId = "STF_002",  
            ValidatorId = userValidator.UserId,
        };

        await _dbCtx.JobDescriptionValidations.AddAsync(validation);
        await _dbCtx.SaveChangesAsync();

        return jobDescription;
    }


    public async Task<List<UserDto>> GetAllValidators(string jobDescId) {
        var validators = new List<UserDto>();

        return validators;
    }
}

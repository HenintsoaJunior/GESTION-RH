using Hangfire.Common;
using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.recruitment;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Repositories.recruitment;

public interface IJobDescriptionRepository
{
// CRUD educations
    Task<List<Education>> GetAllEducations(string? name, int page, int pageSize);
    Task<Education> GetEducationById(string id);
    Task AddEducation(Education education);
    Task DeleteEducation(Education education);
    Task UpdateEducation(Education last, Education newEducation);

// CRUD TDR ou fiche de poste
    Task AddJobDescription(JobDescription job);

    Task AddFormation(Formation param);
    Task<List<Formation>> GetAllFormations();

    Task AddJobDescriptionSuitability(JobDescriptionSuitability job);

    Task AddSkill(Skill param);
}


public class JobDescriptionRepository(AppDbContext ctx, ISequenceGenerator seq) : IJobDescriptionRepository
{
    private readonly AppDbContext _dbCtx = ctx;
    private readonly ISequenceGenerator _seq = seq;

    public async Task<Education> GetEducationById(string id) {
        var education = await _dbCtx.Educations.FindAsync(id) 
         ?? throw new ArgumentException("Etude introuvable");

        return education;
    }

    public async Task<List<Education>> GetAllEducations(string? name, 
     int page, int pageSize) {
        var query = _dbCtx.Educations
            .AsNoTracking().Where(e => !e.IsDeleted);

        if(page < 1) page = 1;
        if(pageSize < 1) pageSize = 10;

    // Filtrage insensible à la casse
        if(!string.IsNullOrWhiteSpace(name)) {
            string lowerName = name.ToLower();
            query = query.Where(e => e.Name.ToLower().Contains(lowerName));
        }

    // Pagination
        var paged = await query.OrderBy(e => e.Name) 
            .Skip((page-1) * pageSize).Take(pageSize)
            .ToListAsync();

        return paged;
    }


    public async Task AddEducation(Education education) {
        education.Id = _seq.GenerateSequence("seq_education_id", "ETD");

        await _dbCtx.Educations.AddAsync(education);
        await _dbCtx.SaveChangesAsync();
    }

    public async Task DeleteEducation(Education education) {
        education.IsDeleted = true;
        await _dbCtx.SaveChangesAsync();
    }

    public async Task UpdateEducation(Education last, Education newEducation) {
        last.Name = newEducation.Name;
        last.IsDeleted = false;
        await _dbCtx.SaveChangesAsync();
    }


    public async Task AddJobDescription(JobDescription job) {
        job.Id = _seq.GenerateSequence("seq_job_description_id", "TDR_NUM");

        await _dbCtx.JobDescriptions.AddAsync(job);
        await _dbCtx.SaveChangesAsync();
    }

    public async Task AddFormation(Formation param) {
        param.Id = _seq.GenerateSequence("seq_formation_id", "FRT");

        await _dbCtx.Formations.AddAsync(param);
        await _dbCtx.SaveChangesAsync();
    }

    public async Task AddJobDescriptionSuitability(JobDescriptionSuitability job) {
        job.Id = _seq.GenerateSequence("seq_job_suitability_id", "FCH_QLT");

        await _dbCtx.JobDescriptionSuitabilities.AddAsync(job);
        await _dbCtx.SaveChangesAsync();
    }

    public async Task AddSkill(Skill param) {
        param.Id = _seq.GenerateSequence("seq_skill_id", "CMC");

        await _dbCtx.Skills.AddAsync(param);
        await _dbCtx.SaveChangesAsync();
    }


    public async Task<List<Formation>> GetAllFormations() {
        return await _dbCtx.Formations.AsNoTracking().ToListAsync();
    }
}

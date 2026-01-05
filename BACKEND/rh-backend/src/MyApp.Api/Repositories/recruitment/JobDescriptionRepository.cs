using Hangfire.Common;
using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.recruitment;
using MyApp.Api.Models.dto.recruitment;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Repositories.recruitment;

public interface IJobDescriptionRepository
{
// CRUD educations
    Task<List<Education>> GetAllEducations(string? name, int page, int pageSize);
    Task<List<Education>> GetAllEducations();
    Task<Education> GetEducationById(string id);
    Task AddEducation(Education education);
    Task DeleteEducation(Education education);
    Task UpdateEducation(Education last, Education newEducation);

// Fiche de poste
    Task AddJobDescription(JobDescription job);
    Task<JobDescription> GetJobDescriptionById(string id);
    Task<JobDescription?> GetJobDescriptionByRequest(RecruitmentRequest req);

    Task AddJobAttribution(Attribution param);
    Task AddFormation(Formation param);
    Task<List<Formation>> GetAllFormations();

    Task AddSoftSkill(SoftSkill param);
    Task<List<SoftSkill>> GetAllSoftSkills();
    Task<SoftSkill> GetSoftSkillById(string id);
    Task AddJobDescriptionSoftSkill(JobDescriptionSoftSkill job);

    Task AddSkill(Skill param);
    Task AddExperience(Experience param);

    Task<LevelEducation> GetLevelEducationById(string id);
    Task<List<LevelEducation>> GetAllLevelEducations();
    void Attach<TEntity>(TEntity entity) where TEntity : class;
    Task<bool> EducationExistsByLabel(string label);
    Task<bool> SoftSkillExistsByLabel(string label);
    Task UpdateJobDescription(JobDescription last, JobDescription newJob);

// Commit de transaction
    Task SaveChangesAsync();

    void RemoveAttributions(IEnumerable<Attribution> items);
    void RemoveFormations(IEnumerable<Formation> items);
    void RemoveExperiences(IEnumerable<Experience> items);
    void RemoveSoftSkills(IEnumerable<JobDescriptionSoftSkill> items);
    void RemoveSkills(IEnumerable<Skill> items);
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
            .Skip((page-1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return paged;
    }

    public async Task<List<Education>> GetAllEducations() {
        var results = await _dbCtx.Educations
            .AsNoTracking().Where(e => !e.IsDeleted).ToListAsync();

        return results;
    }


    public async Task<bool> EducationExistsByLabel(string label) {
        return await _dbCtx.Educations.AnyAsync(e => 
            e.Name.ToLower().Equals(label.ToLower())
        );
    }

    public async Task<bool> SoftSkillExistsByLabel(string label) {
        return await _dbCtx.SoftSkills.AnyAsync(e => 
            e.Name.ToLower().Equals(label.ToLower())
        );
    }


    public Task DeleteEducation(Education education) {
        education.IsDeleted = true;
        return Task.CompletedTask;
    }

    public async Task UpdateEducation(Education last, Education newEducation) {
        last.Name = newEducation.Name;
        last.IsDeleted = false;
    }


    public async Task AddJobDescription(JobDescription job) {
        job.Id = _seq.GenerateSequence("seq_job_description_id", "TDR_NUM");
        await _dbCtx.JobDescriptions.AddAsync(job);
    }

    public async Task<JobDescription> GetJobDescriptionById(string id) {
        var result = await _dbCtx.JobDescriptions
            .Include(r => r.Attributions)
            .Include(r => r.Formations)
                .ThenInclude(f => f.Education)
            .Include(r => r.Formations)
                .ThenInclude(f => f.LevelEducation)
            .Include(r => r.Experiences)
            .Include(r => r.SoftSkills).ThenInclude(s => s.SoftSkill)
            .Include(r => r.Skills)
            .FirstOrDefaultAsync(r => r.Id == id) ?? 
            throw new ArgumentException("Fiche de poste introuvable");

        return result;
    }

    public async Task<JobDescription?> GetJobDescriptionByRequest(RecruitmentRequest req) {
        var result = await _dbCtx.JobDescriptions
            .Include(r => r.Attributions)
            .Include(r => r.Formations)
                .ThenInclude(f => f.Education)
            .Include(f => f.Formations)
                .ThenInclude(f => f.LevelEducation)
            .Include(r => r.Experiences)
            .Include(r => r.SoftSkills).ThenInclude(s => s.SoftSkill)
            .Include(r => r.Skills)
            .FirstOrDefaultAsync(j => j.Request.Id == req.Id);

        return result;
    }


    public async Task AddEducation(Education education) {
        education.Id = _seq.GenerateSequence("seq_education_id", "ETD");
        await _dbCtx.Educations.AddAsync(education);
    }

    public async Task AddFormation(Formation param) {
        param.Id = _seq.GenerateSequence("seq_formation_id", "FRT");
        await _dbCtx.Formations.AddAsync(param);
    }

    public async Task AddJobDescriptionSoftSkill(JobDescriptionSoftSkill job) {
        job.Id = _seq.GenerateSequence("seq_job_soft_skill_id", "FCH_QUA");
        await _dbCtx.JobDescriptionSoftSkills.AddAsync(job);
    }

    public async Task<List<Formation>> GetAllFormations() {
        return await _dbCtx.Formations.AsNoTracking().ToListAsync();
    }

    public async Task AddJobAttribution(Attribution param) {
        param.Id = _seq.GenerateSequence("seq_job_attribution_id", "FCH_ATT");
        await _dbCtx.Attributions.AddAsync(param);
    }

    public async Task AddExperience(Experience param) {
        param.Id = _seq.GenerateSequence("seq_experience_id", "EXP");
        await _dbCtx.Experiences.AddAsync(param);
    }

    public async Task AddSoftSkill(SoftSkill param) {
        param.Id = _seq.GenerateSequence("seq_soft_skill_id", "QUA_PER");
        await _dbCtx.SoftSkills.AddAsync(param);
    }

    public async Task AddSkill(Skill param) {
        param.Id = _seq.GenerateSequence("seq_skill_id", "CMC");
        await _dbCtx.Skills.AddAsync(param);
    }


    public async Task<LevelEducation> GetLevelEducationById(string id) {
        var result = await _dbCtx.LevelEducations.FindAsync(id) 
         ?? throw new ArgumentException("Niveau d'étude introuvable");

        return result;
    }

    public async Task<List<LevelEducation>> GetAllLevelEducations() {
        return await _dbCtx.LevelEducations.AsNoTracking().ToListAsync();
    }


    public async Task<SoftSkill> GetSoftSkillById(string id) {
        var result = await _dbCtx.SoftSkills.FindAsync(id) 
         ?? throw new ArgumentException("Qualité personnelle introuvable");

        return result;
    }

    public async Task<List<SoftSkill>> GetAllSoftSkills() {
        return await _dbCtx.SoftSkills.AsNoTracking().ToListAsync();
    }

    public async Task SaveChangesAsync() => await _dbCtx.SaveChangesAsync();

    public void Attach<TEntity>(TEntity entity) where TEntity : class {
        _dbCtx.Attach(entity);
    }


    public void RemoveAttributions(IEnumerable<Attribution> items) {
        if (items == null || !items.Any()) return;
        _dbCtx.Attributions.RemoveRange(items);
    }

    public void RemoveFormations(IEnumerable<Formation> items) {
        if (items == null || !items.Any()) return;
        _dbCtx.Formations.RemoveRange(items);
    }

    public void RemoveExperiences(IEnumerable<Experience> items) {
        if (items == null || !items.Any()) return;
        _dbCtx.Experiences.RemoveRange(items);
    }

    public void RemoveSoftSkills(IEnumerable<JobDescriptionSoftSkill> items) {
        if (items == null || !items.Any()) return;
        _dbCtx.JobDescriptionSoftSkills.RemoveRange(items);
    }

    public void RemoveSkills(IEnumerable<Skill> items) {
        if (items == null || !items.Any()) return;
        _dbCtx.Skills.RemoveRange(items);
    }


    public async Task UpdateJobDescription(JobDescription last, JobDescription newJob) {
        last.Mission = newJob.Mission;
        last.Attributions = newJob.Attributions;
        last.Experiences = newJob.Experiences;
        last.Formations = newJob.Formations;
        last.Skills = newJob.Skills;
        last.SoftSkills = newJob.SoftSkills;
        last.RequestId = newJob.RequestId;

        await _dbCtx.SaveChangesAsync();
    }
}

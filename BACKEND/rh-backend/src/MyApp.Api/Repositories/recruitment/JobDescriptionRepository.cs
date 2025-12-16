using MyApp.Api.Data;
using MyApp.Api.Entities.recruitment;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Repositories.recruitment;

public interface IJobDescriptionRepository
{
// CRUD educations
    Task<Education> GetEducationById(string id);
    Task<List<Education>> GetAllEducations(string? name, int page, int pageSize);
    Task AddEducation(Education education);
    Task DeleteEducation(Education education);
    Task UpdateEducation(Education last, Education newEducation);
}


public class JobDescriptionRepository(AppDbContext ctx, ISequenceGenerator seq) : IJobDescriptionRepository
{
    private readonly AppDbContext _dbCtx = ctx;
    private readonly ISequenceGenerator _seqGenerator = seq;

    public async Task<Education> GetEducationById(string id) {
        var education = await _dbCtx.Educations.FindAsync(id) 
         ?? throw new ArgumentException("Etude introuvable");

        return education;
    }

    public async Task<List<Education>> GetAllEducations(string? name, int page, int pageSize) {
        
    }

    public async Task AddEducation(Education education) {
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
}

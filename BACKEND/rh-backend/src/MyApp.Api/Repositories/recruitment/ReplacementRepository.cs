using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.recruitment;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Repositories.recruitment;

public interface IReplacementRepository
{
    Task AddReplacement(ReplacementReason data);
    Task DeleteReplacement(string id);
    Task<List<ReplacementReason>> GetAllReasons();
}


public class ReplacementRepository(AppDbContext ctx, ISequenceGenerator seq) : IReplacementRepository
{
    private readonly AppDbContext _dbCtx = ctx;
    private readonly ISequenceGenerator _seqGenerator = seq;


    public async Task AddReplacement(ReplacementReason data) {
        data.Id = _seqGenerator.GenerateSequence("seq_replacement_reason_id", "MRC");
        await _dbCtx.ReplacementReasons.AddAsync(data);
        await  _dbCtx.SaveChangesAsync();
    }


    public async Task DeleteReplacement(string id) {
        var data = await _dbCtx.ReplacementReasons.FirstOrDefaultAsync(r => r.Id == id) 
            ?? throw new ArgumentException("Motif de remplacement introuvable");
        
        data.IsDeleted = true;
        _dbCtx.ReplacementReasons.Update(data);
        await  _dbCtx.SaveChangesAsync();
    }


    public async Task<List<ReplacementReason>> GetAllReasons() {
        return await _dbCtx.ReplacementReasons
            .Where(r => r.IsDeleted == false)
            .AsNoTracking().ToListAsync();
    }
}

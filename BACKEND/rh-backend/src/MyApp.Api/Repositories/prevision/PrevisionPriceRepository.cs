using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.prevision;

namespace MyApp.Api.Repositories.prevision;

public interface IPrevisionPriceRepository
{
    Task<IEnumerable<PrevisionPrice>> GetAllAsync();
    Task<PrevisionPrice?> GetByIdAsync(string id);
    Task AddAsync(PrevisionPrice previsionPrice);
    Task UpdateAsync(PrevisionPrice previsionPrice);
    Task DeleteAsync(string id);
    Task SaveChangesAsync();
}

public class PrevisionPriceRepository : IPrevisionPriceRepository
{
    private readonly AppDbContext _context;

    public PrevisionPriceRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<PrevisionPrice>> GetAllAsync()
    {
        return await _context.PrevisionPrices
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<PrevisionPrice?> GetByIdAsync(string id)
    {
        return await _context.PrevisionPrices
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.PrevisionId == id);
    }

    public async Task AddAsync(PrevisionPrice previsionPrice)
    {
        previsionPrice.CreatedAt = DateTime.Now;
        await _context.PrevisionPrices.AddAsync(previsionPrice);
    }

    public Task UpdateAsync(PrevisionPrice previsionPrice)
    {
        previsionPrice.UpdatedAt = DateTime.Now;
        _context.PrevisionPrices.Update(previsionPrice);
        return Task.CompletedTask;
    }

    public async Task DeleteAsync(string id)
    {
        var previsionPrice = await GetByIdAsync(id);
        if (previsionPrice != null)
            _context.PrevisionPrices.Remove(previsionPrice);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.users;

namespace MyApp.Api.Repositories.users;

public interface IHabilitationRepository
{
    Task<IEnumerable<Habilitation>> GetAllAsync();
    Task<Habilitation?> GetByIdAsync(string id);
    Task AddAsync(Habilitation habilitation);
    Task UpdateAsync(Habilitation habilitation);
    Task DeleteAsync(string id);
    Task SaveChangesAsync();
}

public class HabilitationRepository : IHabilitationRepository
{
    private readonly AppDbContext _context;

    public HabilitationRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Habilitation>> GetAllAsync()
    {
        return await _context.Habilitations
            .Include(h => h.RoleHabilitations)
            .ThenInclude(rh => rh.Role)
            .OrderByDescending(h => h.CreatedAt)
            .ToListAsync();
    }

    public async Task<Habilitation?> GetByIdAsync(string id)
    {
        return await _context.Habilitations
            .AsNoTracking()
            .FirstOrDefaultAsync(h => h.HabilitationId == id);
    }

    public async Task AddAsync(Habilitation habilitation)
    {
        habilitation.CreatedAt = DateTime.Now;
        await _context.Habilitations.AddAsync(habilitation);
    }

    public Task UpdateAsync(Habilitation habilitation)
    {
        habilitation.UpdatedAt = DateTime.Now;
        _context.Habilitations.Update(habilitation);
        return Task.CompletedTask;
    }

    public async Task DeleteAsync(string id)
    {
        var habilitation = await GetByIdAsync(id);
        if (habilitation != null)
            _context.Habilitations.Remove(habilitation);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
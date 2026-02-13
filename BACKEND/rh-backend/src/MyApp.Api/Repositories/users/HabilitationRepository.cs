using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.users;

namespace MyApp.Api.Repositories.users;

public interface IHabilitationRepository
{
    Task<(IEnumerable<Habilitation>, int)> GetAllPaginatedAsync(int page, int pageSize, string? label = null);
    Task<IEnumerable<Habilitation>> GetAllAsync();
    Task<Habilitation?> GetByIdAsync(string id);
    Task<Habilitation?> GetByLabelAsync(string label);
    Task<IEnumerable<Habilitation>> GetByGroupIdsAsync(string[] groupIds);
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

    public async Task<(IEnumerable<Habilitation>, int)> GetAllPaginatedAsync(int page, int pageSize, string? label = null)
    {
        var query = _context.Habilitations
            .OrderByDescending(h => h.CreatedAt)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(label))
        {
            query = query.Where(h => h.Label.Contains(label));
        }

        var totalCount = await query.CountAsync();
        var results = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (results, totalCount);
    }

    public async Task<IEnumerable<Habilitation>> GetAllAsync()
    {
        return await _context.Habilitations
            .Include(h => h.Group)
            .Include(h => h.RoleHabilitations)
            .ThenInclude(rh => rh.Role)
            .OrderByDescending(h => h.CreatedAt)
            .ToListAsync();
    }

    public async Task<Habilitation?> GetByIdAsync(string id)
    {
        return await _context.Habilitations
            .AsNoTracking()
            .Include(h => h.Group)
            .FirstOrDefaultAsync(h => h.HabilitationId == id);
    }

    public async Task<Habilitation?> GetByLabelAsync(string label)
    {
        return await _context.Habilitations
            .AsNoTracking()
            .Include(h => h.Group)
            .FirstOrDefaultAsync(h => h.Label == label);
    }

    public async Task<IEnumerable<Habilitation>> GetByGroupIdsAsync(string[] groupIds)
    {
        return await _context.Habilitations
            .Include(h => h.Group)
            .Include(h => h.RoleHabilitations)
            .ThenInclude(rh => rh.Role)
            .Where(h => groupIds.Contains(h.GroupId))
            .OrderByDescending(h => h.CreatedAt)
            .ToListAsync();
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
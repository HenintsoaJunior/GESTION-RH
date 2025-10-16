using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.users;

namespace MyApp.Api.Repositories.users;

public interface IHabitationGroupRepository
{
    Task<IEnumerable<HabilitationGroup>> GetAllAsync();
    Task<HabilitationGroup?> GetByIdAsync(string id);
    Task AddAsync(HabilitationGroup group);
    Task UpdateAsync(HabilitationGroup group);
    Task DeleteAsync(string id);
    Task SaveChangesAsync();
}

public class HabitationGroupRepository : IHabitationGroupRepository
{
    private readonly AppDbContext _context;

    public HabitationGroupRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<HabilitationGroup>> GetAllAsync()
    {
        return await _context.HabilitationGroups
            .Include(g => g.Habilitations)
            .OrderByDescending(g => g.CreatedAt)
            .ToListAsync();
    }

    public async Task<HabilitationGroup?> GetByIdAsync(string id)
    {
        return await _context.HabilitationGroups
            .AsNoTracking()
            .FirstOrDefaultAsync(g => g.GroupId == id);
    }

    public async Task AddAsync(HabilitationGroup group)
    {
        group.CreatedAt = DateTime.Now;
        await _context.HabilitationGroups.AddAsync(group);
    }

    public Task UpdateAsync(HabilitationGroup group)
    {
        group.UpdatedAt = DateTime.Now;
        _context.HabilitationGroups.Update(group);
        return Task.CompletedTask;
    }

    public async Task DeleteAsync(string id)
    {
        var group = await GetByIdAsync(id);
        if (group != null)
            _context.HabilitationGroups.Remove(group);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
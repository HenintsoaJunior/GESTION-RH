using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.users;

namespace MyApp.Api.Repositories.users;

public interface IRoleHabilitationRepository
{
    Task<IEnumerable<RoleHabilitation>> GetAllAsync();
    Task<RoleHabilitation?> GetByKeysAsync(string habilitationId, string roleId);
    Task AddAsync(RoleHabilitation roleHabilitation);
    Task UpdateAsync(RoleHabilitation roleHabilitation);
    Task DeleteAsync(string habilitationId, string roleId);
    Task SaveChangesAsync();
    Task SynchronizeHabilitationsAsync(string roleId, IEnumerable<string> newHabilitationIds);
}

public class RoleHabilitationRepository : IRoleHabilitationRepository
{
    private readonly AppDbContext _context;

    public RoleHabilitationRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<RoleHabilitation>> GetAllAsync()
    {
        return await _context.RoleHabilitations
            .Include(rh => rh.Habilitation)
            .Include(rh => rh.Role)
            .OrderByDescending(rh => rh.CreatedAt)
            .ToListAsync();
    }

    public async Task<RoleHabilitation?> GetByKeysAsync(string habilitationId, string roleId)
    {
        return await _context.RoleHabilitations
            .Include(rh => rh.Habilitation)
            .Include(rh => rh.Role)
            .FirstOrDefaultAsync(rh => rh.HabilitationId == habilitationId && rh.RoleId == roleId);
    }

    public async Task AddAsync(RoleHabilitation roleHabilitation)
    {
        roleHabilitation.CreatedAt = DateTime.UtcNow;
        roleHabilitation.UpdatedAt = DateTime.UtcNow;
        await _context.RoleHabilitations.AddAsync(roleHabilitation);
    }

    public Task UpdateAsync(RoleHabilitation roleHabilitation)
    {
        roleHabilitation.UpdatedAt = DateTime.UtcNow;
        _context.RoleHabilitations.Update(roleHabilitation);
        return Task.CompletedTask;
    }

    public async Task DeleteAsync(string habilitationId, string roleId)
    {
        var roleHabilitation = await GetByKeysAsync(habilitationId, roleId);
        if (roleHabilitation != null)
            _context.RoleHabilitations.Remove(roleHabilitation);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }

    public async Task SynchronizeHabilitationsAsync(string roleId, IEnumerable<string> newHabilitationIds)
    {
        // Validate input
        if (string.IsNullOrWhiteSpace(roleId))
            throw new ArgumentException("L'ID du rôle ne peut pas être null ou vide");
        if (newHabilitationIds == null)
            throw new ArgumentNullException(nameof(newHabilitationIds));

        // Get existing habilitations for the role
        var existingHabilitations = await _context.RoleHabilitations
            .Where(rh => rh.RoleId == roleId)
            .ToListAsync();
        var existingHabilitationIds = existingHabilitations
            .Select(rh => rh.HabilitationId)
            .ToHashSet();

        // Filter out invalid habilitation IDs
        var validNewHabilitationIds = newHabilitationIds
            .Where(id => !string.IsNullOrWhiteSpace(id))
            .ToHashSet();

        // Determine habilitations to add, remove, and keep
        var habilitationsToAdd = validNewHabilitationIds.Except(existingHabilitationIds).ToList();
        var habilitationsToRemove = existingHabilitationIds.Except(validNewHabilitationIds).ToList();
        var habilitationsToKeep = validNewHabilitationIds.Intersect(existingHabilitationIds).ToList();

        // Add new role-habilitation relationships
        foreach (var habilitationId in habilitationsToAdd)
        {
            // Double-check to avoid duplicates (in case of concurrent updates)
            var existing = await GetByKeysAsync(habilitationId, roleId);
            if (existing == null)
            {
                var roleHabilitation = new RoleHabilitation
                {
                    HabilitationId = habilitationId,
                    RoleId = roleId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                await AddAsync(roleHabilitation);
            }
        }

        // Update existing relationships to refresh UpdatedAt
        foreach (var habilitationId in habilitationsToKeep)
        {
            var existing = await GetByKeysAsync(habilitationId, roleId);
            if (existing != null)
            {
                existing.UpdatedAt = DateTime.UtcNow;
                await UpdateAsync(existing);
            }
        }

        // Remove obsolete role-habilitation relationships
        foreach (var habilitationId in habilitationsToRemove)
        {
            await DeleteAsync(habilitationId, roleId);
        }
    }
}
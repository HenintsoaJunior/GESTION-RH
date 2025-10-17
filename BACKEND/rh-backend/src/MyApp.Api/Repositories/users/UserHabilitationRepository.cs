using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.users;

namespace MyApp.Api.Repositories.users;

public interface IUserHabilitationRepository
{
    Task<IEnumerable<UserHabilitation>> GetAllAsync();
    Task<UserHabilitation?> GetByKeysAsync(string habilitationId, string userId);
    Task AddAsync(UserHabilitation userHabilitation);
    Task UpdateAsync(UserHabilitation userHabilitation);
    Task DeleteAsync(string habilitationId, string userId);
    Task SaveChangesAsync();
    Task SynchronizeHabilitationsAsync(string userId, IEnumerable<string> newHabilitationIds);
    
    Task<IEnumerable<Habilitation>> GetHabilitationsByUserIdAsync(string userId);
}

public class UserHabilitationRepository : IUserHabilitationRepository
{
    private readonly AppDbContext _context;

    public UserHabilitationRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Habilitation>> GetHabilitationsByUserIdAsync(string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
            throw new ArgumentException("L'ID de l'utilisateur ne peut pas être null ou vide", nameof(userId));

        return await _context.Habilitations
            .Where(h => _context.UserHabilitations
                .Where(uh => uh.UserId == userId)
                .Select(uh => uh.HabilitationId)
                .Contains(h.HabilitationId))
            .OrderBy(h => h.Label)
            .ToListAsync();
    }

    public async Task<IEnumerable<UserHabilitation>> GetAllAsync()
    {
        return await _context.UserHabilitations
            .Include(uh => uh.Habilitation)
            .Include(uh => uh.User)
            .OrderByDescending(uh => uh.CreatedAt)
            .ToListAsync();
    }

    public async Task<UserHabilitation?> GetByKeysAsync(string habilitationId, string userId)
    {
        return await _context.UserHabilitations
            .Include(uh => uh.Habilitation)
            .Include(uh => uh.User)
            .FirstOrDefaultAsync(uh => uh.HabilitationId == habilitationId && uh.UserId == userId);
    }

    public async Task AddAsync(UserHabilitation userHabilitation)
    {
        userHabilitation.CreatedAt = DateTime.UtcNow;
        userHabilitation.UpdatedAt = DateTime.UtcNow;
        await _context.UserHabilitations.AddAsync(userHabilitation);
    }

    public Task UpdateAsync(UserHabilitation userHabilitation)
    {
        userHabilitation.UpdatedAt = DateTime.UtcNow;
        _context.UserHabilitations.Update(userHabilitation);
        return Task.CompletedTask;
    }

    public async Task DeleteAsync(string habilitationId, string userId)
    {
        var userHabilitation = await GetByKeysAsync(habilitationId, userId);
        if (userHabilitation != null)
            _context.UserHabilitations.Remove(userHabilitation);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }

    public async Task SynchronizeHabilitationsAsync(string userId, IEnumerable<string> newHabilitationIds)
    {
        // Validate input
        if (string.IsNullOrWhiteSpace(userId))
            throw new ArgumentException("L'ID de l'utilisateur ne peut pas être null ou vide");
        if (newHabilitationIds == null)
            throw new ArgumentNullException(nameof(newHabilitationIds));

        // Get existing habilitations for the user
        var existingHabilitations = await _context.UserHabilitations
            .Where(uh => uh.UserId == userId)
            .ToListAsync();
        var existingHabilitationIds = existingHabilitations
            .Select(uh => uh.HabilitationId)
            .ToHashSet();

        // Filter out invalid habilitation IDs
        var validNewHabilitationIds = newHabilitationIds
            .Where(id => !string.IsNullOrWhiteSpace(id))
            .ToHashSet();

        // Determine habilitations to add, remove, and keep
        var habilitationsToAdd = validNewHabilitationIds.Except(existingHabilitationIds).ToList();
        var habilitationsToRemove = existingHabilitationIds.Except(validNewHabilitationIds).ToList();
        var habilitationsToKeep = validNewHabilitationIds.Intersect(existingHabilitationIds).ToList();

        // Add new user-habilitation relationships
        foreach (var habilitationId in habilitationsToAdd)
        {
            // Double-check to avoid duplicates (in case of concurrent updates)
            var existing = await GetByKeysAsync(habilitationId, userId);
            if (existing == null)
            {
                var userHabilitation = new UserHabilitation
                {
                    HabilitationId = habilitationId,
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                await AddAsync(userHabilitation);
            }
        }

        // Update existing relationships to refresh UpdatedAt
        foreach (var habilitationId in habilitationsToKeep)
        {
            var existing = await GetByKeysAsync(habilitationId, userId);
            if (existing != null)
            {
                existing.UpdatedAt = DateTime.UtcNow;
                await UpdateAsync(existing);
            }
        }

        // Remove obsolete user-habilitation relationships
        foreach (var habilitationId in habilitationsToRemove)
        {
            await DeleteAsync(habilitationId, userId);
        }
    }
}
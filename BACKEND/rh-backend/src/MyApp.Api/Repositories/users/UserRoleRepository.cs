using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.users;

namespace MyApp.Api.Repositories.users
{
    public interface IUserRoleRepository
    {
        Task<IEnumerable<UserRole>> GetAllAsync();
        Task<UserRole?> GetByKeysAsync(string userId, string roleId);
        Task AddAsync(UserRole userRole);
        Task UpdateAsync(UserRole userRole);
        Task DeleteAsync(string userId, string roleId);
        Task SynchronizeRolesAsync(IEnumerable<string> userIds, IEnumerable<string> newRoleIds);
        Task SaveChangesAsync();
    }

    public class UserRoleRepository : IUserRoleRepository
    {
        private readonly AppDbContext _context;

        public UserRoleRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<UserRole>> GetAllAsync()
        {
            return await _context.UserRoles
                .Include(ur => ur.User)
                .Include(ur => ur.Role)
                .OrderByDescending(ur => ur.CreatedAt)
                .ToListAsync();
        }

        public async Task<UserRole?> GetByKeysAsync(string userId, string roleId)
        {
            return await _context.UserRoles
                .Include(ur => ur.User)
                .Include(ur => ur.Role)
                .FirstOrDefaultAsync(ur => ur.UserId == userId && ur.RoleId == roleId);
        }

        public async Task AddAsync(UserRole userRole)
        {
            await _context.UserRoles.AddAsync(userRole);
        }

        public Task UpdateAsync(UserRole userRole)
        {
            _context.UserRoles.Update(userRole);
            return Task.CompletedTask;
        }

        public async Task DeleteAsync(string userId, string roleId)
        {
            var userRole = await GetByKeysAsync(userId, roleId);
            if (userRole != null)
                _context.UserRoles.Remove(userRole);
        }
        
        public async Task SynchronizeRolesAsync(IEnumerable<string> userIds, IEnumerable<string> newRoleIds)
        {
            if (userIds == null || !userIds.Any())
                throw new ArgumentException("Les IDs des utilisateurs ne peuvent pas être null ou vides");
            if (newRoleIds == null)
                throw new ArgumentNullException(nameof(newRoleIds));

            // Validate user IDs
            foreach (var userId in userIds)
            {
                if (string.IsNullOrWhiteSpace(userId))
                    throw new ArgumentException("Un ID d'utilisateur ne peut pas être null ou vide");
            }

            // Filter out invalid role IDs
            var validNewRoleIds = newRoleIds
                .Where(id => !string.IsNullOrWhiteSpace(id))
                .ToHashSet();

            if (!validNewRoleIds.Any())
                throw new ArgumentException("Aucun ID de rôle valide fourni");

            // Synchronize for each user
            foreach (var userId in userIds)
            {
                // Get existing roles for the user
                var existingUserRoles = await _context.UserRoles
                    .Where(ur => ur.UserId == userId)
                    .ToListAsync();
                var existingRoleIds = existingUserRoles
                    .Select(ur => ur.RoleId)
                    .ToHashSet();

                // Determine roles to add, remove, and keep
                var rolesToAdd = validNewRoleIds.Except(existingRoleIds).ToList();
                var rolesToRemove = existingRoleIds.Except(validNewRoleIds).ToList();
                var rolesToKeep = validNewRoleIds.Intersect(existingRoleIds).ToList();

                // Add new user-role relationships
                foreach (var roleId in rolesToAdd)
                {
                    // Double-check to avoid duplicates (in case of concurrent updates)
                    var existing = await GetByKeysAsync(userId, roleId);
                    if (existing == null)
                    {
                        var userRole = new UserRole
                        {
                            UserId = userId,
                            RoleId = roleId,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        };
                        await AddAsync(userRole);
                    }
                }

                // Update existing relationships to refresh UpdatedAt
                foreach (var roleId in rolesToKeep)
                {
                    var existing = await GetByKeysAsync(userId, roleId);
                    if (existing != null)
                    {
                        existing.UpdatedAt = DateTime.UtcNow;
                        await UpdateAsync(existing);
                    }
                }

                // Remove obsolete user-role relationships
                foreach (var roleId in rolesToRemove)
                {
                    await DeleteAsync(userId, roleId);
                }
            }
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
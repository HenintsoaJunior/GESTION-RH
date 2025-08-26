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

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
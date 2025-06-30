using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.users;

namespace MyApp.Api.Repositories.users
{
    public interface IUserRepository
    {
        Task<IEnumerable<User>> GetAllAsync();
        Task<User?> GetByIdAsync(string id);
        Task<User> CreateAsync(User user);
        Task<User> UpdateAsync(User user);
        Task DeleteAsync(string id);
        Task<bool> ExistsAsync(string id);
        Task<bool> EmailExistsAsync(string email, string? excludeUserId = null);
        Task<bool> DepartmentExistsAsync(string departmentId);
    }

    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;

        public UserRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<User>> GetAllAsync()
        {
            return await _context.Users
                .Include(u => u.Department)
                .ToListAsync();
        }

        public async Task<User?> GetByIdAsync(string id)
        {
            return await _context.Users
                .Include(u => u.Department)
                .FirstOrDefaultAsync(u => u.UserId == id);
        }

        public async Task<User> CreateAsync(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<User> UpdateAsync(User user)
        {
            EntityAuditHelper.SetUpdatedTimestamp(user);
            _context.Entry(user).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task DeleteAsync(string id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user != null)
            {
                _context.Users.Remove(user);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> ExistsAsync(string id)
        {
            return await _context.Users.AnyAsync(u => u.UserId == id);
        }

        public async Task<bool> EmailExistsAsync(string email, string? excludeUserId = null)
        {
            return await _context.Users
                .AnyAsync(u => u.Email == email && (excludeUserId == null || u.UserId != excludeUserId));
        }

        public async Task<bool> DepartmentExistsAsync(string departmentId)
        {
            return await _context.Departments.AnyAsync(d => d.DepartmentId == departmentId);
        }
    }
}
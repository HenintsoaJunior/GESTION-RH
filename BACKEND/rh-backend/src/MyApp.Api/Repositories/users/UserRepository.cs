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
        Task<User?> GetByEmailAsync(string email);
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
            try
            {
                return await _context.Users
                    .Include(u => u.Department)
                    .ToListAsync();
            }
            catch (Exception)
            {
                throw new Exception("Failed to retrieve users.");
            }
        }

        public async Task<User?> GetByIdAsync(string id)
        {
            try
            {
                return await _context.Users
                    .Include(u => u.Department)
                    .FirstOrDefaultAsync(u => u.UserId == id);
            }
            catch (Exception)
            {
                throw new Exception($"Failed to retrieve user with ID {id}.");
            }
        }

        public async Task<User> CreateAsync(User user)
        {
            try
            {
                _context.Users.Add(user);
                await _context.SaveChangesAsync();
                return user;
            }
            catch (DbUpdateException)
            {
                throw new Exception("Failed to create user due to a database error.");
            }
            catch (Exception)
            {
                throw new Exception("Failed to create user.");
            }
        }

        public async Task<User> UpdateAsync(User user)
        {
            try
            {
                _context.Entry(user).State = EntityState.Modified;
                await _context.SaveChangesAsync();
                return user;
            }
            catch (DbUpdateException)
            {
                throw new Exception("Failed to update user due to a database error.");
            }
            catch (Exception)
            {
                throw new Exception($"Failed to update user with ID {user.UserId}.");
            }

        }

        public async Task DeleteAsync(string id)
        {
            try
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null)
                    throw new Exception($"User with ID {id} not found.");

                _context.Users.Remove(user);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                throw new Exception($"Failed to delete user with ID {id} due to a database error.");
            }
            catch (Exception ex)
            {
                throw new Exception($"Failed to delete user with ID {id}: {ex.Message}");
            }
        }

        public async Task<bool> ExistsAsync(string id)
        {
            try
            {
                return await _context.Users.AnyAsync(u => u.UserId == id);
            }
            catch (Exception)
            {
                throw new Exception($"Failed to check existence of user with ID {id}.");
            }
        }

        public async Task<bool> EmailExistsAsync(string email, string? excludeUserId = null)
        {
            try
            {
                return await _context.Users
                    .AnyAsync(u => u.Email == email && (excludeUserId == null || u.UserId != excludeUserId));
            }
            catch (Exception)
            {
                throw new Exception("Failed to check if email exists.");
            }
        }

        public async Task<bool> DepartmentExistsAsync(string departmentId)
        {
            try
            {
                return await _context.Departments.AnyAsync(d => d.DepartmentId == departmentId);
            }
            catch (Exception)
            {
                throw new Exception($"Failed to check existence of department with ID {departmentId}.");
            }
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            try
            {
                return await _context.Users
                    .Include(u => u.Department)
                    .FirstOrDefaultAsync(u => u.Email == email);
            }
            catch (Exception)
            {
                throw new Exception("Failed to retrieve user by email.");
            }
        }
    }
}
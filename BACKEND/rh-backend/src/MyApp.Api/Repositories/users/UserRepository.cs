using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.users;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MyApp.Api.Repositories.users
{
    public interface IUserRepository
    {
        Task<IEnumerable<User>> GetAllAsync();
        Task<User?> GetByIdAsync(string id);
        Task<User?> GetByEmailAsync(string email);
        Task AddAsync(User user);
        Task UpdateAsync(User user);
        Task DeleteAsync(User user);
        Task AddUsersAsync(List<User> users);
        Task UpdateUsersAsync(List<User> users);
        Task DeleteUsersAsync(List<User> users);
        Task SaveChangesAsync();
        Task<IEnumerable<User>> GetCollaboratorsAsync(string userId);
    }

    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;

        public UserRepository(AppDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<IEnumerable<User>> GetCollaboratorsAsync(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId))
                throw new ArgumentException("User ID cannot be null or empty.", nameof(userId));

            return await _context.Users
                .Where(u => u.SuperiorId == userId)
                .ToListAsync();
        }
        public async Task<IEnumerable<User>> GetAllAsync()
        {
            return await _context.Users.ToListAsync();
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                throw new ArgumentException("Email cannot be null or empty.", nameof(email));

            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User?> GetByIdAsync(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
                throw new ArgumentException("Id cannot be null or empty.", nameof(id));

            return await _context.Users.FirstOrDefaultAsync(u => u.UserId == id);
        }

        public async Task AddAsync(User user)
        {
            if (user == null)
                throw new ArgumentNullException(nameof(user));

            await _context.Users.AddAsync(user);
        }

        public async Task UpdateAsync(User user)
        {
            if (user == null)
                throw new ArgumentNullException(nameof(user));

            _context.Users.Update(user);
            await Task.CompletedTask;
        }

        public async Task DeleteAsync(User user)
        {
            if (user == null)
                throw new ArgumentNullException(nameof(user));

            _context.Users.Remove(user);
            await Task.CompletedTask;
        }

        public async Task AddUsersAsync(List<User> users)
        {
            if (users == null || users.Count == 0)
                throw new ArgumentException("User list cannot be null or empty.", nameof(users));

            await _context.Users.AddRangeAsync(users);
        }

        public async Task UpdateUsersAsync(List<User> users)
        {
            if (users == null || users.Count == 0)
                throw new ArgumentException("User list cannot be null or empty.", nameof(users));

            _context.Users.UpdateRange(users);
            await Task.CompletedTask;
        }

        public async Task DeleteUsersAsync(List<User> users)
        {
            if (users == null || users.Count == 0)
                throw new ArgumentException("User list cannot be null or empty.", nameof(users));

            _context.Users.RemoveRange(users);
            await Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
        {
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                throw new InvalidOperationException($"Failed to save changes to the database: {ex.Message}", ex);
            }
        }
    }
}
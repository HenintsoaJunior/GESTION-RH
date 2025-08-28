using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.users;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Api.Models.classes.user;

namespace MyApp.Api.Repositories.users
{
    public interface IUserRepository
    {
        Task<(IEnumerable<User>, int)> SearchAsync(UserSearchFiltersDTO filters, int page, int pageSize);
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
        Task<User?> GetSuperiorAsync(string userId);
        
        Task<User?> GetDrhAsync();
    }

    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;

        public UserRepository(AppDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }
        
        public async Task<User?> GetDrhAsync()
        {
            return await _context.Users
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .Where(u => u.Department == "DRH" && 
                            (u.Position == "Directeur des Ressources Humaines" || 
                             u.Position == "Directrice des Ressources Humaines" || 
                             u.Position == "DRH"))
                .OrderBy(u => u.Name)
                .FirstOrDefaultAsync();
        }
        public async Task<User?> GetSuperiorAsync(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId))
                throw new ArgumentException("User ID cannot be null or empty.", nameof(userId));

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.UserId == userId);

            if (user == null || string.IsNullOrWhiteSpace(user.SuperiorId))
                return null;

            return await _context.Users
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.UserId == user.SuperiorId);
        }
        public async Task<(IEnumerable<User>, int)> SearchAsync(UserSearchFiltersDTO filters, int page, int pageSize)
        {
            var query = _context.Users
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .AsQueryable();

            // Filtre par matricule
            if (!string.IsNullOrWhiteSpace(filters.Matricule))
            {
                query = query.Where(u => u.Matricule.Contains(filters.Matricule));
            }

            // Filtre par nom
            if (!string.IsNullOrWhiteSpace(filters.Name))
            {
                query = query.Where(u => u.Name!.Contains(filters.Name));
            }

            // Filtre par département
            if (!string.IsNullOrWhiteSpace(filters.Department))
            {
                query = query.Where(u => u.Department != null && u.Department.Contains(filters.Department));
            }

            // Filtre par statut
            if (!string.IsNullOrWhiteSpace(filters.Status))
            {
                query = query.Where(u => u.Status != null && u.Status.Contains(filters.Status));
            }

            var totalCount = await query.CountAsync(); // Nombre total de résultats

            // Récupération des résultats paginés
            var results = await query
                .OrderBy(u => u.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (results, totalCount);
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
            return await _context.Users
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .ToListAsync();
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
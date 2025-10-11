using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.users;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Api.Models.classes.user;
using MyApp.Api.Models.dto.users;

namespace MyApp.Api.Repositories.users
{
    public interface IUserRepository
    {
        Task<(IEnumerable<User>, int)> SearchAsync(UserSearchFiltersDTO filters, int page, int pageSize);
        Task<(IEnumerable<UserDto>, int)> GetAllPaginatedAsync(int page, int pageSize);
        Task<IAsyncEnumerable<IEnumerable<UserDto>>> GetAllInBatchesAsync(int batchSize = 1000);
        Task<IEnumerable<UserDto>> GetAllAsync();
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
        Task<IEnumerable<User>> GetUserInfo(string userId);
        Task<User?> GetSuperiorAsync(string matricule);
        Task<User?> GetDrhAsync();
        Task<IEnumerable<string>> GetUserRolesAsync(string userId);
        Task<User?> GetDirectorByDepartmentAsync(string department);
        Task<IEnumerable<string>> GetDistinctDepartmentsAsync();
    }

    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;

        public UserRepository(AppDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<IEnumerable<string>> GetDistinctDepartmentsAsync()
        {
            return await _context.Users
                .Where(u => !string.IsNullOrWhiteSpace(u.Department))
                .Select(u => u.Department!)
                .Distinct()
                .OrderBy(d => d)
                .ToListAsync();
        }
        
        public async Task<User?> GetDrhAsync()
        {
            return await _context.Users
                .AsNoTracking()
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .Where(u => u.Department == "DRH" &&
                            (u.Position == "Directeur des Ressources Humaines" ||
                             u.Position == "Directrice des Ressources Humaines" ||
                             u.Position == "DRH"))
                .OrderBy(u => u.Name)
                .FirstOrDefaultAsync();
        }

        public async Task<User?> GetSuperiorAsync(string matricule)
        {
            if (string.IsNullOrWhiteSpace(matricule))
                throw new ArgumentException("User ID cannot be null or empty.", nameof(matricule));

            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Matricule == matricule);

            if (user == null || string.IsNullOrWhiteSpace(user.SuperiorId))
                return null;

            return await _context.Users
                .AsNoTracking()
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.UserId == user.SuperiorId);
        }

        public async Task<User?> GetDirectorByDepartmentAsync(string department)
        {
            if (string.IsNullOrWhiteSpace(department))
                throw new ArgumentException("Department cannot be null or empty.", nameof(department));

            return await _context.Users
                .AsNoTracking()
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .Where(u => u.Department == department &&
                            u.Position != null &&
                            (u.Position.Contains("Directeur") ||
                            u.Position.Contains("Directrice") ||
                            u.Position.Contains("Director") ||
                            u.Position.Contains("Manager")))
                .OrderBy(u => u.Name)
                .FirstOrDefaultAsync();
        }

        public async Task<(IEnumerable<User>, int)> SearchAsync(UserSearchFiltersDTO filters, int page, int pageSize)
        {
            var query = _context.Users
                .AsNoTracking()
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(filters.Matricule))
            {
                query = query.Where(u => u.Matricule == filters.Matricule);
            }

            if (!string.IsNullOrWhiteSpace(filters.Name))
            {
                var name = filters.Name.ToLower();
                query = query.Where(u => u.Name != null && u.Name.ToLower().Contains(name));
            }

            if (!string.IsNullOrWhiteSpace(filters.Department))
            {
                query = query.Where(u => u.Department != null && u.Department.Contains(filters.Department));
            }

            if (!string.IsNullOrWhiteSpace(filters.Status))
            {
                query = query.Where(u => u.Status != null && u.Status.Contains(filters.Status));
            }

            var totalCount = await query.CountAsync();

            var results = await query
                .OrderBy(u => u.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (results, totalCount);
        }


        public async Task<IEnumerable<User>> GetUserInfo(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId))
                throw new ArgumentException("User ID cannot be null or empty.", nameof(userId));

            return await _context.Users
                .AsNoTracking()
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                    .ThenInclude(r => r!.RoleHabilitations)
                        .ThenInclude(rh => rh.Habilitation)
                .Where(u => u.UserId == userId)
                .ToListAsync();
        }

        public async Task<IEnumerable<User>> GetCollaboratorsAsync(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId))
                throw new ArgumentException("User ID cannot be null or empty.", nameof(userId));

            return await _context.Users
                .AsNoTracking()
                .Where(u => u.SuperiorId == userId)
                .ToListAsync();
        }

        public async Task<(IEnumerable<UserDto>, int)> GetAllPaginatedAsync(int page, int pageSize)
        {
            var query = _context.Users
                .AsNoTracking()
                .Select(u => new UserDto
                {
                    UserId = u.UserId,
                    Email = u.Email,
                    Name = u.Name,
                    Department = u.Department,
                    Position = u.Position,
                    SuperiorId = u.SuperiorId,
                    SuperiorName = u.SuperiorName
                })
                .AsQueryable();

            var totalCount = await query.CountAsync();

            var results = await query
                .OrderBy(dto => dto.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (results, totalCount);
        }

        public async Task<IEnumerable<UserDto>> GetAllAsync()
        {
            return await _context.Users
                .AsNoTracking()
                .Select(u => new UserDto
                {
                    UserId = u.UserId,
                    Email = u.Email,
                    Name = u.Name,
                    Department = u.Department,
                    Matricule = u.Matricule,
                    Position = u.Position,
                    SuperiorId = u.SuperiorId,
                    SuperiorName = u.SuperiorName
                })
                .ToListAsync();
        }

        public async Task<IAsyncEnumerable<IEnumerable<UserDto>>> GetAllInBatchesAsync(int batchSize = 1000)
        {
            async IAsyncEnumerable<IEnumerable<UserDto>> GetBatches()
            {
                int page = 1;
                while (true)
                {
                    var batch = await _context.Users
                        .AsNoTracking()
                        .Select(u => new UserDto
                        {
                            UserId = u.UserId,
                            Email = u.Email,
                            Name = u.Name,
                            Matricule = u.Matricule,
                            Department = u.Department,
                            Position = u.Position,
                            SuperiorId = u.SuperiorId,
                            SuperiorName = u.SuperiorName
                        })
                        .Skip((page - 1) * batchSize)
                        .Take(batchSize)
                        .ToListAsync();

                    if (!batch.Any()) yield break;

                    yield return batch;
                    page++;
                }
            }

            return await Task.FromResult(GetBatches());
        }

        public async Task<IEnumerable<string>> GetUserRolesAsync(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId))
                throw new ArgumentException("User ID cannot be null or empty.", nameof(userId));

            return await _context.UserRoles
                .AsNoTracking()
                .Where(ur => ur.UserId == userId)
                .Select(ur => ur.RoleId)
                .ToListAsync();
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                throw new ArgumentException("Email cannot be null or empty.", nameof(email));

            return await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User?> GetByIdAsync(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
                throw new ArgumentException("Id cannot be null or empty.", nameof(id));

            return await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserId == id);
        }

        public async Task AddAsync(User user)
        {
            ArgumentNullException.ThrowIfNull(user);

            await _context.Users.AddAsync(user);
        }

        public async Task UpdateAsync(User user)
        {
            ArgumentNullException.ThrowIfNull(user);

            _context.Users.Update(user);
            await Task.CompletedTask;
        }

        public async Task DeleteAsync(User user)
        {
            ArgumentNullException.ThrowIfNull(user);

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
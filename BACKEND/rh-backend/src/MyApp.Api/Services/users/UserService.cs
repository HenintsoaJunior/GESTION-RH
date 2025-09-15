using MyApp.Api.Entities.users;
using MyApp.Api.Repositories.users;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Api.Models.classes.user;
using MyApp.Api.Models.dto.users;
using Microsoft.Extensions.Caching.Memory;

namespace MyApp.Api.Services.users
{
    public interface IUserService
    {
        Task<(IEnumerable<User>, int)> SearchAsync(UserSearchFiltersDTO filters, int page, int pageSize);
        Task<UserDto?> LoginAsync(string email, string password);
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
        Task<IEnumerable<UserDto>> GetCollaboratorsAsync(string userId);
        Task<UserDto?> GetSuperiorAsync(string? matricule);
        Task<UserDto?> GetDrhAsync();
        Task<IEnumerable<string>> GetUserRolesAsync(string userId);
        Task<UserDto?> GetDirectorByDepartmentAsync(string department);
    }

    public class UserService : IUserService
    {
        private readonly IUserRepository _repository;
        private readonly IMemoryCache _cache;

        public UserService(IUserRepository repository, IMemoryCache cache = null!)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _cache = cache;
        }

        public async Task<UserDto?> GetDrhAsync()
        {
            var drh = await _repository.GetDrhAsync();
            return drh != null ? MapToDto(drh) : null;
        }

        public async Task<UserDto?> GetSuperiorAsync(string? matricule)
        {
            if (string.IsNullOrWhiteSpace(matricule))
                throw new ArgumentException("User ID cannot be null or empty.", nameof(matricule));

            var superior = await _repository.GetSuperiorAsync(matricule);
            return superior != null ? MapToDto(superior) : null;
        }

        public async Task<UserDto?> GetDirectorByDepartmentAsync(string department)
        {
            if (string.IsNullOrWhiteSpace(department))
                throw new ArgumentException("Department cannot be null or empty.", nameof(department));

            var director = await _repository.GetDirectorByDepartmentAsync(department);
            return director != null ? MapToDto(director) : null;
        }

        public async Task<(IEnumerable<User>, int)> SearchAsync(UserSearchFiltersDTO filters, int page, int pageSize)
        {
            return await _repository.SearchAsync(filters, page, pageSize);
        }

        public async Task<(IEnumerable<UserDto>, int)> GetAllPaginatedAsync(int page, int pageSize)
        {
            return await _repository.GetAllPaginatedAsync(page, pageSize);
        }

        public async Task<IAsyncEnumerable<IEnumerable<UserDto>>> GetAllInBatchesAsync(int batchSize = 1000)
        {
            return await _repository.GetAllInBatchesAsync(batchSize);
        }

        public async Task<IEnumerable<UserDto>> GetAllAsync()
        {
            var allUsers = new List<UserDto>();
            await foreach (var batch in await _repository.GetAllInBatchesAsync(batchSize: 1000))
            {
                allUsers.AddRange(batch);
            }
            return allUsers;
        }

        public async Task<IEnumerable<string>> GetUserRolesAsync(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId))
                throw new ArgumentException("User ID cannot be null or empty.", nameof(userId));

            return await _repository.GetUserRolesAsync(userId);
        }

        public async Task<User?> GetByIdAsync(string id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _repository.GetByEmailAsync(email);
        }

        public async Task AddAsync(User user)
        {
            await _repository.AddAsync(user);
            await _repository.SaveChangesAsync();
        }

        public async Task UpdateAsync(User user)
        {
            await _repository.UpdateAsync(user);
            await _repository.SaveChangesAsync();
        }

        public async Task DeleteAsync(User user)
        {
            await _repository.DeleteAsync(user);
            await _repository.SaveChangesAsync();
        }

        public async Task AddUsersAsync(List<User> users)
        {
            await _repository.AddUsersAsync(users);
            await _repository.SaveChangesAsync();
        }

        public async Task UpdateUsersAsync(List<User> users)
        {
            await _repository.UpdateUsersAsync(users);
            await _repository.SaveChangesAsync();
        }

        public async Task DeleteUsersAsync(List<User> users)
        {
            await _repository.DeleteUsersAsync(users);
            await _repository.SaveChangesAsync();
        }

        public async Task<IEnumerable<UserDto>> GetCollaboratorsAsync(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId))
                throw new ArgumentException("User ID cannot be null or empty.", nameof(userId));

            var collaborators = await _repository.GetCollaboratorsAsync(userId);
            return collaborators.Select(MapToDto);
        }

        public async Task<UserDto?> LoginAsync(string email, string password)
        {
            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
                throw new ArgumentException("Email and password are required.");

            var user = await _repository.GetByEmailAsync(email);
            if (user == null)
                return null;

            return MapToDto(user);
        }

        private static UserDto MapToDto(User user)
        {
            return new UserDto
            {
                UserId = user.UserId,
                Email = user.Email,
                Name = user.Name,
                Matricule = user.Matricule,
                Department = user.Department,
                Position = user.Position,
                SuperiorId = user.SuperiorId,
                SuperiorName = user.SuperiorName
            };
        }
    }
}
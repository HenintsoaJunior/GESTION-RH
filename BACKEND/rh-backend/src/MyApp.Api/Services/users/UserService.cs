// UserService.cs
using MyApp.Api.Entities.users;
using MyApp.Api.Models.form.users;
using MyApp.Api.Repositories.users;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MyApp.Api.Services.users
{
    public interface IUserService
    {
        Task<UserDto?> LoginAsync(string email, string password);
        Task<IEnumerable<User>> GetAllAsync();
        Task<List<User>> GetAllUsersAsync();
        Task<User?> GetByIdAsync(string id);
        Task<User?> GetByEmailAsync(string email);
        Task AddAsync(User user);
        Task UpdateAsync(User user);
        Task DeleteAsync(User user);
        Task AddUsersAsync(List<User> users);
        Task UpdateUsersAsync(List<User> users);
        Task DeleteUsersAsync(List<User> users);
    }
    
    public class UserService : IUserService
    {
        private readonly IUserRepository _repository;

        public UserService(IUserRepository repository)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public async Task<IEnumerable<User>> GetAllAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<List<User>> GetAllUsersAsync()
        {
            var users = await _repository.GetAllAsync();
            return users.ToList();
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
                Department = user.Department,
                Position = user.Position,
                SuperiorId = user.SuperiorId,
                SuperiorName = user.SuperiorName
            };
        }
    }
}
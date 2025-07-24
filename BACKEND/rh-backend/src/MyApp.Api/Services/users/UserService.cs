using MyApp.Api.Entities.users;
using MyApp.Api.Models.form.users;
using MyApp.Api.Repositories.users;

namespace MyApp.Api.Services.users
{
    public interface IUserService
    {
        Task<UserDto?> LoginAsync(string email, string password);
        Task<User?> GetByEmployeeIdAsync(string employeeId);
        Task<IEnumerable<User>> GetAllAsync();
        Task<User?> GetByIdAsync(string id);
        Task<User?> GetByEmailAsync(string email);
        Task AddAsync(User user);
        Task UpdateAsync(User user);
        Task DeleteAsync(User user);
    }
    
    public class UserService : IUserService
    {
        private readonly IUserRepository _repository;

        public UserService(IUserRepository repository)
        {
            _repository = repository;
        }
        public async Task<User?> GetByEmployeeIdAsync(string employeeId)
        {
            return await _repository.GetByEmployeeIdAsync(employeeId) ?? throw new Exception("L'utilisateur n'existe pas");
        }

        public async Task<IEnumerable<User>> GetAllAsync()
        {
            return await _repository.GetAllAsync();
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
        
        public async Task<UserDto?> LoginAsync(string email, string password)
        {
            try
            {
                if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password))
                    throw new Exception("Email and password are required.");

                var user = await _repository.GetByEmailAsync(email);

                if (user == null)
                    return null;

                // if (!BCrypt.Net.BCrypt.Verify(password, user.Password))
                //     return null;

                return MapToDto(user);
            }
            catch (Exception)
            {
                throw new Exception("Failed to authenticate user.");
            }
        }

        private static UserDto MapToDto(User user)
        {
            return new UserDto()
            {
                UserId = user.UserId,
                Email = user.Email,
                Role = user.Role
            };
        }
    }
}


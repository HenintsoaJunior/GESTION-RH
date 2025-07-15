using MyApp.Api.Entities.users;
using MyApp.Api.Repositories.users;

namespace MyApp.Api.Services.users
{
    public interface IUserService
    {
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
    }
}


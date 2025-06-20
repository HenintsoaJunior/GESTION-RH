using Microsoft.EntityFrameworkCore;
using MyApp.Api.Models.users;
using MyApp.Api.Entities.users;
using MyApp.Api.Repositories.users;

namespace MyApp.Api.Services.users
{
    public interface IUserService
    {
        Task<IEnumerable<UserDto>> GetAllAsync();
        Task<UserDto?> GetByIdAsync(string id);
        Task<UserDto> CreateAsync(UserDto dto);
        Task<UserDto?> UpdateAsync(string id, UserDto dto);
        Task<bool> DeleteAsync(string id);
    }

    public class UserService : IUserService
    {
        private readonly IUserRepository _repository;

        public UserService(IUserRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<UserDto>> GetAllAsync()
        {
            try
            {
                var users = await _repository.GetAllAsync();
                return users.Select(MapToDto);
            }
            catch (Exception)
            {
                throw new Exception("Failed to retrieve users.");
            }
        }

        public async Task<UserDto?> GetByIdAsync(string id)
        {
            try
            {
                var user = await _repository.GetByIdAsync(id);
                return user == null ? null : MapToDto(user);
            }
            catch (Exception)
            {
                throw new Exception($"Failed to retrieve user with ID {id}.");
            }
        }

        public async Task<UserDto> CreateAsync(UserDto dto)
        {
            try
            {
                if (await _repository.EmailExistsAsync(dto.Email))
                    throw new Exception("A user with this email already exists.");

                if (!await _repository.DepartmentExistsAsync(dto.DepartmentId))
                    throw new Exception("The specified department does not exist.");

                var user = new User
                {
                    UserId = dto.UserId,
                    Name = dto.Name,
                    Email = dto.Email,
                    Password = dto.Password,
                    Role = dto.Role,
                    DepartmentId = dto.DepartmentId
                };
                var created = await _repository.CreateAsync(user);
                return MapToDto(created);
            }
            catch (DbUpdateException)
            {
                throw new Exception("A user with this ID or email already exists.");
            }
            catch (Exception)
            {
                throw new Exception("Failed to create user.");
            }
        }

        public async Task<UserDto?> UpdateAsync(string id, UserDto dto)
        {
            try
            {
                if (!await _repository.ExistsAsync(id))
                    return null;

                if (await _repository.EmailExistsAsync(dto.Email, id))
                    throw new Exception("A user with this email already exists.");

                if (!await _repository.DepartmentExistsAsync(dto.DepartmentId))
                    throw new Exception("The specified department does not exist.");

                var user = new User
                {
                    UserId = id,
                    Name = dto.Name,
                    Email = dto.Email,
                    Password = dto.Password,
                    Role = dto.Role,
                    DepartmentId = dto.DepartmentId
                };
                var updated = await _repository.UpdateAsync(user);
                return MapToDto(updated);
            }
            catch (DbUpdateException)
            {
                throw new Exception("Failed to update user due to a database error.");
            }
            catch (Exception)
            {
                throw new Exception($"Failed to update user with ID {id}.");
            }
        }

        public async Task<bool> DeleteAsync(string id)
        {
            try
            {
                if (!await _repository.ExistsAsync(id))
                    return false;

                await _repository.DeleteAsync(id);
                return true;
            }
            catch (Exception)
            {
                throw new Exception($"Failed to delete user with ID {id}.");
            }
        }

        private static UserDto MapToDto(User user)
        {
            return new UserDto
            {
                UserId = user.UserId,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                DepartmentId = user.DepartmentId
            };
        }
    }
}
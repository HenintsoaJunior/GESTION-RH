using System;
using System.Threading.Tasks;
using MyApp.Api.Entities.users_simple;
using MyApp.Api.Models.dto.users_simple;
using MyApp.Api.Repositories.users_simple;
using BCrypt.Net;
using MyApp.Api.Utils.generator;
using MyApp.Api.Entities.users;

namespace MyApp.Api.Services.users_simple
{
    public interface IUserSimpleService
    {
        Task<UserSimpleDto?> RegisterAsync(UserSimpleDto userDto);
        Task<UserSimpleDto?> LoginAsync(string email, string password);
    }
    public class UserSimpleService : IUserSimpleService
    {
        private readonly IUserSimpleRepository _repository;

        private readonly ISequenceGenerator _sequenceGenerator;

        public UserSimpleService(IUserSimpleRepository repository, ISequenceGenerator sequenceGenerator)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _sequenceGenerator = sequenceGenerator ?? throw new ArgumentNullException(nameof(sequenceGenerator));
        }

        public async Task<UserSimpleDto?> RegisterAsync(UserSimpleDto userDto)
        {
            if (userDto == null)
                throw new ArgumentNullException(nameof(userDto));

            if (string.IsNullOrWhiteSpace(userDto.Email) || string.IsNullOrWhiteSpace(userDto.Password))
                throw new ArgumentException("Email and password are required.");

            var existingUser = await _repository.GetByEmailAsync(userDto.Email);
            if (existingUser != null)
                throw new InvalidOperationException("User with this email already exists.");

            var user = new UserSimple(userDto)
            {
                UserId = _sequenceGenerator.GenerateSequence("seq_user_simple_id", "USRS", 6, "-"),
                Password = BCrypt.Net.BCrypt.HashPassword(userDto.Password),
                CreatedAt = DateTime.UtcNow,
            };

            await _repository.AddAsync(user);
            await _repository.SaveChangesAsync();

            return MapToDto(user);
        }

        public async Task<UserSimpleDto?> LoginAsync(string email, string password)
        {
            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
                throw new ArgumentException("Email and password are required.");

            var user = await _repository.GetByEmailAsync(email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.Password))
                return null;

            return MapToDto(user);
        }

        private static UserSimpleDto MapToDto(UserSimple user)
        {
            return new UserSimpleDto
            {
                UserId = user.UserId,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                PhoneNumber = user.PhoneNumber,
                Password = user.Password
            };
        }
    }
}
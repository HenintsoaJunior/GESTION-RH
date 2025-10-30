using MyApp.Api.Data;
using MyApp.Api.Entities.users;
using MyApp.Api.Repositories.users;
using MyApp.Api.Models.dto.users;

namespace MyApp.Api.Services.users
{
    public interface IUserAvailabilityService
    {
        Task<IEnumerable<UserAvailability>> GetAllAsync(bool includeRelated = false);
        Task<UserAvailability?> GetByIdAsync(string id, bool includeRelated = false);
        Task<string> CreateAsync(UserAvailabilityFormDTO availability);
        Task<bool> UpdateAsync(string id, UserAvailabilityFormDTO availability);
        Task<bool> DeleteAsync(string id);
    }

    public class UserAvailabilityService : IUserAvailabilityService
    {
        private readonly IUserAvailabilityRepository _userAvailabilityRepository;
        private readonly AppDbContext _context;

        public UserAvailabilityService(
            IUserAvailabilityRepository userAvailabilityRepository,
            AppDbContext context)
        {
            _userAvailabilityRepository = userAvailabilityRepository ?? throw new ArgumentNullException(nameof(userAvailabilityRepository));
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<IEnumerable<UserAvailability>> GetAllAsync(bool includeRelated = false)
        {
            return await _userAvailabilityRepository.GetAllAsync(includeRelated);
        }

        public async Task<UserAvailability?> GetByIdAsync(string id, bool includeRelated = false)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                throw new ArgumentException("User ID cannot be null or empty", nameof(id));
            }

            return await _userAvailabilityRepository.GetByIdAsync(id, includeRelated);
        }

        public async Task<string> CreateAsync(UserAvailabilityFormDTO availability)
        {
            if (availability == null)
            {
                throw new ArgumentNullException(nameof(availability), "Availability cannot be null");
            }
            if (string.IsNullOrWhiteSpace(availability.UserId))
            {
                throw new ArgumentException("UserId cannot be null or empty", nameof(availability.UserId));
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var existing = await _userAvailabilityRepository.GetByIdAsync(availability.UserId);
                if (existing != null)
                {
                    throw new InvalidOperationException($"Availability for user {availability.UserId} already exists");
                }

                var availabilityEntity = new UserAvailability(availability);

                await _userAvailabilityRepository.AddAsync(availabilityEntity);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return availabilityEntity.UserId!;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> UpdateAsync(string id, UserAvailabilityFormDTO availability)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                throw new ArgumentException("User ID cannot be null or empty", nameof(id));
            }
            if (availability == null)
            {
                throw new ArgumentNullException(nameof(availability), "Availability cannot be null");
            }

            var existingAvailability = await _userAvailabilityRepository.GetByIdAsync(id, includeRelated: true);
            if (existingAvailability == null)
            {
                throw new InvalidOperationException($"Availability with User ID {id} does not exist");
            }

            // Update only allowed fields from DTO
            existingAvailability.Status = availability.Status ?? "disponible";
            existingAvailability.ChangedAt = DateTime.UtcNow;

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                _userAvailabilityRepository.Update(existingAvailability);
                await _userAvailabilityRepository.SaveChangesAsync();
                await transaction.CommitAsync();
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> DeleteAsync(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                throw new ArgumentException("User ID cannot be null or empty", nameof(id));
            }

            var existingAvailability = await _userAvailabilityRepository.GetByIdAsync(id, includeRelated: true);
            if (existingAvailability == null)
            {
                return false;
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                _userAvailabilityRepository.Delete(existingAvailability);
                await _userAvailabilityRepository.SaveChangesAsync();
                await transaction.CommitAsync();
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}
using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.users;

namespace MyApp.Api.Repositories.users
{
    public interface IUserAvailabilityRepository
    {
        Task<IEnumerable<UserAvailability>> GetAllAsync(bool includeRelated = false);
        Task<UserAvailability?> GetByIdAsync(string id, bool includeRelated = false);
        Task AddAsync(UserAvailability availability);
        void Update(UserAvailability availability);
        void Delete(UserAvailability availability);
        Task SaveChangesAsync();
    }

    public class UserAvailabilityRepository : IUserAvailabilityRepository
    {
        private readonly AppDbContext _context;

        public UserAvailabilityRepository(AppDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<IEnumerable<UserAvailability>> GetAllAsync(bool includeRelated = false)
        {
            IQueryable<UserAvailability> query = _context.UserAvailabilities
                .OrderByDescending(c => c.ChangedAt);

            if (includeRelated)
            {
                query = query
                    .Include(c => c.User);
            }

            return await query.ToListAsync();
        }

        public async Task<UserAvailability?> GetByIdAsync(string id, bool includeRelated = false)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                return null;
            }

            IQueryable<UserAvailability> query = _context.UserAvailabilities;

            if (includeRelated)
            {
                query = query
                    .Include(c => c.User);
            }

            return await query.FirstOrDefaultAsync(c => c.UserId == id);
        }

        public async Task AddAsync(UserAvailability availability)
        {
            if (availability == null)
            {
                throw new ArgumentNullException(nameof(availability));
            }

            await _context.UserAvailabilities.AddAsync(availability);
        }

        public void Update(UserAvailability availability)
        {
            if (availability == null)
            {
                throw new ArgumentNullException(nameof(availability));
            }

            _context.UserAvailabilities.Update(availability);
            // SaveChangesAsync is called in the service layer to ensure transaction consistency
        }

        public void Delete(UserAvailability availability)
        {
            if (availability == null)
            {
                throw new ArgumentNullException(nameof(availability));
            }

            _context.UserAvailabilities.Remove(availability);
            // SaveChangesAsync is called in the service layer to ensure transaction consistency
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
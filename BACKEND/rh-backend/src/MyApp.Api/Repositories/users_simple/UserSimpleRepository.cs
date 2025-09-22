using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.users_simple;
using System.Threading.Tasks;

namespace MyApp.Api.Repositories.users_simple
{
    public interface IUserSimpleRepository
    {
        Task<UserSimple?> GetByEmailAsync(string email);
        Task AddAsync(UserSimple user);
        Task SaveChangesAsync();
    }
    public class UserSimpleRepository : IUserSimpleRepository
    {
        private readonly AppDbContext _context;

        public UserSimpleRepository(AppDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<UserSimple?> GetByEmailAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                throw new ArgumentException("Email cannot be null or empty.", nameof(email));

            return await _context.Set<UserSimple>()
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task AddAsync(UserSimple user)
        {
            ArgumentNullException.ThrowIfNull(user);

            await _context.Set<UserSimple>().AddAsync(user);
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
using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.users;

namespace MyApp.Api.Repositories.users;

public interface IRoleHabilitationRepository
    {
        Task<IEnumerable<RoleHabilitation>> GetAllAsync();
        Task<RoleHabilitation?> GetByKeysAsync(string habilitationId, string roleId);
        Task AddAsync(RoleHabilitation roleHabilitation);
        Task UpdateAsync(RoleHabilitation roleHabilitation);
        Task DeleteAsync(string habilitationId, string roleId);
        Task SaveChangesAsync();
    }

    public class RoleHabilitationRepository : IRoleHabilitationRepository
    {
        private readonly AppDbContext _context;

        public RoleHabilitationRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<RoleHabilitation>> GetAllAsync()
        {
            return await _context.RoleHabilitations
                .Include(rh => rh.Habilitation)
                .Include(rh => rh.Role)
                .OrderByDescending(rh => rh.CreatedAt)
                .ToListAsync();
        }

        public async Task<RoleHabilitation?> GetByKeysAsync(string habilitationId, string roleId)
        {
            return await _context.RoleHabilitations
                .Include(rh => rh.Habilitation)
                .Include(rh => rh.Role)
                .FirstOrDefaultAsync(rh => rh.HabilitationId == habilitationId && rh.RoleId == roleId);
        }

        public async Task AddAsync(RoleHabilitation roleHabilitation)
        {
            await _context.RoleHabilitations.AddAsync(roleHabilitation);
        }

        public Task UpdateAsync(RoleHabilitation roleHabilitation)
        {
            _context.RoleHabilitations.Update(roleHabilitation);
            return Task.CompletedTask;
        }

        public async Task DeleteAsync(string habilitationId, string roleId)
        {
            var roleHabilitation = await GetByKeysAsync(habilitationId, roleId);
            if (roleHabilitation != null)
                _context.RoleHabilitations.Remove(roleHabilitation);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
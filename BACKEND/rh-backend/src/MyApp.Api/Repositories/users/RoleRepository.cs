using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.users;

namespace MyApp.Api.Repositories.users;

public interface IRoleRepository
{
    Task<IEnumerable<Role>> GetAllAsync();
    Task<Role?> GetByIdAsync(string id);
    Task AddAsync(Role role);
    Task UpdateAsync(Role role);
    Task DeleteAsync(string id);
    Task SaveChangesAsync();
}

public class RoleRepository : IRoleRepository
{
    private readonly AppDbContext _context;

    public RoleRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Role>> GetAllAsync()
    {
        return await _context.Roles
            .Include(r => r.RoleHabilitations)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<Role?> GetByIdAsync(string id)
    {
        return await _context.Roles
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.RoleId == id);
    }

    public async Task AddAsync(Role role)
    {
        role.CreatedAt = DateTime.Now;
        await _context.Roles.AddAsync(role);
    }

    public Task UpdateAsync(Role role)
    {
        role.UpdatedAt = DateTime.Now;
        _context.Roles.Update(role);
        return Task.CompletedTask;
    }

    public async Task DeleteAsync(string id)
    {
        var role = await _context.Roles
            .Include(r => r.RoleHabilitations)
            .Include(r => r.UserRoles)
            .FirstOrDefaultAsync(r => r.RoleId == id);

        if (role != null)
        {
            _context.RoleHabilitations.RemoveRange(role.RoleHabilitations);
            _context.UserRoles.RemoveRange(role.UserRoles);
            _context.Roles.Remove(role);
        }
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
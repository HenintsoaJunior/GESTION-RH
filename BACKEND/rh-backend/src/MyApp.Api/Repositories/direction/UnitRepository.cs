using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.direction;
using MyApp.Api.Models.dto.direction;
using System;

namespace MyApp.Api.Repositories.direction
{
    public interface IUnitRepository
    {
        Task<(IEnumerable<Unit>, int)> SearchAsync(UnitSearchFiltersDTO filters, int page, int pageSize);
        Task<IEnumerable<Unit>> GetAllAsync();
        Task<Unit?> GetByIdAsync(string id);
        Task<IEnumerable<Unit>> GetByServiceAsync(string serviceId);
        Task AddAsync(Unit unit);
        Task UpdateAsync(Unit unit);
        Task DeleteAsync(string id);
        Task SaveChangesAsync();
    }

    public class UnitRepository : IUnitRepository
    {
        private readonly AppDbContext _context;

        public UnitRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<(IEnumerable<Unit>, int)> SearchAsync(UnitSearchFiltersDTO filters, int page, int pageSize)
        {
            var query = _context.Units.Include(u => u.Service).AsQueryable();

            if (!string.IsNullOrWhiteSpace(filters.Name))
            {
                query = query.Where(u => u.UnitName.Contains(filters.Name));
            }

            if (!string.IsNullOrWhiteSpace(filters.ServiceId))
            {
                query = query.Where(u => u.ServiceId == filters.ServiceId);
            }

            var totalCount = await query.CountAsync();

            var results = await query
                .OrderByDescending(u => u.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (results, totalCount);
        }

        public async Task<IEnumerable<Unit>> GetAllAsync()
        {
            return await _context.Units
                .Include(u => u.Service)
                .OrderByDescending(u => u.CreatedAt)
                .ToListAsync();
        }

        public async Task<Unit?> GetByIdAsync(string id)
        {
            return await _context.Units
                .Include(u => u.Service)
                .FirstOrDefaultAsync(u => u.UnitId == id);
        }

        public async Task<IEnumerable<Unit>> GetByServiceAsync(string serviceId)
        {
            return await _context.Units
                .Include(u => u.Service)
                .Where(u => u.ServiceId == serviceId)
                .OrderByDescending(u => u.CreatedAt)
                .ToListAsync();
        }

        public async Task AddAsync(Unit unit)
        {
            unit.CreatedAt = DateTime.Now;
            await _context.Units.AddAsync(unit);
        }

        public async Task UpdateAsync(Unit updatedUnit)
        {
            var existingUnit = await _context.Units.FirstOrDefaultAsync(u => u.UnitId == updatedUnit.UnitId);
            if (existingUnit == null)
            {
                throw new InvalidOperationException($"Unit with ID {updatedUnit.UnitId} not found.");
            }

            existingUnit.UnitName = updatedUnit.UnitName;
            existingUnit.ServiceId = updatedUnit.ServiceId;
            existingUnit.UpdatedAt = DateTime.Now;
        }

        public async Task DeleteAsync(string id)
        {
            var unit = await GetByIdAsync(id);
            if (unit != null)
                _context.Units.Remove(unit);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
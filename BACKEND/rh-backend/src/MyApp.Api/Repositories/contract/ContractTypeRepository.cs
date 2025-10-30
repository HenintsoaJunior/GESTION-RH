using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.contract;
using System;

namespace MyApp.Api.Repositories.contract
{
    public interface IContractTypeRepository
    {
        Task<IEnumerable<ContractType>> GetAllAsync();
        Task<ContractType?> GetByIdAsync(string id);
        Task AddAsync(ContractType contractType);
        Task UpdateAsync(ContractType contractType);
        Task DeleteAsync(string id);
        Task SaveChangesAsync();
    }

    public class ContractTypeRepository : IContractTypeRepository
    {
        private readonly AppDbContext _context;

        public ContractTypeRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ContractType>> GetAllAsync()
        {
            return await _context.ContractTypes
                .OrderBy(c => c.Label)
                .ToListAsync();
        }

        public async Task<ContractType?> GetByIdAsync(string id)
        {
            return await _context.ContractTypes.FindAsync(id);
        }

        public async Task AddAsync(ContractType contractType)
        {
            contractType.CreatedAt = DateTime.Now;
            await _context.ContractTypes.AddAsync(contractType);
        }

        public async Task UpdateAsync(ContractType updatedContractType)
        {
            var existingContractType = await _context.ContractTypes.FirstOrDefaultAsync(c => c.ContractTypeId == updatedContractType.ContractTypeId);
            if (existingContractType == null)
            {
                throw new InvalidOperationException($"Contract Type with ID {updatedContractType.ContractTypeId} not found.");
            }

            existingContractType.Code = updatedContractType.Code;
            existingContractType.Label = updatedContractType.Label;
            existingContractType.UpdatedAt = DateTime.Now;
        }

        public async Task DeleteAsync(string id)
        {
            var entity = await GetByIdAsync(id);
            if (entity != null)
                _context.ContractTypes.Remove(entity);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
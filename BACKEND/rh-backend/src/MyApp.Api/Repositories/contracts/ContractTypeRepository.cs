using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.contracts;

namespace MyApp.Api.Repositories.contracts
{
    public interface IContractTypeRepository
    {
        Task<IEnumerable<ContractType>> GetAllAsync();
        Task<ContractType?> GetByIdAsync(string id);
        Task<ContractType> CreateAsync(ContractType contractType);
        Task<ContractType> UpdateAsync(ContractType contractType);
        Task DeleteAsync(string id);
        Task<bool> ExistsAsync(string id);
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
            return await _context.ContractTypes.ToListAsync();
        }

        public async Task<ContractType?> GetByIdAsync(string id)
        {
            return await _context.ContractTypes.FindAsync(id);
        }

        public async Task<ContractType> CreateAsync(ContractType contractType)
        {
            _context.ContractTypes.Add(contractType);
            await _context.SaveChangesAsync();
            return contractType;
        }

        public async Task<ContractType> UpdateAsync(ContractType contractType)
        {
            EntityAuditHelper.SetUpdatedTimestamp(contractType);
            _context.Entry(contractType).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return contractType;
        }

        public async Task DeleteAsync(string id)
        {
            var contractType = await _context.ContractTypes.FindAsync(id);
            if (contractType != null)
            {
                _context.ContractTypes.Remove(contractType);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> ExistsAsync(string id)
        {
            return await _context.ContractTypes.AnyAsync(ct => ct.ContractTypeId == id);
        }
    }
}
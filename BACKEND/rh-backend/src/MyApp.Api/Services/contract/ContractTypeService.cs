using MyApp.Api.Entities.contract;
using MyApp.Api.Repositories.contract;

namespace MyApp.Api.Services.contract
{
    public interface IContractTypeService
    {
        Task<IEnumerable<ContractType>> GetAllAsync();
        Task<ContractType?> GetByIdAsync(string id);
        Task AddAsync(ContractType contractType);
        Task UpdateAsync(ContractType contractType);
        Task DeleteAsync(string id);
    }

    public class ContractTypeService : IContractTypeService
    {
        private readonly IContractTypeRepository _repository;

        public ContractTypeService(IContractTypeRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<ContractType>> GetAllAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<ContractType?> GetByIdAsync(string id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task AddAsync(ContractType contractType)
        {
            await _repository.AddAsync(contractType);
            await _repository.SaveChangesAsync();
        }

        public async Task UpdateAsync(ContractType contractType)
        {
            await _repository.UpdateAsync(contractType);
            await _repository.SaveChangesAsync();
        }

        public async Task DeleteAsync(string id)
        {
            await _repository.DeleteAsync(id);
            await _repository.SaveChangesAsync();
        }
    }
}

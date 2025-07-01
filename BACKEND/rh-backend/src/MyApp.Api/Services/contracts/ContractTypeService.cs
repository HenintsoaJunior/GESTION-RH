using Microsoft.EntityFrameworkCore;
using MyApp.Api.Models.contracts;
using MyApp.Api.Entities.contracts;
using MyApp.Api.Repositories.contracts;

namespace MyApp.Api.Services.contracts
{
    public interface IContractTypeService
    {
        Task<IEnumerable<ContractTypeDto>> GetAllAsync();
        Task<ContractTypeDto?> GetByIdAsync(string id);
        Task<ContractTypeDto> CreateAsync(ContractTypeDto dto);
        Task<ContractTypeDto?> UpdateAsync(string id, ContractTypeDto dto);
        Task<bool> DeleteAsync(string id);
    }

    public class ContractTypeService : IContractTypeService
    {
        private readonly IContractTypeRepository _repository;

        public ContractTypeService(IContractTypeRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<ContractTypeDto>> GetAllAsync()
        {
            try
            {
                var contractTypes = await _repository.GetAllAsync();
                return contractTypes.Select(MapToDto);
            }
            catch (Exception)
            {
                throw new Exception("Failed to retrieve contract types.");
            }
        }

        public async Task<ContractTypeDto?> GetByIdAsync(string id)
        {
            try
            {
                var contractType = await _repository.GetByIdAsync(id);
                return contractType == null ? null : MapToDto(contractType);
            }
            catch (Exception)
            {
                throw new Exception($"Failed to retrieve contract type with ID {id}.");
            }
        }

        public async Task<ContractTypeDto> CreateAsync(ContractTypeDto dto)
        {
            try
            {
                var contractType = new ContractType
                {
                    ContractTypeId = dto.ContractTypeId,
                    ContractTypeName = dto.ContractTypeName
                };
                var created = await _repository.CreateAsync(contractType);
                return MapToDto(created);
            }
            catch (DbUpdateException)
            {
                throw new Exception("A contract type with this ID already exists.");
            }
            catch (Exception)
            {
                throw new Exception("Failed to create contract type.");
            }
        }

        public async Task<ContractTypeDto?> UpdateAsync(string id, ContractTypeDto dto)
        {
            try
            {
                if (!await _repository.ExistsAsync(id))
                    return null;

                var contractType = new ContractType
                {
                    ContractTypeId = id,
                    ContractTypeName = dto.ContractTypeName
                };
                var updated = await _repository.UpdateAsync(contractType);
                return MapToDto(updated);
            }
            catch (DbUpdateException)
            {
                throw new Exception("Failed to update contract type due to a database error.");
            }
            catch (Exception)
            {
                throw new Exception($"Failed to update contract type with ID {id}.");
            }
        }

        public async Task<bool> DeleteAsync(string id)
        {
            try
            {
                if (!await _repository.ExistsAsync(id))
                    return false;

                await _repository.DeleteAsync(id);
                return true;
            }
            catch (Exception)
            {
                throw new Exception($"Failed to delete contract type with ID {id}.");
            }
        }

        private static ContractTypeDto MapToDto(ContractType contractType)
        {
            return new ContractTypeDto
            {
                ContractTypeId = contractType.ContractTypeId,
                ContractTypeName = contractType.ContractTypeName
            };
        }
    }
}
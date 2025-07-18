using Microsoft.Extensions.Logging;
using MyApp.Api.Entities.contract;
using MyApp.Api.Repositories.contract;
using MyApp.Api.Utils.generator;

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
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly ILogger<ContractTypeService> _logger;

        public ContractTypeService(
            IContractTypeRepository repository,
            ISequenceGenerator sequenceGenerator,
            ILogger<ContractTypeService> logger)
        {
            _repository = repository;
            _sequenceGenerator = sequenceGenerator;
            _logger = logger;
        }

        public async Task<IEnumerable<ContractType>> GetAllAsync()
        {
            try
            {
                _logger.LogInformation("Récupération de tous les types de contrat");
                return await _repository.GetAllAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des types de contrat");
                throw;
            }
        }

        public async Task<ContractType?> GetByIdAsync(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    _logger.LogWarning("Tentative de récupération d'un type de contrat avec un ID null ou vide");
                    return null;
                }

                _logger.LogInformation("Récupération du type de contrat avec l'ID: {ContractTypeId}", id);
                return await _repository.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du type de contrat avec l'ID: {ContractTypeId}", id);
                throw;
            }
        }

        public async Task AddAsync(ContractType contractType)
        {
            try
            {
                if (contractType == null)
                {
                    throw new ArgumentNullException(nameof(contractType), "Le type de contrat ne peut pas être null");
                }

                if (string.IsNullOrWhiteSpace(contractType.ContractTypeId))
                {
                    contractType.ContractTypeId = _sequenceGenerator.GenerateSequence("seq_contract_type_id", "CT", 6, "-");
                    _logger.LogInformation("ID généré pour le type de contrat: {ContractTypeId}", contractType.ContractTypeId);
                }

                await _repository.AddAsync(contractType);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Type de contrat ajouté avec succès avec l'ID: {ContractTypeId}", contractType.ContractTypeId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l'ajout du type de contrat avec l'ID: {ContractTypeId}", contractType?.ContractTypeId);
                throw;
            }
        }

        public async Task UpdateAsync(ContractType contractType)
        {
            try
            {
                if (contractType == null)
                {
                    throw new ArgumentNullException(nameof(contractType), "Le type de contrat ne peut pas être null");
                }

                if (string.IsNullOrWhiteSpace(contractType.ContractTypeId))
                {
                    throw new ArgumentException("L'ID du type de contrat ne peut pas être null ou vide", nameof(contractType.ContractTypeId));
                }

                await _repository.UpdateAsync(contractType);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Type de contrat mis à jour avec succès pour l'ID: {ContractTypeId}", contractType.ContractTypeId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour du type de contrat avec l'ID: {ContractTypeId}", contractType?.ContractTypeId);
                throw;
            }
        }

        public async Task DeleteAsync(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    throw new ArgumentException("L'ID du type de contrat ne peut pas être null ou vide", nameof(id));
                }

                await _repository.DeleteAsync(id);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Type de contrat supprimé avec succès pour l'ID: {ContractTypeId}", id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression du type de contrat avec l'ID: {ContractTypeId}", id);
                throw;
            }
        }
    }
}
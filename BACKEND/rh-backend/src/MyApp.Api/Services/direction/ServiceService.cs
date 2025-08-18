using Microsoft.Extensions.Logging;
using MyApp.Api.Entities.direction;
using MyApp.Api.Repositories.direction;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Services.direction
{
    public interface IServiceService
    {
        Task<IEnumerable<Service>> GetAllAsync();
        Task<Service?> GetByIdAsync(string id);
        Task AddAsync(Service service);
        Task UpdateAsync(Service service);
        Task DeleteAsync(string id);
    }

    public class ServiceService : IServiceService
    {
        private readonly IServiceRepository _repository;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly ILogger<ServiceService> _logger;

        public ServiceService(
            IServiceRepository repository,
            ISequenceGenerator sequenceGenerator,
            ILogger<ServiceService> logger)
        {
            _repository = repository;
            _sequenceGenerator = sequenceGenerator;
            _logger = logger;
        }

        public async Task<IEnumerable<Service>> GetAllAsync()
        {
            try
            {
                _logger.LogInformation("Récupération de tous les services");
                return await _repository.GetAllAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des services");
                throw;
            }
        }

        public async Task<Service?> GetByIdAsync(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    _logger.LogWarning("Tentative de récupération d'un service avec un ID null ou vide");
                    return null;
                }

                _logger.LogInformation("Récupération du service avec l'ID: {ServiceId}", id);
                return await _repository.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du service avec l'ID: {ServiceId}", id);
                throw;
            }
        }

        public async Task AddAsync(Service service)
        {
            try
            {
                if (service == null)
                {
                    throw new ArgumentNullException(nameof(service), "Le service ne peut pas être null");
                }

                if (string.IsNullOrWhiteSpace(service.ServiceId))
                {
                    service.ServiceId = _sequenceGenerator.GenerateSequence("seq_service_id", "SRV", 6, "-");
                    _logger.LogInformation("ID généré pour le service: {ServiceId}", service.ServiceId);
                }

                await _repository.AddAsync(service);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Service ajouté avec succès avec l'ID: {ServiceId}", service.ServiceId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l'ajout du service avec l'ID: {ServiceId}", service?.ServiceId);
                throw;
            }
        }

        public async Task UpdateAsync(Service service)
        {
            try
            {
                if (service == null)
                {
                    throw new ArgumentNullException(nameof(service), "Le service ne peut pas être null");
                }

                if (string.IsNullOrWhiteSpace(service.ServiceId))
                {
                    throw new ArgumentException("L'ID du service ne peut pas être null ou vide", nameof(service.ServiceId));
                }

                await _repository.UpdateAsync(service);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Service mis à jour avec succès pour l'ID: {ServiceId}", service.ServiceId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour du service avec l'ID: {ServiceId}", service?.ServiceId);
                throw;
            }
        }

        public async Task DeleteAsync(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    throw new ArgumentException("L'ID du service ne peut pas être null ou vide", nameof(id));
                }

                await _repository.DeleteAsync(id);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Service supprimé avec succès pour l'ID: {ServiceId}", id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression du service avec l'ID: {ServiceId}", id);
                throw;
            }
        }
    }
}
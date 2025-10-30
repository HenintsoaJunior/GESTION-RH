using Microsoft.Extensions.Logging;
using MyApp.Api.Data;
using MyApp.Api.Entities.direction;
using MyApp.Api.Models.dto.direction;
using MyApp.Api.Repositories.direction;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Services.direction
{
    public interface IServiceService
    {
        Task<(IEnumerable<Service>, int)> SearchAsync(ServiceSearchFiltersDTO filters, int page, int pageSize);
        Task<IEnumerable<Service>> GetAllAsync();
        Task<Service?> GetByIdAsync(string id);
        Task<Service> AddAsync(ServiceDTOForm dto);
        Task UpdateAsync(Service service);
        Task DeleteAsync(string id);
    }

    public class ServiceService : IServiceService
    {
        private readonly IServiceRepository _repository;
        private readonly AppDbContext _context;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly ILogger<ServiceService> _logger;

        public ServiceService(
            IServiceRepository repository,
            AppDbContext context,
            ISequenceGenerator sequenceGenerator,
            ILogger<ServiceService> logger)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _sequenceGenerator = sequenceGenerator ?? throw new ArgumentNullException(nameof(sequenceGenerator));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<(IEnumerable<Service>, int)> SearchAsync(ServiceSearchFiltersDTO filters, int page, int pageSize)
        {
            try
            {
                _logger.LogInformation("Recherche des services avec filtres, page={Page}, pageSize={PageSize}", page, pageSize);
                return await _repository.SearchAsync(filters, page, pageSize);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la recherche des services");
                throw;
            }
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

        public async Task<Service> AddAsync(ServiceDTOForm dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                if (dto == null)
                {
                    throw new ArgumentNullException(nameof(dto), "Le DTO de service ne peut pas être null");
                }

                var serviceId = _sequenceGenerator.GenerateSequence("seq_service_id", "SRV", 6, "-");

                var service = new Service(dto) { ServiceId = serviceId };

                await _repository.AddAsync(service);
                await _repository.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation("Service ajouté avec succès avec l'ID: {ServiceId}", service.ServiceId);
                return service;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Erreur lors de l'ajout du service");
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
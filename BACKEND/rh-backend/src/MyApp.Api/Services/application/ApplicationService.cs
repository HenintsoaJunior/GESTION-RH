using MyApp.Api.Entities.application;
using MyApp.Api.Models.dto.application;
using MyApp.Api.Repositories.application;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Services.application
{
    public interface IApplicationService
    {
        Task<IEnumerable<Application>> GetAllAsync();
        Task<IEnumerable<Application>> GetAllByCriteriaAsync(ApplicationDTOForm criteria);
        Task<Application?> GetByIdAsync(string id);
        Task<string> CreateAsync(ApplicationDTOForm dto);
        Task<Application?> UpdateAsync(string id, ApplicationDTOForm dto);
        Task<bool> DeleteAsync(string id);
    }

    public class ApplicationService : IApplicationService
    {
        private readonly IApplicationRepository _repository;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly ILogger<ApplicationService> _logger;

        public ApplicationService(
            IApplicationRepository repository,
            ISequenceGenerator sequenceGenerator,
            ILogger<ApplicationService> logger)
        {
            _repository = repository;
            _sequenceGenerator = sequenceGenerator;
            _logger = logger;
        }

        public async Task<IEnumerable<Application>> GetAllAsync()
        {
            try
            {
                return await _repository.GetAllAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de toutes les applications");
                throw;
            }
        }

        public async Task<IEnumerable<Application>> GetAllByCriteriaAsync(ApplicationDTOForm criteria)
        {
            try
            {
                var entityCriteria = new Application(criteria);
                return await _repository.GetAllByCriteriaAsync(entityCriteria);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des applications par critères");
                throw;
            }
        }

        public async Task<Application?> GetByIdAsync(string id)
        {
            try
            {
                var app = await _repository.GetByIdAsync(id);
                return app != null ? app : null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de l'application {ApplicationId}", id);
                throw;
            }
        }

        public async Task<string> CreateAsync(ApplicationDTOForm dto)
        {
            try
            {
                var application = new Application(dto);
                if (string.IsNullOrWhiteSpace(application.ApplicationId))
                {
                    application.ApplicationId = _sequenceGenerator.GenerateSequence("seq_application_id", "APP", 6, "-");
                }

                await _repository.AddAsync(application);
                await _repository.SaveChangesAsync();
                _logger.LogInformation("Application créée avec l'ID: {ApplicationId}", application.ApplicationId);

                return application.ApplicationId;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la création d'une application");
                throw;
            }
        }

        public async Task<Application?> UpdateAsync(string id, ApplicationDTOForm dto)
        {
            try
            {
                var entity = await _repository.GetByIdAsync(id);
                if (entity == null) return null;

                entity = new Application(dto);
                await _repository.UpdateAsync(entity);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Application {ApplicationId} mise à jour avec succès", id);

                return entity;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour de l'application {ApplicationId}", id);
                throw;
            }
        }

        public async Task<bool> DeleteAsync(string id)
        {
            try
            {
                var entity = await _repository.GetByIdAsync(id);
                if (entity == null) return false;

                await _repository.DeleteAsync(entity);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Application {ApplicationId} supprimée avec succès", id);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression de l'application {ApplicationId}", id);
                throw;
            }
        }
    }
}

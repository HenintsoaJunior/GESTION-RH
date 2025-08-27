using MyApp.Api.Entities.logs;
using MyApp.Api.Models.dto.logs;
using MyApp.Api.Repositories.logs;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Services.logs
{
    public interface ILogService
    {
        Task LogAsync<T>(string action, T? oldEntity, T? newEntity, string userId);
        Task<IEnumerable<Log>> GetAllAsync();
        Task<Log?> GetByIdAsync(string logId);
        Task AddAsync(LogDTOForm dto);
        Task UpdateAsync(Log log);
        Task DeleteAsync(string logId);
    }

    public class LogService : ILogService
    {
        private readonly ILogRepository _repository;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly ILogger<LogService> _logger;

        public LogService(
            ILogRepository repository,
            ISequenceGenerator sequenceGenerator,
            ILogger<LogService> logger)
        {
            _repository = repository;
            _sequenceGenerator = sequenceGenerator;
            _logger = logger;
        }
        
        public async Task LogAsync<T>(string action, T? oldEntity, T? newEntity, string userId)
        {
            var oldValues = oldEntity == null ? null : SerializeEntity(oldEntity);
            var newValues = newEntity == null ? null : SerializeEntity(newEntity);

            await AddAsync(new LogDTOForm
            {
                Action = action,
                TableName = typeof(T).Name.ToLower() + "s", // ex: Role => "roles"
                OldValues = oldValues,
                NewValues = newValues,
                UserId = userId
            });
        }

        /// <summary>
        /// Sérialise les propriétés publiques d'une entité en chaîne lisible
        /// </summary>
        private static string SerializeEntity<T>(T entity)
        {
            var props = typeof(T).GetProperties();
            return string.Join(", ", props.Select(p =>
            {
                var value = p.GetValue(entity);
                return $"{p.Name}={value ?? "null"}";
            }));
        }


        public async Task<IEnumerable<Log>> GetAllAsync()
        {
            try
            {
                _logger.LogInformation("Récupération de tous les logs");
                return await _repository.GetAllAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des logs");
                throw;
            }
        }

        public async Task<Log?> GetByIdAsync(string logId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(logId))
                {
                    _logger.LogWarning("Tentative de récupération d'un log avec un ID null ou vide");
                    return null;
                }

                _logger.LogInformation("Récupération du log avec LogId: {LogId}", logId);
                return await _repository.GetByIdAsync(logId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du log avec LogId: {LogId}", logId);
                throw;
            }
        }

        public async Task AddAsync(LogDTOForm dto)
        {
            try
            {
                var log = new Log(dto);

                if (string.IsNullOrWhiteSpace(log.LogId))
                {
                    log.LogId = _sequenceGenerator.GenerateSequence("seq_log_id", "LOG", 6, "-");
                    _logger.LogInformation("ID généré pour le log: {LogId}", log.LogId);
                }

                if (log.CreatedAt == default)
                {
                    log.CreatedAt = DateTime.UtcNow;
                }

                await _repository.AddAsync(log);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Log ajouté avec succès avec LogId: {LogId}", log.LogId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l'ajout du log");
                throw;
            }
        }

        public async Task UpdateAsync(Log log)
        {
            try
            {
                if (log == null)
                {
                    throw new ArgumentNullException(nameof(log), "Le log ne peut pas être null");
                }

                if (string.IsNullOrWhiteSpace(log.LogId))
                {
                    throw new ArgumentException("L'ID du log ne peut pas être null ou vide", nameof(log));
                }

                await _repository.UpdateAsync(log);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Log mis à jour avec succès pour LogId: {LogId}", log.LogId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour du log avec LogId: {LogId}", log?.LogId);
                throw;
            }
        }

        public async Task DeleteAsync(string logId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(logId))
                {
                    throw new ArgumentException("L'ID du log ne peut pas être null ou vide");
                }

                await _repository.DeleteAsync(logId);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Log supprimé avec succès pour LogId: {LogId}", logId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression du log avec LogId: {LogId}", logId);
                throw;
            }
        }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using System.Reflection;
using MyApp.Api.Entities.logs;
using MyApp.Api.Models.dto.logs;
using MyApp.Api.Repositories.logs;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Services.logs
{
    public interface ILogService
    {
        Task LogAsync<T>(string action, T? oldEntity, T? newEntity, string userId);
        Task LogAsync(string action, string? oldValues, string? newValues, string userId, string? fields = null);
        Task LogAsync<T>(string action, T? oldEntity, T? newEntity, string userId, string fields);
        Task<IEnumerable<Log>> GetAllAsync();
        Task<Log?> GetByIdAsync(string logId);
        Task AddAsync(LogDTOForm dto);
        Task UpdateAsync(Log log);
        Task DeleteAsync(string logId);
        Task<(IEnumerable<Log>, int)> SearchAsync(LogSearchFiltersDTO filters, int page, int pageSize);
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

        public async Task<(IEnumerable<Log>, int)> SearchAsync(LogSearchFiltersDTO filters, int page, int pageSize)
        {
            try
            {
                if (filters == null)
                {
                    throw new ArgumentNullException(nameof(filters), "Les filtres de recherche ne peuvent pas être null");
                }

                if (page < 1 || pageSize < 1)
                {
                    throw new ArgumentException("La page et la taille de la page doivent être supérieures à 0");
                }

                var (logs, totalCount) = await _repository.SearchAsync(filters, page, pageSize);
                return (logs, totalCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la recherche des logs");
                throw;
            }
        }

        public async Task LogAsync<T>(string action, T? oldEntity, T? newEntity, string userId)
        {
            try
            {
                var oldValues = oldEntity == null ? null : SerializeEntity(oldEntity);
                var newValues = newEntity == null ? null : SerializeEntity(newEntity);

                await AddAsync(new LogDTOForm
                {
                    Action = action,
                    TableName = typeof(T).Name.ToLower() + "s",
                    OldValues = oldValues,
                    NewValues = newValues,
                    UserId = userId
                });

                _logger.LogInformation("Log créé pour l'action {Action} par l'utilisateur {UserId}", action, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la création du log pour l'action {Action}", action);
                throw;
            }
        }

        public async Task LogAsync(string action, string? oldValues, string? newValues, string userId, string? fields = null)
        {
            try
            {
                string formattedOldValues = FormatValues(oldValues, fields);
                string formattedNewValues = FormatValues(newValues, fields);

                await AddAsync(new LogDTOForm
                {
                    Action = action,
                    TableName = fields != null ? fields.Split('.')[0] + "s" : "unknown",
                    OldValues = formattedOldValues,
                    NewValues = formattedNewValues,
                    UserId = userId
                });

                _logger.LogInformation("Log créé pour l'action {Action} par l'utilisateur {UserId}", action, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la création du log pour l'action {Action}", action);
                throw;
            }
        }

        public async Task LogAsync<T>(string action, T? oldEntity, T? newEntity, string userId, string fields)
        {
            try
            {
                string? formattedOldValues = oldEntity == null ? null : SerializeSpecificFields(oldEntity, fields);
                string? formattedNewValues = newEntity == null ? null : SerializeSpecificFields(newEntity, fields);

                // Extraire le nom de la table à partir du type générique
                string tableName = typeof(T).Name.ToLower() + "s";

                await AddAsync(new LogDTOForm
                {
                    Action = action,
                    TableName = tableName,
                    OldValues = formattedOldValues,
                    NewValues = formattedNewValues,
                    UserId = userId
                });

                _logger.LogInformation("Log créé pour l'action {Action} par l'utilisateur {UserId}", action, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la création du log pour l'action {Action}", action);
                throw;
            }
        }

        private static string FormatValues(string? values, string? fields)
        {
            if (string.IsNullOrEmpty(values)) return null!;

            if (string.IsNullOrEmpty(fields))
            {
                return values; // Return raw values if no fields are specified
            }

            var fieldList = fields.Split(',').Select(f => f.Trim()).ToList();
            var valueList = values.Split(',').Select(v => v.Trim()).ToList();

            if (fieldList.Count != valueList.Count)
            {
                throw new ArgumentException("Le nombre de champs et de valeurs ne correspond pas.");
            }

            var valueDict = fieldList.Zip(valueList, (field, value) => new { Field = field, Value = value })
                                    .ToDictionary(x => x.Field, x => x.Value);

            return JsonSerializer.Serialize(valueDict, new JsonSerializerOptions { WriteIndented = true });
        }

        private static string SerializeEntity<T>(T entity)
        {
            if (entity == null) return null!;

            var props = typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance);
            var values = new Dictionary<string, object?>();

            foreach (var prop in props)
            {
                try
                {
                    var value = prop.GetValue(entity);
                    values[prop.Name] = value;
                }
                catch (TargetParameterCountException)
                {
                    // Ignorer les propriétés qui nécessitent des paramètres (comme les indexeurs)
                    continue;
                }
                catch (Exception ex)
                {
                    // Log l'erreur mais continue avec les autres propriétés
                    values[prop.Name] = $"Erreur: {ex.Message}";
                }
            }

            return JsonSerializer.Serialize(values, new JsonSerializerOptions { WriteIndented = true });
        }

        private static string SerializeSpecificFields<T>(T entity, string fields)
        {
            if (entity == null) return null!;

            var fieldList = fields.Split(',').Select(f => f.Trim()).ToList();
            var valueDict = new Dictionary<string, object?>();

            foreach (var field in fieldList)
            {
                try
                {
                    // Gérer les noms de propriétés simples (ex: "Name" au lieu de "role.Name")
                    var propName = field.Contains(".") ? field.Split('.').Last() : field;
                    
                    var prop = typeof(T).GetProperty(propName, BindingFlags.Public | BindingFlags.Instance);
                    if (prop == null)
                    {
                        valueDict[field] = "Propriété non trouvée";
                        continue;
                    }

                    // Vérifier si la propriété nécessite des paramètres (indexeurs)
                    var indexParameters = prop.GetIndexParameters();
                    if (indexParameters.Length > 0)
                    {
                        valueDict[field] = "Propriété indexée ignorée";
                        continue;
                    }

                    var value = prop.GetValue(entity);
                    valueDict[field] = value;
                }
                catch (TargetParameterCountException)
                {
                    valueDict[field] = "Erreur: Paramètre requis";
                }
                catch (Exception ex)
                {
                    valueDict[field] = $"Erreur: {ex.Message}";
                }
            }

            return JsonSerializer.Serialize(valueDict, new JsonSerializerOptions { WriteIndented = true });
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
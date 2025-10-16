using System.Text.Json;
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
        Task LogAsync(string action, string tableName, string userId);
        Task LogAsync<T>(string action, T? oldEntity, T? newEntity, string userId, string fields);
        Task LogAsync<T>(string action, string tableName, T? oldEntity, T? newEntity, string userId);
        Task LogAsync<T>(string action, string tableName, T? oldEntity, T? newEntity, string userId, string fields);
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
        private readonly IHttpContextAccessor _httpContextAccessor;

        public LogService(
            ILogRepository repository,
            ISequenceGenerator sequenceGenerator,
            ILogger<LogService> logger,
            IHttpContextAccessor httpContextAccessor)
        {
            _repository = repository;
            _sequenceGenerator = sequenceGenerator;
            _httpContextAccessor = httpContextAccessor;
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
            var tableName = typeof(T).Name.ToLower() + "s";
            await LogAsync(action, tableName, oldEntity, newEntity, userId);
        }

        public async Task LogAsync(string action, string? oldValues, string? newValues, string userId, string? fields = null)
        {
            try
            {
                var formattedOldValues = FormatValues(oldValues, fields);
                var formattedNewValues = FormatValues(newValues, fields);

                await AddAsync(new LogDTOForm
                {
                    Action = action,
                    TableName = fields != null ? fields.Split('.')[0] + "s" : "unknown",
                    OldValues = formattedOldValues,
                    NewValues = formattedNewValues,
                    UserId = userId
                });

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la création du log pour l'action {Action}", action);
                throw;
            }
        }

        public async Task LogAsync(string action,string tableName,string userId)
        {
            try
            {

                await AddAsync(new LogDTOForm
                {
                    Action = action,
                    TableName = tableName,
                    OldValues = null,
                    NewValues = null,
                    UserId = userId
                });

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la création du log pour l'action {Action}", action);
                throw;
            }
        }

        public async Task LogAsync<T>(string action, T? oldEntity, T? newEntity, string userId, string fields)
        {
            var tableName = typeof(T).Name.ToLower() + "s";
            await LogAsync(action, tableName, oldEntity, newEntity, userId, fields);
        }

        public async Task LogAsync<T>(string action, string tableName, T? oldEntity, T? newEntity, string userId)
        {
            try
            {
                var oldValues = oldEntity == null ? null : SerializeEntity(oldEntity);
                var newValues = newEntity == null ? null : SerializeEntity(newEntity);

                await AddAsync(new LogDTOForm
                {
                    Action = action,
                    TableName = tableName,
                    OldValues = oldValues,
                    NewValues = newValues,
                    UserId = userId
                });

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la création du log pour l'action {Action}", action);
                throw;
            }
        }

        public async Task LogAsync<T>(string action, string tableName, T? oldEntity, T? newEntity, string userId, string fields)
        {
            try
            {
                var formattedOldValues = oldEntity == null ? null : SerializeSpecificFields(oldEntity, fields);
                var formattedNewValues = newEntity == null ? null : SerializeSpecificFields(newEntity, fields);

                await AddAsync(new LogDTOForm
                {
                    Action = action,
                    TableName = tableName,
                    OldValues = formattedOldValues,
                    NewValues = formattedNewValues,
                    UserId = userId
                });

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
                return values;
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
                }
                catch (Exception ex)
                {
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
                    var propName = field.Contains('.') ? field.Split('.').Last() : field;
                    
                    var prop = typeof(T).GetProperty(propName, BindingFlags.Public | BindingFlags.Instance);
                    if (prop == null)
                    {
                        valueDict[field] = "Propriété non trouvée";
                        continue;
                    }

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
                }
                
                // ✅ CORRECTION ICI - Assigner à IpAddress au lieu de LogId
                if (string.IsNullOrWhiteSpace(log.IpAddress))
                {
                    log.IpAddress = GetClientIpAddress();
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

        private string GetClientIpAddress()
        {
            var context = _httpContextAccessor.HttpContext;
            if (context == null)
            {
                _logger.LogWarning("Aucun HttpContext disponible pour récupérer l'IP du client");
                return GetLocalIpAddress(); // Fallback sur l'IP locale de la machine
            }

            // 1. Vérifier X-Forwarded-For (en cas de proxy/load balancer)
            var forwardedFor = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
            if (!string.IsNullOrEmpty(forwardedFor))
            {
                var ips = forwardedFor.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries)
                                    .Select(ip => ip.Trim())
                                    .Where(ip => !string.IsNullOrEmpty(ip) && ip != "::1" && !ip.StartsWith("127."));
                if (ips.Any())
                {
                    return ips.First();
                }
            }

            // 2. Vérifier X-Real-IP
            var realIp = context.Request.Headers["X-Real-IP"].FirstOrDefault();
            if (!string.IsNullOrEmpty(realIp) && realIp != "::1" && !realIp.StartsWith("127."))
            {
                return realIp;
            }

            // 3. Essayer l'IP de connexion directe
            var remoteIp = context.Connection.RemoteIpAddress;
            if (remoteIp != null)
            {
                // Convertir IPv6 mappé en IPv4
                if (remoteIp.IsIPv4MappedToIPv6)
                {
                    remoteIp = remoteIp.MapToIPv4();
                }

                var ip = remoteIp.ToString();
                
                // Si c'est localhost, obtenir l'IP réelle de la machine
                if (ip == "::1" || ip.StartsWith("127."))
                {
                    return GetLocalIpAddress();
                }
                
                if (!string.IsNullOrEmpty(ip))
                {
                    return ip;
                }
            }

            // 4. Dernier recours : IP locale de la machine
            return GetLocalIpAddress();
        }

        private string GetLocalIpAddress()
        {
            try
            {
                var host = System.Net.Dns.GetHostEntry(System.Net.Dns.GetHostName());
                
                // Priorité aux adresses IPv4 non-loopback
                var ipv4Address = host.AddressList
                    .FirstOrDefault(ip => ip.AddressFamily == System.Net.Sockets.AddressFamily.InterNetwork 
                                       && !System.Net.IPAddress.IsLoopback(ip));
                
                if (ipv4Address != null)
                {
                    return ipv4Address.ToString();
                }

                // Sinon, essayer IPv6 non-loopback
                var ipv6Address = host.AddressList
                    .FirstOrDefault(ip => ip.AddressFamily == System.Net.Sockets.AddressFamily.InterNetworkV6 
                                       && !System.Net.IPAddress.IsLoopback(ip));
                
                if (ipv6Address != null)
                {
                    return ipv6Address.ToString();
                }

                return "Unknown";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de l'IP locale");
                return "Unknown";
            }
        }
    }
}
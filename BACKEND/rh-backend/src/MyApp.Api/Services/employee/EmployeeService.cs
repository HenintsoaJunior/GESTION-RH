using Microsoft.Extensions.Caching.Memory;
using MyApp.Api.Entities.employee;
using MyApp.Api.Models.dto.employee;
using MyApp.Api.Repositories.employee;
using MyApp.Api.Utils.csv;
using MyApp.Api.Utils.generator;
using MyApp.Api.Data;
using System.Collections.Concurrent;

namespace MyApp.Api.Services.employee
{
    public interface IEmployeeService
    {
        Task<Employee> VerifyEmployeeExistsAsync(string code);
        Task<List<string>?> CheckNameAndCode(List<List<string>> DataExcel);
        Task<(IEnumerable<Employee>, int)> SearchAsync(EmployeeSearchFiltersDTO filters, int page, int pageSize);
        Task<IEnumerable<Employee>> GetAllAsync();
        Task<Employee?> GetByIdAsync(string id);
        Task<IEnumerable<Employee>> GetByGenderAsync(string genderId);
        Task<Employee> AddAsync(EmployeeFormDTO dto);
        Task UpdateAsync(string id, EmployeeFormDTO employeeForm);
        Task DeleteAsync(string id);
        Task<EmployeeStats> GetStatisticsAsync();
        Task<IEnumerable<Employee>> GetAllEmployeeSimpleAsync();
        Task<IEnumerable<Employee>> GetByMatriculeSimpleAsync(string[] matricules);
    }

    public class EmployeeService : IEmployeeService
    {
        private readonly IEmployeeRepository _repository;
        private readonly AppDbContext _context;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly ILogger<EmployeeService> _logger;
        private readonly IMemoryCache _cache;
        private static readonly ConcurrentDictionary<string, SemaphoreSlim> _cacheLocks = new();
        private const string AllEmployeesCacheKey = "AllEmployees";
        private const string AllEmployeesCacheKey_Lock = "AllEmployees_Lock";
        private static readonly TimeSpan CacheExpiration = TimeSpan.FromHours(1); // Ajustable ; long car données rarement modifiées
        private static readonly TimeSpan CacheSlidingExpiration = TimeSpan.FromMinutes(30); // Refresh si accédé souvent

        public EmployeeService(
            IEmployeeRepository repository,
            AppDbContext context,
            ISequenceGenerator sequenceGenerator,
            ILogger<EmployeeService> logger,
            IMemoryCache cache)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _sequenceGenerator = sequenceGenerator ?? throw new ArgumentNullException(nameof(sequenceGenerator));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _cache = cache ?? throw new ArgumentNullException(nameof(cache));
        }
  
        // check si le matricule se trouve dans la base
        public async Task<Employee> VerifyEmployeeExistsAsync(string code)
        {
            var filters = new EmployeeSearchFiltersDTO
            {
                EmployeeCode = code
            };
            Console.WriteLine("Code "+ filters.EmployeeCode);
            var (result, _) = await _repository.SearchAsync(filters, 1, 1);
            var employee = result?.FirstOrDefault();
            return employee ?? throw new Exception("Employee inexistant");
        }

        // check si le nom et le matricule sont tous les meme pour chaque ligne
        public async Task<List<string>?> CheckNameAndCode(List<List<string>>? dataExcel)
        {
            var errors = new List<string>();

            if (!CSVReader.HasMinimumRows(dataExcel))
            {
                errors.Add("1:1 => Le fichier est vide ou ne contient pas assez de lignes.");
                return errors;
            }

            var header = dataExcel![0];
            int nameIndex = CSVReader.GetColumnIndex(header, "nom");
            int codeIndex = CSVReader.GetColumnIndex(header, "matricule");

            if (nameIndex == -1 || codeIndex == -1)
            {
                errors.Add("1:1 => Colonnes 'Nom' et/ou 'Matricule' introuvables.");
                return errors;
            }

            var codeNameMap = new Dictionary<string, string>();

            for (int i = 1; i < dataExcel.Count; i++)
            {
                var row = dataExcel[i];

                if (!CSVReader.HasSufficientColumns(row, nameIndex, codeIndex))
                {
                    errors.Add($"{i + 1}:1 => Ligne incomplète (manque nom ou matricule).");
                    continue;
                }

                string code = row[codeIndex].Trim();
                string name = row[nameIndex].Trim();

                CSVReader.ValidatePresence(code, "Matricule/code", i + 1, codeIndex + 1, errors);
                CSVReader.ValidatePresence(name, "Nom", i + 1, nameIndex + 1, errors);
                CSVReader.CheckDuplicate(codeNameMap, code, name, i + 1, codeIndex + 1, errors);
            }

            return await Task.FromResult(errors);
        }


        public async Task<(IEnumerable<Employee>, int)> SearchAsync(EmployeeSearchFiltersDTO filters, int page, int pageSize)
        {
            try
            {
                _logger.LogInformation("Recherche paginée des employés avec filtres");
                return await _repository.SearchAsync(filters, page, pageSize);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la recherche paginée des employés");
                throw;
            }
        }

        public async Task<IEnumerable<Employee>> GetAllAsync()
        {
            try
            {
                if (_cache.TryGetValue(AllEmployeesCacheKey, out IEnumerable<Employee>? cachedEmployees))
                {
                    _logger.LogInformation("Récupération des employés depuis le cache");
                    return cachedEmployees!;
                }

                // Lock pour éviter les chargements concurrents multiples
                var semaphore = _cacheLocks.GetOrAdd(AllEmployeesCacheKey_Lock, _ => new SemaphoreSlim(1, 1));
                await semaphore.WaitAsync();

                try
                {
                    // Double-check après lock
                    if (!_cache.TryGetValue(AllEmployeesCacheKey, out cachedEmployees))
                    {
                        _logger.LogInformation("Récupération de tous les employés depuis la base de données (cache miss)");
                        cachedEmployees = await _repository.GetAllAsync();

                        // Cache avec expiration absolue et sliding
                        var cacheOptions = new MemoryCacheEntryOptions
                        {
                            AbsoluteExpirationRelativeToNow = CacheExpiration,
                            SlidingExpiration = CacheSlidingExpiration
                        };
                        _cache.Set(AllEmployeesCacheKey, cachedEmployees, cacheOptions);
                    }
                }
                finally
                {
                    semaphore.Release();
                }

                return cachedEmployees!;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des employés");
                throw;
            }
        }

        public async Task<IEnumerable<Employee>> GetAllEmployeeSimpleAsync()
        {
            try
            {
                _logger.LogInformation("Récupération simple de tous les employés (sans cache)");
                return await _repository.GetAllEmployeeSimpleAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération simple des employés");
                throw;
            }
        }

        public async Task<Employee?> GetByIdAsync(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    _logger.LogWarning("Tentative de récupération d'un employé avec un ID null ou vide");
                    return null;
                }

                _logger.LogInformation("Récupération de l'employé avec l'ID: {EmployeeId}", id);
                return await _repository.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de l'employé avec l'ID: {EmployeeId}", id);
                throw;
            }
        }

        public async Task<IEnumerable<Employee>> GetByGenderAsync(string genderId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(genderId))
                {
                    _logger.LogWarning("Tentative de récupération des employés avec un ID de genre null ou vide");
                    return Enumerable.Empty<Employee>();
                }

                _logger.LogInformation("Récupération des employés par genre: {GenderId}", genderId);
                return await _repository.GetByGenderAsync(genderId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des employés par genre: {GenderId}", genderId);
                throw;
            }
        }

        public async Task<IEnumerable<Employee>> GetByMatriculeSimpleAsync(string[] matricules)
        {
            try
            {
                if (matricules == null || matricules.Length == 0)
                {
                    _logger.LogWarning("Tentative de récupération des employés avec matricules null ou vide");
                    return Enumerable.Empty<Employee>();
                }

                _logger.LogInformation("Récupération des employés par matricules: {MatriculeCount}", matricules.Length);
                return await _repository.GetByMatriculeSimpleAsync(matricules) ?? Enumerable.Empty<Employee>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des employés par matricules");
                throw;
            }
        }

        public async Task<Employee> AddAsync(EmployeeFormDTO dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                if (dto == null)
                {
                    throw new ArgumentNullException(nameof(dto), "Le DTO employé ne peut pas être null");
                }

                var employeeId = _sequenceGenerator.GenerateSequence("seq_employee_id", "EMP", 6, "-");

                var employee = new Employee(dto) { EmployeeId = employeeId };

                await _repository.AddAsync(employee);
                await _repository.SaveChangesAsync();
                await transaction.CommitAsync();

                // Invalider le cache après ajout
                _cache.Remove(AllEmployeesCacheKey);
                _logger.LogInformation("Employé ajouté avec succès avec l'ID: {EmployeeId} (cache invalidé)", employee.EmployeeId);
                return employee;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Erreur lors de l'ajout de l'employé");
                throw;
            }
        }

        public async Task UpdateAsync(string id, EmployeeFormDTO employeeForm)
        {
            try
            {
                if (employeeForm == null)
                {
                    throw new ArgumentNullException(nameof(employeeForm), "Le formulaire employé ne peut pas être null");
                }

                if (string.IsNullOrWhiteSpace(id))
                {
                    throw new ArgumentException("L'ID de l'employé ne peut pas être null ou vide", nameof(id));
                }

                var existingEmployee = await _repository.GetByIdAsync(id);
                if (existingEmployee == null)
                {
                    throw new ArgumentException("L'employé n'existe pas", nameof(id));
                }
                _repository.Detach(existingEmployee);
                
                var employee = new Employee(employeeForm);
                employee.EmployeeId = id;
                
                await _repository.UpdateAsync(employee);
                await _repository.SaveChangesAsync();

                // Invalider le cache après mise à jour
                _cache.Remove(AllEmployeesCacheKey);
                _logger.LogInformation("Employé mis à jour avec succès pour l'ID: {EmployeeId} (cache invalidé)", id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour de l'employé avec l'ID: {EmployeeId}", id);
                throw;
            }
        }

        public async Task DeleteAsync(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    throw new ArgumentException("L'ID de l'employé ne peut pas être null ou vide", nameof(id));
                }

                await _repository.DeleteAsync(id);
                await _repository.SaveChangesAsync();

                // Invalider le cache après suppression
                _cache.Remove(AllEmployeesCacheKey);
                _logger.LogInformation("Employé supprimé avec succès pour l'ID: {EmployeeId} (cache invalidé)", id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression de l'employé avec l'ID: {EmployeeId}", id);
                throw;
            }
        }

        public async Task<EmployeeStats> GetStatisticsAsync()
        {
            try
            {
                _logger.LogInformation("Récupération des statistiques des employés");
                return await _repository.GetStatisticsAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des statistiques des employés");
                throw;
            }
        }
    }
}
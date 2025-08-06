using Microsoft.Extensions.Logging;
using MyApp.Api.Entities.employee;
using MyApp.Api.Models.form.employee;
using MyApp.Api.Models.search.employee;
using MyApp.Api.Repositories.employee;
using MyApp.Api.Utils.generator;
using MyApp.Utils.csv;

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
        Task<IEnumerable<Employee>> GetByStatusAsync(string status);
        Task AddAsync(EmployeeFormDTO employeeForm);
        Task UpdateAsync(string id, EmployeeFormDTO employeeForm);
        Task DeleteAsync(string id);
        Task<EmployeeStats> GetStatisticsAsync();
    }

    public class EmployeeService : IEmployeeService
    {
        private readonly IEmployeeRepository _repository;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly ILogger<EmployeeService> _logger;

        public EmployeeService(
            IEmployeeRepository repository,
            ISequenceGenerator sequenceGenerator,
            ILogger<EmployeeService> logger)
        {
            _repository = repository;
            _sequenceGenerator = sequenceGenerator;
            _logger = logger;
        }
  
        // check si le matricule se trouve dans la base
        public async Task<Employee> VerifyEmployeeExistsAsync(string code)
        {
            var filters = new EmployeeSearchFiltersDTO
            {
                EmployeeCode = code
            };
            var (result, total) = await _repository.SearchAsync(filters, 1, 1);
            if (result == null)
            {
                throw new Exception("Employee inexistant");
            }
            return (Employee)result;
        }

        // check si le nom et le matricule sont tous les meme pour chaque ligne
        public async Task<List<string>?> CheckNameAndCode(List<List<string>> dataExcel)
        {
            var errors = new List<string>();

            if (!CSVReader.HasMinimumRows(dataExcel))
            {
                errors.Add("1:1 => Le fichier est vide ou ne contient pas assez de lignes.");
                return errors;
            }

            var header = dataExcel[0];
            int nameIndex = CSVReader.GetColumnIndex(header, "Bénéficiaire");
            int codeIndex = CSVReader.GetColumnIndex(header, "matricule", "code");

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
                _logger.LogInformation("Récupération de tous les employés");
                return await _repository.GetAllAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des employés");
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

        public async Task<IEnumerable<Employee>> GetByStatusAsync(string status)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(status))
                {
                    _logger.LogWarning("Tentative de récupération des employés avec un statut null ou vide");
                    return Enumerable.Empty<Employee>();
                }

                _logger.LogInformation("Récupération des employés par statut: {Status}", status);
                return await _repository.GetByStatusAsync(status);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des employés par statut: {Status}", status);
                throw;
            }
        }

        public async Task AddAsync(EmployeeFormDTO employeeForm)
        {
            try
            {
                if (employeeForm == null)
                {
                    throw new ArgumentNullException(nameof(employeeForm), "Le formulaire employé ne peut pas être null");
                }

                var employee = new Employee(employeeForm);
                employee.EmployeeId = _sequenceGenerator.GenerateSequence("seq_employee_id", "EMP", 6, "-");
                _logger.LogInformation("ID généré pour l'employé: {EmployeeId}", employee.EmployeeId);

                await _repository.AddAsync(employee);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Employé ajouté avec succès avec l'ID: {EmployeeId}", employee.EmployeeId);
            }
            catch (Exception ex)
            {
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

                _logger.LogInformation("Employé mis à jour avec succès pour l'ID: {EmployeeId}", id);
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

                _logger.LogInformation("Employé supprimé avec succès pour l'ID: {EmployeeId}", id);
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
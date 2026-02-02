using System.Globalization;
using System.Text;
using CsvHelper;
using CsvHelper.Configuration;
using MyApp.Api.Models.dto.import;
using MyApp.Api.Models.dto.tmp; 
using MyApp.Api.Services.tmp; 
using MyApp.Api.Entities.site;
using MyApp.Api.Services.site; 
using MyApp.Api.Models.dto.site; 
using MyApp.Api.Entities.employee;
using MyApp.Api.Services.employee;
using MyApp.Api.Models.dto.employee;
using MyApp.Api.Entities.contract;
using MyApp.Api.Services.contract;
using MyApp.Api.Models.dto.contract;
using MyApp.Api.Entities.direction;
using MyApp.Api.Services.direction;
using MyApp.Api.Models.dto.direction;

namespace MyApp.Api.Services.import
{
    public interface IImportService
    {
        Task<ImportResult> ProcessEmployeeCsvAsync(Stream fileStream, string fileName);
        Task<IEnumerable<Site>> GetDistinctSitesAsync();
        Task<IEnumerable<Gender>> GetDistinctGendersAsync();
        Task<IEnumerable<Nationality>> GetDistinctNationalitiesAsync();
        Task<IEnumerable<ContractType>> GetDistinctContractTypesAsync();
        Task<IEnumerable<EmployeeCategory>> GetDistinctEmployeeCategoriesAsync();
        Task<IEnumerable<Direction>> GetDistinctDirectionsAsync();
        Task<IEnumerable<Department>> GetDistinctDepartmentsAsync();
        Task<IEnumerable<Service>> GetDistinctServicesAsync();
        Task<IEnumerable<Unit>> GetDistinctUnitsAsync();
        Task<IEnumerable<Employee>> GetDistinctEmployeesAsync();
    }

    public class ImportService : IImportService
    {
        private readonly ILogger<ImportService> _logger;
        private readonly ITmpEmployeeService _tmpEmployeeService; 
        private readonly ISiteService _siteService;
        private readonly IGenderService _genderService;
        private readonly INationalityService _nationalityService;
        private readonly IContractTypeService _contractTypeService;
        private readonly IEmployeeCategoryService _employeeCategoryService;
        private readonly IDirectionService _directionService;
        private readonly IDepartmentService _departmentService;
        private readonly IServiceService _serviceService;
        private readonly IUnitService _unitService;
        private readonly IEmployeeService _employeeService;
        private readonly ICategoriesOfEmployeeService _categoriesOfEmployeeService;

        public ImportService(
            ILogger<ImportService> logger,
            ITmpEmployeeService tmpEmployeeService,
            ISiteService siteService,
            IGenderService genderService,
            INationalityService nationalityService,
            IContractTypeService contractTypeService,
            IEmployeeCategoryService employeeCategoryService,
            IDirectionService directionService,
            IDepartmentService departmentService,
            IServiceService serviceService,
            IUnitService unitService,
            IEmployeeService employeeService,
            ICategoriesOfEmployeeService categoriesOfEmployeeService)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _tmpEmployeeService = tmpEmployeeService ?? throw new ArgumentNullException(nameof(tmpEmployeeService));
            _siteService = siteService ?? throw new ArgumentNullException(nameof(siteService));
            _genderService = genderService ?? throw new ArgumentNullException(nameof(genderService));
            _nationalityService = nationalityService ?? throw new ArgumentNullException(nameof(nationalityService));
            _contractTypeService = contractTypeService ?? throw new ArgumentNullException(nameof(contractTypeService));
            _employeeCategoryService = employeeCategoryService ?? throw new ArgumentNullException(nameof(employeeCategoryService));
            _directionService = directionService ?? throw new ArgumentNullException(nameof(directionService));
            _departmentService = departmentService ?? throw new ArgumentNullException(nameof(departmentService));
            _serviceService = serviceService ?? throw new ArgumentNullException(nameof(serviceService));
            _unitService = unitService ?? throw new ArgumentNullException(nameof(unitService));
            _employeeService = employeeService ?? throw new ArgumentNullException(nameof(employeeService));
            _categoriesOfEmployeeService = categoriesOfEmployeeService ?? throw new ArgumentNullException(nameof(categoriesOfEmployeeService));
        }

        public async Task<ImportResult> ProcessEmployeeCsvAsync(Stream fileStream, string fileName)
        {
            try
            {
                _logger.LogInformation("Starting CSV processing for file: {FileName}", fileName);

                var result = new ImportResult
                {
                    FileName = fileName
                };

                using (var reader = new StreamReader(fileStream, Encoding.UTF8))
                using (var csv = new CsvReader(reader, new CsvConfiguration(CultureInfo.InvariantCulture)
                {
                    Delimiter = ";",
                    HasHeaderRecord = true,
                    MissingFieldFound = null,
                    BadDataFound = null,
                    TrimOptions = TrimOptions.Trim,
                    IgnoreBlankLines = true
                }))
                {
                    await csv.ReadAsync();
                    csv.ReadHeader();
                    var headers = csv.HeaderRecord;

                    if (headers == null || headers.Length == 0)
                    {
                        throw new InvalidOperationException("CSV file has no headers");
                    }

                    result.Headers = headers.ToList();
                    int rowNumber = 1;
                    while (await csv.ReadAsync())
                    {
                        var record = new Dictionary<string, string>();

                        foreach (var header in headers)
                        {
                            record[header] = csv.GetField(header) ?? string.Empty;
                        }

                        var dto = new TmpEmployeeFormDTO
                        {
                            Site = record.ContainsKey("Site") ? record["Site"] : string.Empty,
                            //Mle = record.ContainsKey("Mle") ? ("0" + record["Mle"]).TrimStart('0') != "" ? "0" + record["Mle"] : string.Empty : string.Empty,
                            Mle = record.ContainsKey("Mle") && !string.IsNullOrEmpty(record["Mle"]?.ToString())
                            ? record["Mle"].ToString().PadLeft(5, '0')
                            : string.Empty,

                            Nom = record.ContainsKey("Nom") ? record["Nom"] : string.Empty,
                            Prenom = record.ContainsKey("Prénom") ? record["Prénom"] : string.Empty,
                            DateNaissance = DateTime.TryParse(record.ContainsKey("Date de naissance") ? record["Date de naissance"] : string.Empty, CultureInfo.InvariantCulture, DateTimeStyles.None, out var dn) ? dn : null,
                            LieuNaissance = record.ContainsKey("Lieu de naissance") ? record["Lieu de naissance"] : string.Empty,
                            NumeroCin = record.ContainsKey("Numéro CIN") ? record["Numéro CIN"] : string.Empty,
                            DateCin = DateTime.TryParse(record.ContainsKey("Date CIN") ? record["Date CIN"] : string.Empty, CultureInfo.InvariantCulture, DateTimeStyles.None, out var dc) ? dc : null,
                            LieuCin = record.ContainsKey("Lieu CIN") ? record["Lieu CIN"] : string.Empty,
                            Sexe = record.ContainsKey("Sexe") ? record["Sexe"] : string.Empty,
                            Nationalite = record.ContainsKey("Nationalité") ? record["Nationalité"] : string.Empty,
                            Telephone = record.ContainsKey("Téléphone") ? record["Téléphone"] : string.Empty,
                            DateAnciennete = DateTime.TryParse(record.ContainsKey("Date d'Ancienneté") ? record["Date d'Ancienneté"] : string.Empty, CultureInfo.InvariantCulture, DateTimeStyles.None, out var da) ? da : null,
                            TypeContrat = record.ContainsKey("Type Contrat") ? record["Type Contrat"] : string.Empty,
                            IntitulePoste = record.ContainsKey("Emploi occupé") ? record["Emploi occupé"] : string.Empty,
                            Categorie = record.ContainsKey("Catégorie") ? record["Catégorie"] : string.Empty,
                            Unite = record.ContainsKey("Unité") ? record["Unité"] : string.Empty,
                            Service = record.ContainsKey("Service") ? record["Service"] : string.Empty,
                            Department = record.ContainsKey("Département") ? record["Département"] : string.Empty,
                            Direction = record.ContainsKey("Direction") ? record["Direction"] : string.Empty,
                            DateFinContrat = DateTime.TryParse(record.ContainsKey("Date de fincontrat SAGE") ? record["Date de fincontrat SAGE"] : string.Empty, CultureInfo.InvariantCulture, DateTimeStyles.None, out var df) ? df : null
                        };

                        var tmpEmployee = await _tmpEmployeeService.CreateAsync(dto);
                        var tmpEmployeeId = tmpEmployee.TmpEmployeeId;
                        record["tmp_employee_id"] = tmpEmployeeId ?? string.Empty;

                        result.Employees.Add(new EmployeeRow
                        {
                            RowNumber = rowNumber,
                            Data = record
                        });

                        rowNumber++;
                    }

                    result.TotalRows = result.Employees.Count;
               }

                await GetDistinctSitesAsync();
                await GetDistinctGendersAsync();
                await GetDistinctNationalitiesAsync();
                await GetDistinctContractTypesAsync();
                await GetDistinctEmployeeCategoriesAsync();
                // await GetDistinctDirectionsAsync();
                // await GetDistinctDepartmentsAsync();
                // await GetDistinctServicesAsync();
                await GetDistinctUnitsAsync();
                // await GetDistinctEmployeesAsync();

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing CSV file: {FileName}", fileName);
                throw new InvalidOperationException($"Failed to process CSV file: {ex.Message}", ex);
            }
        }

        public async Task<IEnumerable<Site>> GetDistinctSitesAsync()
        {
            try
            {
                var tmpEmployees = await _tmpEmployeeService.GetAllAsync();

                var distinctSites = tmpEmployees
                    .Where(e => !string.IsNullOrWhiteSpace(e.Site))
                    .Select(e => e.Site)
                    .Distinct(StringComparer.OrdinalIgnoreCase) 
                    .ToList();

                var sites = new List<Site>();
                foreach (var site in distinctSites)
                {
                    var existingSite = await _siteService.GetByIdAsync(site!); 
                    if (existingSite != null)
                    {
                        sites.Add(existingSite);
                    }
                    else
                    {
                        var createDto = new CreateSiteDTO 
                        { 
                            Code = site!,
                            SiteName = site!
                        };
                        var newSite = await _siteService.AddAsync(createDto);
                        sites.Add(newSite);
                    }
                }

                return sites;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving distinct sites from temporary employees");
                throw new InvalidOperationException($"Failed to retrieve distinct sites: {ex.Message}", ex);
            }
        }

        public async Task<IEnumerable<Gender>> GetDistinctGendersAsync()
        {
            try
            {
                var tmpEmployees = await _tmpEmployeeService.GetAllAsync();

                var distinctSexes = tmpEmployees
                    .Where(e => !string.IsNullOrWhiteSpace(e.Sexe))
                    .Select(e => e.Sexe)
                    .Distinct(StringComparer.OrdinalIgnoreCase) 
                    .ToList();

                var genders = new List<Gender>();
                foreach (var sexe in distinctSexes)
                {
                    var existingGender = await _genderService.GetByIdAsync(sexe!); 
                    if (existingGender != null)
                    {
                        genders.Add(existingGender);
                    }
                    else
                    {
                        var createDto = new CreateGenderDTO 
                        { 
                            Code = sexe!,
                            Label = sexe!
                        };
                        var newGender = await _genderService.AddAsync(createDto);
                        genders.Add(newGender);
                    }
                }

                return genders;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving distinct genders from temporary employees");
                throw new InvalidOperationException($"Failed to retrieve distinct genders: {ex.Message}", ex);
            }
        }

        public async Task<IEnumerable<Nationality>> GetDistinctNationalitiesAsync()
        {
            try
            {
                var tmpEmployees = await _tmpEmployeeService.GetAllAsync();

                var distinctNationalites = tmpEmployees
                    .Where(e => !string.IsNullOrWhiteSpace(e.Nationalite))
                    .Select(e => e.Nationalite)
                    .Distinct(StringComparer.OrdinalIgnoreCase) 
                    .ToList();

                var nationalities = new List<Nationality>();
                foreach (var nationalite in distinctNationalites)
                {
                    var existingNationality = await _nationalityService.GetByIdAsync(nationalite!); 
                    if (existingNationality != null)
                    {
                        nationalities.Add(existingNationality);
                    }
                    else
                    {
                        var createDto = new CreateNationalityDTO 
                        { 
                            Code = nationalite!,
                            Name = nationalite!
                        };
                        var newNationality = await _nationalityService.AddAsync(createDto);
                        nationalities.Add(newNationality);
                    }
                }

                return nationalities;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving distinct nationalities from temporary employees");
                throw new InvalidOperationException($"Failed to retrieve distinct nationalities: {ex.Message}", ex);
            }
        }

        public async Task<IEnumerable<ContractType>> GetDistinctContractTypesAsync()
        {
            try
            {
                var tmpEmployees = await _tmpEmployeeService.GetAllAsync();

                var distinctContractTypes = tmpEmployees
                    .Where(e => !string.IsNullOrWhiteSpace(e.TypeContrat))
                    .Select(e => e.TypeContrat)
                    .Distinct(StringComparer.OrdinalIgnoreCase) 
                    .ToList();

                var contractTypes = new List<ContractType>();
                foreach (var typeContrat in distinctContractTypes)
                {
                    var existingContractType = await _contractTypeService.GetByIdAsync(typeContrat!); 
                    if (existingContractType != null)
                    {
                        contractTypes.Add(existingContractType);
                    }
                    else
                    {
                        var createDto = new CreateContractTypeDTO 
                        { 
                            Code = typeContrat!,
                            Label = typeContrat!
                        };
                        var newContractType = await _contractTypeService.AddAsync(createDto);
                        contractTypes.Add(newContractType);
                    }
                }

                return contractTypes;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving distinct contract types from temporary employees");
                throw new InvalidOperationException($"Failed to retrieve distinct contract types: {ex.Message}", ex);
            }
        }

        public async Task<IEnumerable<EmployeeCategory>> GetDistinctEmployeeCategoriesAsync()
        {
            try
            {
                var tmpEmployees = await _tmpEmployeeService.GetAllAsync();

                var distinctCategories = tmpEmployees
                    .Where(e => !string.IsNullOrWhiteSpace(e.Categorie))
                    .Select(e => e.Categorie)
                    .Distinct(StringComparer.OrdinalIgnoreCase) 
                    .ToList();

                var employeeCategories = new List<EmployeeCategory>();
                foreach (var categorie in distinctCategories)
                {
                    var existingCategory = await _employeeCategoryService.GetByIdAsync(categorie!); 
                    if (existingCategory != null)
                    {
                        employeeCategories.Add(existingCategory);
                    }
                    else
                    {
                        var createDto = new CreateEmployeeCategoryDTO 
                        { 
                            Code = categorie!,
                            Label = categorie!
                        };
                        var newCategory = await _employeeCategoryService.AddAsync(createDto);
                        employeeCategories.Add(newCategory);
                    }
                }

                return employeeCategories;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving distinct employee categories from temporary employees");
                throw new InvalidOperationException($"Failed to retrieve distinct employee categories: {ex.Message}", ex);
            }
        }

        public async Task<IEnumerable<Direction>> GetDistinctDirectionsAsync()
        {
            try
            {
                var tmpEmployees = await _tmpEmployeeService.GetAllAsync();

                var distinctDirections = tmpEmployees
                    .Where(e => !string.IsNullOrWhiteSpace(e.Direction))
                    .Select(e => e.Direction)
                    .Distinct(StringComparer.OrdinalIgnoreCase) 
                    .ToList();

                var directions = new List<Direction>();
                foreach (var direction in distinctDirections)
                {
                    var existingDirection = await _directionService.GetByIdAsync(direction!); 
                    if (existingDirection != null)
                    {
                        directions.Add(existingDirection);
                    }
                    else
                    {
                        var createDto = new DirectionDTOForm 
                        { 
                            DirectionName = direction!,
                            Acronym = direction!
                        };
                        var newDirection = await _directionService.AddAsync(createDto);
                        directions.Add(newDirection);
                    }
                }

                return directions;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving distinct directions from temporary employees");
                throw new InvalidOperationException($"Failed to retrieve distinct directions: {ex.Message}", ex);
            }
        }

        public async Task<IEnumerable<Department>> GetDistinctDepartmentsAsync()
        {
            try
            {
                var tmpEmployees = await _tmpEmployeeService.GetAllAsync();

                var distinctDepartments = tmpEmployees
                    .Where(e => !string.IsNullOrWhiteSpace(e.Department))
                    .Select(e => e.Department!)
                    .Distinct(StringComparer.OrdinalIgnoreCase) 
                    .ToList();

                var departmentToDirectionMap = tmpEmployees
                    .Where(e => !string.IsNullOrWhiteSpace(e.Department) && !string.IsNullOrWhiteSpace(e.Direction))
                    .ToLookup(e => e.Department!, e => e.Direction!, StringComparer.OrdinalIgnoreCase)
                    .ToDictionary(l => l.Key, l => l.First(), StringComparer.OrdinalIgnoreCase);

                var allDirections = await _directionService.GetAllAsync();
                var directionByName = allDirections.ToDictionary(
                    d => d.DirectionName, 
                    d => d, 
                    StringComparer.OrdinalIgnoreCase
                );

                var allDepartments = await _departmentService.GetAllAsync();
                var existingDepartmentByName = allDepartments.ToDictionary(
                    d => d.DepartmentName, 
                    d => d, 
                    StringComparer.OrdinalIgnoreCase
                );

                var departments = new List<Department>();
                foreach (var departmentName in distinctDepartments)
                {
                    if (existingDepartmentByName.TryGetValue(departmentName, out var existingDepartment))
                    {
                        departments.Add(existingDepartment);
                    }
                    else
                    {
                        if (departmentToDirectionMap.TryGetValue(departmentName, out var directionName))
                        {
                            if (directionByName.TryGetValue(directionName, out var direction))
                            {
                                var createDto = new DepartmentDTOForm 
                                { 
                                    DepartmentName = departmentName,
                                    DirectionId = direction.DirectionId
                                };
                                var newDepartment = await _departmentService.AddAsync(createDto);
                                departments.Add(newDepartment);
                            }
                            else
                            {
                                _logger.LogWarning("Skipping creation of department '{DepartmentName}' due to missing associated direction '{DirectionName}'", departmentName, directionName);
                            }
                        }
                        else
                        {
                            _logger.LogWarning("Skipping creation of department '{DepartmentName}' due to missing associated direction", departmentName);
                        }
                    }
                }

                return departments;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving distinct departments from temporary employees");
                throw new InvalidOperationException($"Failed to retrieve distinct departments: {ex.Message}", ex);
            }
        }

        public async Task<IEnumerable<Service>> GetDistinctServicesAsync()
        {
            try
            {
                var tmpEmployees = await _tmpEmployeeService.GetAllAsync();

                var distinctServices = tmpEmployees
                    .Where(e => !string.IsNullOrWhiteSpace(e.Service))
                    .Select(e => e.Service!)
                    .Distinct(StringComparer.OrdinalIgnoreCase) 
                    .ToList();

                var serviceToDepartmentMap = tmpEmployees
                    .Where(e => !string.IsNullOrWhiteSpace(e.Service) && !string.IsNullOrWhiteSpace(e.Department))
                    .ToLookup(e => e.Service!, e => e.Department!, StringComparer.OrdinalIgnoreCase)
                    .ToDictionary(l => l.Key, l => l.First(), StringComparer.OrdinalIgnoreCase);

                var allDepartments = await _departmentService.GetAllAsync();
                var departmentByName = allDepartments.ToDictionary(
                    d => d.DepartmentName, 
                    d => d, 
                    StringComparer.OrdinalIgnoreCase
                );

                var allServices = await _serviceService.GetAllAsync();
                var existingServiceByName = allServices.ToDictionary(
                    s => s.ServiceName, 
                    s => s, 
                    StringComparer.OrdinalIgnoreCase
                );

                var services = new List<Service>();
                foreach (var serviceName in distinctServices)
                {
                    if (existingServiceByName.TryGetValue(serviceName, out var existingService))
                    {
                        services.Add(existingService);
                    }
                    else
                    {
                        if (serviceToDepartmentMap.TryGetValue(serviceName, out var departmentName))
                        {
                            if (departmentByName.TryGetValue(departmentName, out var department))
                            {
                                var createDto = new ServiceDTOForm 
                                { 
                                    ServiceName = serviceName,
                                    DepartmentId = department.DepartmentId
                                };
                                var newService = await _serviceService.AddAsync(createDto);
                                services.Add(newService);
                            }
                            else
                            {
                                _logger.LogWarning("Skipping creation of service '{ServiceName}' due to missing associated department '{DepartmentName}'", serviceName, departmentName);
                            }
                        }
                        else
                        {
                            _logger.LogWarning("Skipping creation of service '{ServiceName}' due to missing associated department", serviceName);
                        }
                    }
                }

                return services;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving distinct services from temporary employees");
                throw new InvalidOperationException($"Failed to retrieve distinct services: {ex.Message}", ex);
            }
        }

        public async Task<IEnumerable<Unit>> GetDistinctUnitsAsync()
{
    try
    {
        var tmpEmployees = await _tmpEmployeeService.GetAllAsync();
        var allServices  = await _serviceService.GetAllAsync();
        var allUnits     = await _unitService.GetAllAsync();

        // Unités distinctes depuis le CSV
        var distinctUnits = tmpEmployees
            .Where(e => !string.IsNullOrWhiteSpace(e.Unite))
            .Select(e => e.Unite!)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        var units = new List<Unit>();

        foreach (var unitName in distinctUnits)
        {
            // 1️⃣ Si l’unité existe déjà → on la réutilise
            var existingUnit = allUnits.FirstOrDefault(u =>
                u.UnitName.Equals(unitName, StringComparison.OrdinalIgnoreCase));

            if (existingUnit != null)
            {
                units.Add(existingUnit);
                continue;
            }

            // 2️⃣ Trouver une ligne CSV correspondant à cette unité
            var employee = tmpEmployees.FirstOrDefault(e =>
                !string.IsNullOrWhiteSpace(e.Unite) &&
                !string.IsNullOrWhiteSpace(e.Service) &&
                e.Unite.Equals(unitName, StringComparison.OrdinalIgnoreCase));

            if (employee == null)
            {
                _logger.LogWarning(
                    "Skipping creation of unit '{UnitName}' due to missing service information",
                    unitName
                );
                continue;
            }

            // 3️⃣ Trouver le service correspondant
            // ⚠️ Ici on accepte plusieurs services portant le même nom
            // → on prend le premier trouvé (logique métier actuelle)
            var service = allServices.FirstOrDefault(s =>
                s.ServiceName.Equals(employee.Service, StringComparison.OrdinalIgnoreCase));

            if (service == null)
            {
                _logger.LogWarning(
                    "Skipping creation of unit '{UnitName}' due to missing service '{ServiceName}'",
                    unitName,
                    employee.Service
                );
                continue;
            }

            // 4️⃣ Créer l’unité
            var createDto = new UnitDTOForm
            {
                UnitName  = unitName,
                ServiceId = service.ServiceId
            };

            var newUnit = await _unitService.AddAsync(createDto);
            units.Add(newUnit);
        }

        return units;
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error retrieving distinct units from temporary employees");
        throw new InvalidOperationException(
            $"Failed to retrieve distinct units: {ex.Message}",
            ex
        );
    }
}


public async Task<IEnumerable<Employee>> GetDistinctEmployeesAsync()
{
    string Clean(string? v) => v?.Trim() ?? string.Empty;

    try
    {
        var tmpEmployees = await _tmpEmployeeService.GetAllAsync();

        var distinctEmployees = tmpEmployees
            .Where(e => !string.IsNullOrWhiteSpace(e.Mle))
            .GroupBy(e => Clean(e.Mle), StringComparer.OrdinalIgnoreCase)
            .Select(g => g.First())
            .ToList();

        var sites       = await _siteService.GetAllAsync();
        var genders     = await _genderService.GetAllAsync();
        var directions  = await _directionService.GetAllAsync();
        var contracts   = await _contractTypeService.GetAllAsync();
        var departments = await _departmentService.GetAllAsync();
        var services    = await _serviceService.GetAllAsync();
        var units       = await _unitService.GetAllAsync();
        var categories  = await _employeeCategoryService.GetAllAsync();

        var created = new List<Employee>();

        foreach (var t in distinctEmployees)
        {
            try
            {
                var mle  = Clean(t.Mle);
                var nom  = Clean(t.Nom);
                var site = Clean(t.Site);
                var sexe = Clean(t.Sexe);
                var dir  = Clean(t.Direction);

                if (string.IsNullOrEmpty(nom) ||
                    string.IsNullOrEmpty(site) ||
                    string.IsNullOrEmpty(sexe) ||
                    string.IsNullOrEmpty(dir))
                {
                    _logger.LogWarning(
                        "⛔ SKIP {Mle} - missing required fields (Nom/Site/Sexe/Direction)",
                        mle
                    );
                    continue;
                }

                var siteEntity = sites.FirstOrDefault(s =>
                    s.Code.Equals(site, StringComparison.OrdinalIgnoreCase));

                if (siteEntity == null)
                {
                    _logger.LogError("⛔ SKIP {Mle} - Site '{Site}' not found", mle, site);
                    continue;
                }

                var genderEntity = genders.FirstOrDefault(g =>
                    g.Code.Equals(sexe, StringComparison.OrdinalIgnoreCase));

                if (genderEntity == null)
                {
                    _logger.LogError("⛔ SKIP {Mle} - Gender '{Sexe}' not found", mle, sexe);
                    continue;
                }

                var directionEntity = directions.FirstOrDefault(d =>
                    d.DirectionName.Equals(dir, StringComparison.OrdinalIgnoreCase));

                if (directionEntity == null)
                {
                    _logger.LogError("⛔ SKIP {Mle} - Direction '{Direction}' not found", mle, dir);
                    continue;
                }

                var contractEntity = !string.IsNullOrWhiteSpace(t.TypeContrat)
                    ? contracts.FirstOrDefault(c =>
                        c.Code.Equals(Clean(t.TypeContrat), StringComparison.OrdinalIgnoreCase))
                    : null;

                var departmentEntity = !string.IsNullOrWhiteSpace(t.Department)
                    ? departments.FirstOrDefault(d =>
                        d.DepartmentName.Equals(Clean(t.Department), StringComparison.OrdinalIgnoreCase))
                    : null;

                var serviceEntity = !string.IsNullOrWhiteSpace(t.Service)
                    ? services.FirstOrDefault(s =>
                        s.ServiceName.Equals(Clean(t.Service), StringComparison.OrdinalIgnoreCase))
                    : null;

                var unitEntity = !string.IsNullOrWhiteSpace(t.Unite)
                    ? units.FirstOrDefault(u =>
                        u.UnitName.Equals(Clean(t.Unite), StringComparison.OrdinalIgnoreCase))
                    : null;

                var dto = new EmployeeFormDTO
                {
                    EmployeeCode   = mle,
                    LastName       = nom,
                    FirstName      = Clean(t.Prenom),
                    Category       = Clean(t.Categorie),
                    BirthDate      = t.DateNaissance,
                    BirthPlace     = Clean(t.LieuNaissance),
                    IdNumber       = Clean(t.NumeroCin),
                    IdIssueDate    = t.DateCin,
                    IdIssuePlace   = Clean(t.LieuCin),
                    PhoneNumber    = Clean(t.Telephone),
                    HireDate       = t.DateAnciennete,
                    JobTitle       = Clean(t.IntitulePoste),
                    ContractEndDate= t.DateFinContrat,

                    SiteId         = siteEntity.SiteId,
                    GenderId       = genderEntity.GenderId,
                    DirectionId    = directionEntity.DirectionId,
                    ContractTypeId = contractEntity?.ContractTypeId,
                    DepartmentId   = departmentEntity?.DepartmentId,
                    ServiceId      = serviceEntity?.ServiceId,
                    UnitId         = unitEntity?.UnitId
                };

                var emp = await _employeeService.AddAsync(dto);
                created.Add(emp);

                _logger.LogInformation("✅ CREATED employee {Mle}", mle);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "🔥 ERROR creating employee {Mle}", t.Mle);
            }
        }

        _logger.LogWarning("🎯 EMPLOYEE IMPORT DONE - Created: {Count}", created.Count);
        return created;
    }
    catch (Exception ex)
    {
        _logger.LogCritical(ex, "💥 EMPLOYEE IMPORT FAILED");
        throw;
    }
}


    }
}
using System.Globalization;
using System.Text;
using CsvHelper;
using CsvHelper.Configuration;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using MyApp.Api.Data;
using MyApp.Api.Entities.direction;
using MyApp.Api.Models.dto.direction;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Services.import;

public interface IOrgImportService
{
    Task<CustomImportResult> ImportCsvAsync(Stream csvStream);
}

public class OrgImportService : IOrgImportService
{
    private readonly ILogger<OrgImportService> _logger;
    private readonly AppDbContext _context;
    private readonly ISequenceGenerator _seqGenerator;

    public OrgImportService(ILogger<OrgImportService> log, AppDbContext context, ISequenceGenerator sequenceService)
    {
        _logger = log;
        _context = context;
        _seqGenerator = sequenceService;
    }

    public async Task<CustomImportResult> ImportCsvAsync(Stream csvStream)
{
    int totalRows = 0;
    int directionsInserted = 0;
    int departmentsInserted = 0;
    int servicesInserted = 0;

    using var reader = new StreamReader(csvStream, Encoding.UTF8);
    var config = new CsvConfiguration(CultureInfo.InvariantCulture)
    {
        HasHeaderRecord = true,
        Delimiter = ";",
        MissingFieldFound = null,
        HeaderValidated = null,
        BadDataFound = null,
        TrimOptions = TrimOptions.Trim
    };

    using var csv = new CsvReader(reader, config);

    // 🔹 DTO CSV
    var records = csv.GetRecords<OrgCsvRow>().ToList();

    // 🔹 Chargement DB en mémoire (ANTI DOUBLONS)
    var existingDirections = await _context.Directions
        .ToDictionaryAsync(
            d => d.DirectionName.ToLower(),
            d => d
        );

    var existingDepartments = await _context.Departments
        .ToDictionaryAsync(
            d => (d.DirectionId, d.DepartmentName.ToLower()),
            d => d
        );

    var existingServices = await _context.Services
        .ToDictionaryAsync(
            s => (s.DepartmentId, s.ServiceName.ToLower()),
            s => s
        );

    foreach (var record in records)
    {
        totalRows++;

        if (string.IsNullOrWhiteSpace(record.DIRECTIONNAME))
            continue;

        string directionNameKey = record.DIRECTIONNAME.Trim().ToLower();
        string? directionAcronym = record.DIRECTION?.Trim();

        // ------------------ Direction ------------------
        if (!existingDirections.TryGetValue(directionNameKey, out var direction))
        {
            direction = new Direction
            {
                DirectionId = _seqGenerator.GenerateSequence("seq_direction_id", "DIR"),
                DirectionName = record.DIRECTIONNAME.Trim(),
                Acronym = directionAcronym,
                IsActive = true
            };

            _context.Directions.Add(direction);
            existingDirections.Add(directionNameKey, direction);
            directionsInserted++;
        }

        // ------------------ Department ------------------
        Department? department = null;
        if (!string.IsNullOrWhiteSpace(record.DEPARTEMENT))
        {
            string deptKeyName = record.DEPARTEMENT.Trim().ToLower();
            var deptKey = (direction.DirectionId, deptKeyName);

            if (!existingDepartments.TryGetValue(deptKey, out department))
            {
                department = new Department
                {
                    DepartmentId = _seqGenerator.GenerateSequence("seq_department_id", "DEP"),
                    DepartmentName = record.DEPARTEMENT.Trim(),
                    DirectionId = direction.DirectionId,
                    IsActive = true
                };

                _context.Departments.Add(department);
                existingDepartments.Add(deptKey, department);
                departmentsInserted++;
            }
        }

        // ------------------ Service ------------------
        if (department != null && !string.IsNullOrWhiteSpace(record.SERVICE))
        {
            string serviceKeyName = record.SERVICE.Trim().ToLower();
            var serviceKey = (department.DepartmentId, serviceKeyName);

            if (!existingServices.ContainsKey(serviceKey))
            {
                var service = new Service
                {
                    ServiceId = _seqGenerator.GenerateSequence("seq_service_id", "SER"),
                    ServiceName = record.SERVICE.Trim(),
                    DepartmentId = department.DepartmentId,
                    IsActive = true
                };

                _context.Services.Add(service);
                existingServices.Add(serviceKey, service);
                servicesInserted++;
            }
        }
    }

    // 🔹 Sauvegarde UNIQUE
    await _context.SaveChangesAsync();

    return new CustomImportResult
    {
        TotalRows = totalRows,
        DirectionsInserted = directionsInserted,
        DepartmentsInserted = departmentsInserted,
        ServicesInserted = servicesInserted
    };
}

}

// --- DTO pour le retour ---
public class CustomImportResult
{
    public int TotalRows { get; set; }
    public int DirectionsInserted { get; set; }
    public int DepartmentsInserted { get; set; }
    public int ServicesInserted { get; set; }
}


public class OrgCsvRow
{
    public string? DIRECTION { get; set; }
    public string? DIRECTIONNAME { get; set; }
    public string? DEPARTEMENT { get; set; }
    public string? SERVICE { get; set; }
}

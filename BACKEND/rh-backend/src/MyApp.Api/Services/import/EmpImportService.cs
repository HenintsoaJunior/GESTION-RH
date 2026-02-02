using System.Globalization;
using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.employee;

namespace MyApp.Api.Services.import;

public interface IEmpImportService
{
    Task<ImportEmployeeResult> ImportEmployeesAsync(Stream csvStream);
}

public class ImportEmployeeResult
{
    public int TotalRows { get; set; }
    public int Inserted { get; set; }
    public List<string> Errors { get; set; } = new();
}


public class EmpImportService : IEmpImportService
{
    private readonly AppDbContext _context;
    private readonly ILogger<EmpImportService> _logger;

    public EmpImportService(AppDbContext context, ILogger<EmpImportService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<ImportEmployeeResult> ImportEmployeesAsync(Stream csvStream)
    {
        var result = new ImportEmployeeResult();

        using var reader = new StreamReader(csvStream);
        await reader.ReadLineAsync(); // header

        while (!reader.EndOfStream)
        {
            var line = await reader.ReadLineAsync();
            if (string.IsNullOrWhiteSpace(line)) continue;

            result.TotalRows++;

            try
            {
                var cols = line.Split(';');
                if (cols.Length < 14)
                    throw new Exception("Invalid column count");

                // ============================
                // LOOKUPS
                // ============================
                var site = await _context.Sites
                    .FirstOrDefaultAsync(s => s.Code == cols[3]);

                var direction = await _context.Directions
                    .FirstOrDefaultAsync(d =>
                        d.DirectionName.ToLower().Equals(cols[7].ToLower()) ||
                        d.Acronym!.ToLower().Equals(cols[8].ToLower()));

                var department = await _context.Departments
                    .FirstOrDefaultAsync(d =>
                        d.DepartmentName.ToLower().Equals(cols[6].ToLower()));

                var service = await _context.Services
                    .FirstOrDefaultAsync(s =>
                        s.ServiceName.ToLower().Equals(cols[5].ToLower()));

                var unit = await _context.Units
                    .FirstOrDefaultAsync(u =>
                        u.UnitName.ToLower().Equals(cols[5].ToLower()));

                var genderValue = cols[12].Trim().ToLower();
                var gender = await _context.Genders
                    .FirstOrDefaultAsync(g =>
                        g.Label.ToLower().Contains(genderValue.Substring(0, 3)));

                var contractType = await _context.ContractTypes
                    .FirstOrDefaultAsync(c =>
                        c.Label.ToLower().Equals(cols[11].ToLower()));

                if (site == null || direction == null || gender == null)
                    throw new Exception("Missing required foreign key");

                // ============================
                // EMPLOYEE CREATION
                // ============================
                var employee = new Employee
                {
                    EmployeeId = Guid.NewGuid().ToString(),
                    EmployeeCode = "0"+cols[0].Trim(),
                    LastName = cols[1].Trim(),
                    FirstName = cols[2].Trim(),
                    JobTitle = cols[4].Trim(),

                    HireDate = ParseDate(cols[9]),
                    ContractEndDate = ParseDate(cols[10]),

                    Category = "A",
                    Status = "Active",

                    SiteId = site.SiteId,
                    GenderId = gender.GenderId,
                    ContractTypeId = contractType?.ContractTypeId,
                    DirectionId = direction.DirectionId,
                    DepartmentId = department?.DepartmentId,
                    ServiceId = service?.ServiceId,
                    UnitId = unit?.UnitId
                };

                _context.Employees.Add(employee);
                result.Inserted++;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error importing line {Line}", line);
                result.Errors.Add($"Line {result.TotalRows}: {ex.Message}");
            }
        }

        await _context.SaveChangesAsync();
        return result;
    }

    private DateTime? ParseDate(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return null;

        if (DateTime.TryParseExact(
            value.Trim(),
            "dd/MM/yyyy",
            CultureInfo.InvariantCulture,
            DateTimeStyles.None,
            out var date))
        {
            return date;
        }

        return null;
    }
}

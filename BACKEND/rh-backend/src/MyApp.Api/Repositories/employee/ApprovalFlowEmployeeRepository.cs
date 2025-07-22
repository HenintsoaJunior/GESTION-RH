using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.recruitment;
using MyApp.Api.Models.classes.recruitment;

namespace MyApp.Api.Repositories.recruitment
{
    public interface IApprovalFlowEmployeeRepository
    {
        Task<IEnumerable<ApprovalFlowEmployee>> GetAllGroupedByApproverRoleWithActiveEmployeesAsync();
        Task<IEnumerable<ApprovalFlowEmployee>> GetAllAsync();
        Task<IEnumerable<ApprovalFlowEmployee>> GetByEmployeeIdAsync(string employeeId);
        Task<IEnumerable<ApprovalFlowEmployee>> GetByApprovalFlowIdAsync(string approvalFlowId);
        Task AddAsync(ApprovalFlowEmployee entity);
        Task AddRangeAsync(IEnumerable<ApprovalFlowEmployee> entities);
        Task DeleteAsync(string employeeId, string approvalFlowId);
        Task SaveChangesAsync();
    }
    
    public class ApprovalFlowEmployeeRepository : IApprovalFlowEmployeeRepository
    {
        private readonly AppDbContext _context;

        public ApprovalFlowEmployeeRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ApprovalFlowEmployee>> GetAllGroupedByApproverRoleWithActiveEmployeesAsync()
        {
            // Récupérer d'abord toutes les données nécessaires
            var allApprovalFlowEmployees = await _context.ApprovalFlowEmployees
                .Include(a => a.Employee)
                .Include(a => a.ApprovalFlow)
                .Where(a => a.Employee != null && 
                           a.Employee.Status == "Actif" && 
                           a.ApprovalFlow != null)
                .ToListAsync();

            // Effectuer le groupement et la sélection en mémoire
            var result = allApprovalFlowEmployees
                .GroupBy(a => a.ApprovalFlow!.ApproverRole)
                .Select(g => g.OrderBy(a => a.ApprovalFlow!.ApprovalOrder).First())
                .OrderBy(a => a.ApprovalFlow!.ApprovalOrder)
                .ToList();

            return result;
        }

        // Alternative plus optimisée si vous voulez éviter de charger toutes les données
        public async Task<IEnumerable<ApprovalFlowEmployee>> GetAllGroupedByApproverRoleWithActiveEmployeesOptimizedAsync()
        {
            // Utiliser une requête SQL brute si nécessaire
            var sql = @"
                SELECT DISTINCT afe.EmployeeId, afe.ApprovalFlowId
                FROM ApprovalFlowEmployees afe
                INNER JOIN Employees e ON afe.EmployeeId = e.EmployeeId
                INNER JOIN ApprovalFlows af ON afe.ApprovalFlowId = af.ApprovalFlowId
                WHERE e.Status = 'Actif'
                AND afe.ApprovalFlowId IN (
                    SELECT af2.ApprovalFlowId 
                    FROM ApprovalFlows af2
                    INNER JOIN ApprovalFlowEmployees afe2 ON af2.ApprovalFlowId = afe2.ApprovalFlowId
                    INNER JOIN Employees e2 ON afe2.EmployeeId = e2.EmployeeId
                    WHERE e2.Status = 'Actif'
                    AND af2.ApproverRole = af.ApproverRole
                    ORDER BY af2.ApprovalOrder
                    LIMIT 1
                )
                ORDER BY af.ApprovalOrder";

            // Puis charger les entités complètes
            var keys = await _context.Database
                .SqlQueryRaw<ApprovalFlowEmployeeKey>(sql)
                .ToListAsync();

            var result = new List<ApprovalFlowEmployee>();
            foreach (var key in keys)
            {
                var entity = await _context.ApprovalFlowEmployees
                    .Include(a => a.Employee)
                    .Include(a => a.ApprovalFlow)
                    .FirstOrDefaultAsync(a => a.EmployeeId == key.EmployeeId && 
                                            a.ApprovalFlowId == key.ApprovalFlowId);
                if (entity != null)
                    result.Add(entity);
            }

            return result;
        }

        public async Task<IEnumerable<ApprovalFlowEmployee>> GetAllAsync()
        {
            return await _context.ApprovalFlowEmployees.ToListAsync();
        }

        public async Task<IEnumerable<ApprovalFlowEmployee>> GetByEmployeeIdAsync(string employeeId)
        {
            return await _context.ApprovalFlowEmployees
                .Where(e => e.EmployeeId == employeeId)
                .ToListAsync();
        }

        public async Task<IEnumerable<ApprovalFlowEmployee>> GetByApprovalFlowIdAsync(string approvalFlowId)
        {
            return await _context.ApprovalFlowEmployees
                .Where(e => e.ApprovalFlowId == approvalFlowId)
                .ToListAsync();
        }

        public async Task AddAsync(ApprovalFlowEmployee entity)
        {
            await _context.ApprovalFlowEmployees.AddAsync(entity);
        }

        public async Task AddRangeAsync(IEnumerable<ApprovalFlowEmployee> entities)
        {
            await _context.ApprovalFlowEmployees.AddRangeAsync(entities);
        }

        public async Task DeleteAsync(string employeeId, string approvalFlowId)
        {
            var entity = await _context.ApprovalFlowEmployees
                .FindAsync(employeeId, approvalFlowId);

            if (entity != null)
                _context.ApprovalFlowEmployees.Remove(entity);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
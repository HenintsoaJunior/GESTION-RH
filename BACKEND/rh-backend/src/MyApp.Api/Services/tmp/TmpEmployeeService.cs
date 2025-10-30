using MyApp.Api.Data;
using MyApp.Api.Entities.tmp;
using MyApp.Api.Repositories.tmp;
using MyApp.Api.Models.dto.tmp;
using Microsoft.EntityFrameworkCore.Metadata;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Services.tmp
{
    public interface ITmpEmployeeService
    {
        Task<IEnumerable<TmpEmployee>> GetAllAsync();
        Task<TmpEmployee> CreateAsync(TmpEmployeeFormDTO employee); // Changé pour retourner TmpEmployee au lieu de string
    }

    public class TmpEmployeeService : ITmpEmployeeService
    {
        private readonly ITmpEmployeeRepository _tmpEmployeeRepository;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly AppDbContext _context;

        public TmpEmployeeService(
            ISequenceGenerator sequenceGenerator,
            ITmpEmployeeRepository tmpEmployeeRepository,
            AppDbContext context)
        {
            _tmpEmployeeRepository = tmpEmployeeRepository ?? throw new ArgumentNullException(nameof(tmpEmployeeRepository));
            _sequenceGenerator = sequenceGenerator ?? throw new ArgumentNullException(nameof(sequenceGenerator));
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<IEnumerable<TmpEmployee>> GetAllAsync()
        {
            return await _tmpEmployeeRepository.GetAllAsync();
        }

        public async Task<TmpEmployee> CreateAsync(TmpEmployeeFormDTO employee)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var tmpEmployeeId = _sequenceGenerator.GenerateSequence("seq_tmp_employee_id", "TMPE", 6, "-");
                var tmpEmp = new TmpEmployee(employee) { TmpEmployeeId = tmpEmployeeId };

                await _tmpEmployeeRepository.AddAsync(tmpEmp);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return tmpEmp; // Retourne l'entité au lieu de l'ID
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}
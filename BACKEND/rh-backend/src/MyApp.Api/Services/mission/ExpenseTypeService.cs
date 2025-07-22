
using MyApp.Api.Entities.mission;
using MyApp.Api.Repositories.mission;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Services.mission
{
    public interface IExpenseTypeService
    {
        Task<IEnumerable<ExpenseType>> GetAllAsync();
        Task<ExpenseType?> GetByIdAsync(string id);
        Task<string> CreateAsync(ExpenseType expenseType);
        Task<bool> UpdateAsync(ExpenseType expenseType);
        Task<bool> DeleteAsync(string id);
    }
    
    public class ExpenseTypeService : IExpenseTypeService
    {
        private readonly IExpenseTypeRepository _repository;
         private readonly ISequenceGenerator _sequenceGenerator;
        private readonly ILogger<ExpenseType> _logger;

        public ExpenseTypeService(IExpenseTypeRepository repository, ISequenceGenerator sequenceGenerator, ILogger<ExpenseType> logger)
        {
            _repository = repository;
            _sequenceGenerator = sequenceGenerator;
            _logger = logger;
        }

        public async Task<IEnumerable<ExpenseType>> GetAllAsync()
        {
            var types = await _repository.GetAllAsync();
            return types.Select(t => new ExpenseType
            {
                ExpenseTypeId = t.ExpenseTypeId,
                Type = t.Type
            });
        }

        public async Task<ExpenseType?> GetByIdAsync(string id)
        {
            var type = await _repository.GetByIdAsync(id);
            if (type == null) return null;

            return new ExpenseType
            {
                ExpenseTypeId = type.ExpenseTypeId,
                Type = type.Type
            };
        }

        public async Task<string> CreateAsync(ExpenseType expenseType)
        {
            if (string.IsNullOrWhiteSpace(expenseType.ExpenseTypeId))
                {
                    expenseType.ExpenseTypeId = _sequenceGenerator.GenerateSequence("seq_expense_type_id", "EXP", 6, "-");
                }
            await _repository.AddAsync(expenseType);
            await _repository.SaveChangesAsync();
             _logger.LogInformation("Type de dépense créé avec l'ID: {ExpenseTypeId}", expenseType.ExpenseTypeId);
            return expenseType.ExpenseTypeId;
        }

        public async Task<bool> UpdateAsync(ExpenseType expenseType)
        {
            var entity = await _repository.GetByIdAsync(expenseType.ExpenseTypeId);
            if (entity == null) return false;

            entity.Type = expenseType.Type;
            await _repository.UpdateAsync(entity);
            await _repository.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null) return false;

            await _repository.DeleteAsync(entity);
            await _repository.SaveChangesAsync();
            return true;
        }
    }
}


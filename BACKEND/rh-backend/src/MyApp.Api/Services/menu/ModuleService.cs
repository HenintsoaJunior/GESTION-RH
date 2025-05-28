using MyApp.Api.Models.menu;
using MyApp.Api.Entities.menu;
using MyApp.Api.Repositories.menu;

namespace MyApp.Api.Services.menu
{
    public interface IModuleService
    {
        Task<IEnumerable<ModuleDto>> GetAllAsync();
        Task<ModuleDto?> GetByIdAsync(string id);
        Task<ModuleDto> CreateAsync(ModuleDto dto);
        Task<ModuleDto?> UpdateAsync(string id, ModuleDto dto);
        Task<bool> DeleteAsync(string id);
    }

    public class ModuleService : IModuleService
    {
        private readonly IModuleRepository _repository;

        public ModuleService(IModuleRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<ModuleDto>> GetAllAsync()
        {
            var modules = await _repository.GetAllAsync();
            return modules.Select(MapToDto);
        }

        public async Task<ModuleDto?> GetByIdAsync(string id)
        {
            var module = await _repository.GetByIdAsync(id);
            return module == null ? null : MapToDto(module);
        }

        public async Task<ModuleDto> CreateAsync(ModuleDto dto)
        {
            var module = new Module
            {
                ModuleId = dto.ModuleId,
                ModuleName = dto.ModuleName,
                Description = dto.Description
            };
            var created = await _repository.CreateAsync(module);
            return MapToDto(created);
        }

        public async Task<ModuleDto?> UpdateAsync(string id, ModuleDto dto)
        {
            if (!await _repository.ExistsAsync(id))
                return null;

            var module = new Module
            {
                ModuleId = id,
                ModuleName = dto.ModuleName,
                Description = dto.Description
            };
            var updated = await _repository.UpdateAsync(module);
            return MapToDto(updated);
        }

        public async Task<bool> DeleteAsync(string id)
        {
            if (!await _repository.ExistsAsync(id))
                return false;

            await _repository.DeleteAsync(id);
            return true;
        }

        private ModuleDto MapToDto(Module module)
        {
            return new ModuleDto
            {
                ModuleId = module.ModuleId,
                ModuleName = module.ModuleName,
                Description = module.Description
            };
        }
    }
}

using MyApp.Api.Entities.menu;
using MyApp.Api.Models.menu;
using MyApp.Api.Repositories.menu;

namespace MyApp.Api.Services.menu
{
    public interface IMenuTranslationService
    {
        Task<IEnumerable<MenuTranslationDto>> GetAllAsync();
        Task<MenuTranslationDto?> GetByIdAsync(string id);
        Task<MenuTranslationDto> CreateAsync(MenuTranslationDto dto);
        Task<MenuTranslationDto?> UpdateAsync(string id, MenuTranslationDto dto);
        Task<bool> DeleteAsync(string id);
    }

    public class MenuTranslationService : IMenuTranslationService
    {
        private readonly IMenuTranslationRepository _repository;

        public MenuTranslationService(IMenuTranslationRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<MenuTranslationDto>> GetAllAsync()
        {
            var list = await _repository.GetAllAsync();
            return list.Select(MapToDto);
        }

        public async Task<MenuTranslationDto?> GetByIdAsync(string id)
        {
            var entity = await _repository.GetByIdAsync(id);
            return entity == null ? null : MapToDto(entity);
        }

        public async Task<MenuTranslationDto> CreateAsync(MenuTranslationDto dto)
        {
            var entity = new MenuTranslation
            {
                TranslationId = dto.TranslationId,
                Label = dto.Label,
                LanguageId = dto.LanguageId,
                MenuId = dto.MenuId
            };
            var created = await _repository.CreateAsync(entity);
            return MapToDto(created);
        }

        public async Task<MenuTranslationDto?> UpdateAsync(string id, MenuTranslationDto dto)
        {
            if (!await _repository.ExistsAsync(id))
                return null;

            var entity = new MenuTranslation
            {
                TranslationId = id,
                Label = dto.Label,
                LanguageId = dto.LanguageId,
                MenuId = dto.MenuId
            };
            var updated = await _repository.UpdateAsync(entity);
            return MapToDto(updated);
        }

        public async Task<bool> DeleteAsync(string id)
        {
            if (!await _repository.ExistsAsync(id))
                return false;

            await _repository.DeleteAsync(id);
            return true;
        }

        private MenuTranslationDto MapToDto(MenuTranslation e)
        {
            return new MenuTranslationDto
            {
                TranslationId = e.TranslationId,
                Label = e.Label,
                LanguageId = e.LanguageId,
                MenuId = e.MenuId
            };
        }
    }
}

using MyApp.Api.Models.menu;
using MyApp.Api.Entities.menu;
using MyApp.Api.Repositories.menu;

namespace MyApp.Api.Services.menu
{
    public interface ILanguageService
    {
        Task<IEnumerable<LanguageDto>> GetAllAsync();
        Task<LanguageDto?> GetByIdAsync(string id);
        Task<LanguageDto> CreateAsync(LanguageDto dto);
        Task<LanguageDto?> UpdateAsync(string id, LanguageDto dto);
        Task<bool> DeleteAsync(string id);
    }

    public class LanguageService : ILanguageService
    {
        private readonly ILanguageRepository _repository;

        public LanguageService(ILanguageRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<LanguageDto>> GetAllAsync()
        {
            var languages = await _repository.GetAllAsync();
            return languages.Select(MapToDto);
        }

        public async Task<LanguageDto?> GetByIdAsync(string id)
        {
            var language = await _repository.GetByIdAsync(id);
            return language == null ? null : MapToDto(language);
        }

        public async Task<LanguageDto> CreateAsync(LanguageDto dto)
        {
            var language = new Language
            {
                LanguageId = dto.LanguageId,
                LanguageName = dto.LanguageName,
                Abr = dto.Abr,
                IsActive = dto.IsActive
            };
            var created = await _repository.CreateAsync(language);
            return MapToDto(created);
        }

        public async Task<LanguageDto?> UpdateAsync(string id, LanguageDto dto)
        {
            if (!await _repository.ExistsAsync(id))
                return null;

            var language = new Language
            {
                LanguageId = id,
                LanguageName = dto.LanguageName,
                Abr = dto.Abr,
                IsActive = dto.IsActive
            };
            var updated = await _repository.UpdateAsync(language);
            return MapToDto(updated);
        }

        public async Task<bool> DeleteAsync(string id)
        {
            if (!await _repository.ExistsAsync(id))
                return false;

            await _repository.DeleteAsync(id);
            return true;
        }

        private LanguageDto MapToDto(Language language)
        {
            return new LanguageDto
            {
                LanguageId = language.LanguageId,
                LanguageName = language.LanguageName,
                Abr = language.Abr,
                IsActive = language.IsActive
            };
        }
    }
}

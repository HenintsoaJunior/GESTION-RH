using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using MyApp.Api.Data;
using MyApp.Api.Entities.users_simple;
using MyApp.Api.Models.dto.users_simple;

namespace MyApp.Api.Repositories.profile
{
    public interface IProfileRepository
    {
        Task<IDbContextTransaction> BeginTransactionAsync();

        // Education
        Task AddEducationAsync(Education education);
        Task UpdateEducationAsync(Education education);
        Task DeleteEducationAsync(string educationId);
        Task<IEnumerable<Education>> GetAllEducationsAsync(string utilisateurId);
        Task<Education?> GetEducationByIdAsync(string educationId);

        // Experience
        Task AddExperienceAsync(Experience experience);
        Task UpdateExperienceAsync(Experience experience);
        Task DeleteExperienceAsync(string experienceId);
        Task<IEnumerable<Experience>> GetAllExperiencesAsync(string utilisateurId);
        Task<Experience?> GetExperienceByIdAsync(string experienceId);

        // Skill
        Task AddSkillAsync(Skill skill);
        Task UpdateSkillAsync(Skill skill);
        Task DeleteSkillAsync(string skillId);
        Task<IEnumerable<Skill>> GetAllSkillsAsync(string utilisateurId);
        Task<Skill?> GetSkillByIdAsync(string skillId);

        // Personal Quality
        Task AddPersonalQualityAsync(PersonalQuality quality);
        Task UpdatePersonalQualityAsync(PersonalQuality quality);
        Task DeletePersonalQualityAsync(string qualityId);
        Task<IEnumerable<PersonalQuality>> GetAllPersonalQualitiesAsync(string utilisateurId);
        Task<PersonalQuality?> GetPersonalQualityByIdAsync(string qualityId);

        // Language
        Task AddLanguageAsync(Language language);
        Task UpdateLanguageAsync(Language language);
        Task DeleteLanguageAsync(string languageId);
        Task<IEnumerable<Language>> GetAllLanguagesAsync(string utilisateurId);
        Task<Language?> GetLanguageByIdAsync(string languageId);

        Task<IEnumerable<UserSimpleResponseDto>> GetAllUsers_SimpleAsync(string utilisateurId);
        Task SaveChangesAsync();
    }

    public class ProfileRepository : IProfileRepository
    {
        private readonly AppDbContext _context;

        public ProfileRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IDbContextTransaction> BeginTransactionAsync()
        {
            return await _context.Database.BeginTransactionAsync();
        }

        // Education Methods
        public async Task AddEducationAsync(Education education)
        {
            await _context.Educations.AddAsync(education);
        }

        public async Task UpdateEducationAsync(Education education)
        {
            _context.Educations.Update(education);
            await Task.CompletedTask; // Added to suppress CS1998
        }

        public async Task DeleteEducationAsync(string educationId)
        {
            var education = await _context.Educations.FindAsync(educationId);
            if (education != null)
            {
                _context.Educations.Remove(education);
            }
            await Task.CompletedTask; // Added to suppress CS1998
        }

        public async Task<IEnumerable<Education>> GetAllEducationsAsync(string utilisateurId)
        {
            return await _context.Educations
                .Include(e => e.User)
                .Where(e => e.UtilisateurId == utilisateurId)
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync();
        }

        public async Task<Education?> GetEducationByIdAsync(string educationId)
        {
            return await _context.Educations
                .AsNoTracking()
                .Include(e => e.User)
                .FirstOrDefaultAsync(e => e.EducationId == educationId);
        }

        // Experience Methods
        public async Task AddExperienceAsync(Experience experience)
        {
            await _context.Experiences.AddAsync(experience);
        }

        public async Task UpdateExperienceAsync(Experience experience)
        {
            _context.Experiences.Update(experience);
            await Task.CompletedTask; // Added to suppress CS1998
        }

        public async Task DeleteExperienceAsync(string experienceId)
        {
            var experience = await _context.Experiences.FindAsync(experienceId);
            if (experience != null)
            {
                _context.Experiences.Remove(experience);
            }
            await Task.CompletedTask; // Added to suppress CS1998
        }

        public async Task<IEnumerable<Experience>> GetAllExperiencesAsync(string utilisateurId)
        {
            return await _context.Experiences
                .Include(e => e.User)
                .Where(e => e.UtilisateurId == utilisateurId)
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync();
        }

        public async Task<Experience?> GetExperienceByIdAsync(string experienceId)
        {
            return await _context.Experiences
                .AsNoTracking()
                .Include(e => e.User)
                .FirstOrDefaultAsync(e => e.ExperienceId == experienceId);
        }

        // Skill Methods
        public async Task AddSkillAsync(Skill skill)
        {
            await _context.Skills.AddAsync(skill);
        }

        public async Task UpdateSkillAsync(Skill skill)
        {
            _context.Skills.Update(skill);
            await Task.CompletedTask; // Added to suppress CS1998
        }

        public async Task DeleteSkillAsync(string skillId)
        {
            var skill = await _context.Skills.FindAsync(skillId);
            if (skill != null)
            {
                _context.Skills.Remove(skill);
            }
            await Task.CompletedTask; // Added to suppress CS1998
        }

        public async Task<IEnumerable<Skill>> GetAllSkillsAsync(string utilisateurId)
        {
            return await _context.Skills
                .Include(s => s.User)
                .Where(s => s.UtilisateurId == utilisateurId)
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();
        }

        public async Task<Skill?> GetSkillByIdAsync(string skillId)
        {
            return await _context.Skills
                .AsNoTracking()
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.SkillId == skillId);
        }

        // Personal Quality Methods
        public async Task AddPersonalQualityAsync(PersonalQuality quality)
        {
            await _context.PersonalQualities.AddAsync(quality);
        }

        public async Task UpdatePersonalQualityAsync(PersonalQuality quality)
        {
            _context.PersonalQualities.Update(quality);
            await Task.CompletedTask; // Added to suppress CS1998
        }

        public async Task DeletePersonalQualityAsync(string qualityId)
        {
            var quality = await _context.PersonalQualities.FindAsync(qualityId);
            if (quality != null)
            {
                _context.PersonalQualities.Remove(quality);
            }
            await Task.CompletedTask; // Added to suppress CS1998
        }

        public async Task<IEnumerable<PersonalQuality>> GetAllPersonalQualitiesAsync(string utilisateurId)
        {
            return await _context.PersonalQualities
                .Include(q => q.User)
                .Where(q => q.UtilisateurId == utilisateurId)
                .OrderByDescending(q => q.CreatedAt)
                .ToListAsync();
        }

        public async Task<PersonalQuality?> GetPersonalQualityByIdAsync(string qualityId)
        {
            return await _context.PersonalQualities
                .AsNoTracking()
                .Include(q => q.User)
                .FirstOrDefaultAsync(q => q.QualityId == qualityId);
        }

        // Language Methods
        public async Task AddLanguageAsync(Language language)
        {
            await _context.Languages.AddAsync(language);
        }

        public async Task UpdateLanguageAsync(Language language)
        {
            _context.Languages.Update(language);
            await Task.CompletedTask; // Added to suppress CS1998
        }

        public async Task DeleteLanguageAsync(string languageId)
        {
            var language = await _context.Languages.FindAsync(languageId);
            if (language != null)
            {
                _context.Languages.Remove(language);
            }
            await Task.CompletedTask; // Added to suppress CS1998
        }

        public async Task<IEnumerable<Language>> GetAllLanguagesAsync(string utilisateurId)
        {
            return await _context.Languages
                .Include(l => l.User)
                .Where(l => l.UtilisateurId == utilisateurId)
                .OrderByDescending(l => l.CreatedAt)
                .ToListAsync();
        }

        public async Task<Language?> GetLanguageByIdAsync(string languageId)
        {
            return await _context.Languages
                .AsNoTracking()
                .Include(l => l.User)
                .FirstOrDefaultAsync(l => l.LanguageId == languageId);
        }

        public async Task<IEnumerable<UserSimpleResponseDto>> GetAllUsers_SimpleAsync(string utilisateurId)
        {
            return await _context.UsersSimple
                .AsNoTracking()
                .Where(u => u.UserId == utilisateurId)
                .Select(u => new UserSimpleResponseDto
                {
                    Email = u.Email,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    PhoneNumber = u.PhoneNumber,
                })
                .ToListAsync();
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
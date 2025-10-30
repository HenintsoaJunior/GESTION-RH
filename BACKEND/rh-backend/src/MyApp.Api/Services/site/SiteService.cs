using MyApp.Api.Data;
using MyApp.Api.Entities.site;
using MyApp.Api.Models.dto.site;
using MyApp.Api.Repositories.site;
using MyApp.Api.Utils.generator;
using System;

namespace MyApp.Api.Services.site
{
    public interface ISiteService
    {
        Task<IEnumerable<Site>> GetAllAsync();
        Task<Site?> GetByIdAsync(string id);
        Task<Site> AddAsync(CreateSiteDTO site);
        Task UpdateAsync(Site site);
        Task DeleteAsync(string id);
    }

    public class SiteService : ISiteService
    {
        private readonly ISiteRepository _repository;
        private readonly AppDbContext _context;
        private readonly ISequenceGenerator _sequenceGenerator;

        public SiteService(ISiteRepository repository, AppDbContext context, ISequenceGenerator sequenceGenerator)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _sequenceGenerator = sequenceGenerator ?? throw new ArgumentNullException(nameof(sequenceGenerator));
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public async Task<IEnumerable<Site>> GetAllAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<Site?> GetByIdAsync(string id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task<Site> AddAsync(CreateSiteDTO site)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var siteId = _sequenceGenerator.GenerateSequence("seq_site_id", "SITE", 6, "-");
                var siteValue = new Site(site) { SiteId = siteId };
                await _repository.AddAsync(siteValue);
                await _repository.SaveChangesAsync();
                await transaction.CommitAsync();
                return siteValue;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task UpdateAsync(Site site)
        {
            await _repository.UpdateAsync(site);
            await _repository.SaveChangesAsync();
        }

        public async Task DeleteAsync(string id)
        {
            await _repository.DeleteAsync(id);
            await _repository.SaveChangesAsync();
        }
    }
}
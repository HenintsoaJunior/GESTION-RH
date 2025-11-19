using Microsoft.Extensions.Logging;
using MyApp.Api.Data;
using MyApp.Api.Entities.zones;
using MyApp.Api.Models.dto.zones;
using MyApp.Api.Repositories.zones;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Services.zones
{
    public interface IGeoZoneService
    {
        Task<(IEnumerable<GeoZone>, int)> SearchAsync(GeoZoneSearchFiltersDTO filters, int page, int pageSize);
        Task<IEnumerable<GeoZone>> GetAllAsync();
        Task<GeoZone?> GetByIdAsync(string id);
        Task<GeoZone> AddAsync(GeoZoneDTOForm dto);
        Task UpdateAsync(GeoZone geoZone);
        Task DeleteAsync(string id);
    }

    public class GeoZoneService : IGeoZoneService
    {
        private readonly IGeoZoneRepository _repository;
        private readonly AppDbContext _context;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly ILogger<GeoZoneService> _logger;

        public GeoZoneService(
            IGeoZoneRepository repository,
            AppDbContext context,
            ISequenceGenerator sequenceGenerator,
            ILogger<GeoZoneService> logger)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _sequenceGenerator = sequenceGenerator ?? throw new ArgumentNullException(nameof(sequenceGenerator));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<(IEnumerable<GeoZone>, int)> SearchAsync(GeoZoneSearchFiltersDTO filters, int page, int pageSize)
        {
            try
            {
                _logger.LogInformation("Recherche des zones géo avec filtres, page={Page}, pageSize={PageSize}", page, pageSize);
                return await _repository.SearchAsync(filters, page, pageSize);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la recherche des zones géo");
                throw;
            }
        }
    
        public async Task<IEnumerable<GeoZone>> GetAllAsync()
        {
            try
            {
                _logger.LogInformation("Récupération de toutes les zones géo");
                return await _repository.GetAllAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des zones géo");
                throw;
            }
        }

        public async Task<GeoZone?> GetByIdAsync(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    _logger.LogWarning("Tentative de récupération d'une zone géo avec un ID null ou vide");
                    return null;
                }

                _logger.LogInformation("Récupération de la zone géo avec l'ID: {ZoneId}", id);
                return await _repository.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de la zone géo avec l'ID: {ZoneId}", id);
                throw;
            }
        }

        public async Task<GeoZone> AddAsync(GeoZoneDTOForm dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                if (dto == null)
                {
                    throw new ArgumentNullException(nameof(dto), "Le DTO de zone géo ne peut pas être null");
                }

                var zoneId = _sequenceGenerator.GenerateSequence("seq_geo_zone_id", "GEO", 6, "-");

                var geoZone = new GeoZone(dto) { ZoneId = zoneId };

                await _repository.AddAsync(geoZone);
                await _repository.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation("Zone géo ajoutée avec succès avec l'ID: {ZoneId}", geoZone.ZoneId);
                return geoZone;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Erreur lors de l'ajout de la zone géo");
                throw;
            }
        }

        public async Task UpdateAsync(GeoZone geoZone)
        {
            try
            {
                if (geoZone == null)
                {
                    throw new ArgumentNullException(nameof(geoZone), "La zone géo ne peut pas être null");
                }

                if (string.IsNullOrWhiteSpace(geoZone.ZoneId))
                {
                    throw new ArgumentException("L'ID de la zone géo ne peut pas être null ou vide", nameof(geoZone.ZoneId));
                }

                await _repository.UpdateAsync(geoZone);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Zone géo mise à jour avec succès pour l'ID: {ZoneId}", geoZone.ZoneId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour de la zone géo avec l'ID: {ZoneId}", geoZone?.ZoneId);
                throw;
            }
        }

        public async Task DeleteAsync(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    throw new ArgumentException("L'ID de la zone géo ne peut pas être null ou vide", nameof(id));
                }

                await _repository.DeleteAsync(id);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Zone géo supprimée avec succès pour l'ID: {ZoneId}", id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression de la zone géo avec l'ID: {ZoneId}", id);
                throw;
            }
        }
    }
}
using Microsoft.IdentityModel.Tokens;
using MyApp.Api.Entities.mission;
using MyApp.Api.Repositories.mission;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Services.mission
{
    public interface ITransportService
    {
        Task<Transport?> VerifyTransportByTypeAsync(string type);
        Task<IEnumerable<Transport>> GetByTypeAsync(string type);
        Task<IEnumerable<Transport>> GetAllAsync();
        Task<Transport?> GetByIdAsync(string id);
        Task<string> CreateAsync(Transport transport);
        Task<bool> UpdateAsync(Transport transport);
        Task<bool> DeleteAsync(string id);
    }
    
    public class TransportService : ITransportService
    {
        private readonly ITransportRepository _repository;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly ILogger<Transport> _logger;

        public TransportService(ITransportRepository repository, ISequenceGenerator sequenceGenerator, ILogger<Transport> logger)
        {
            _repository = repository;
            _sequenceGenerator = sequenceGenerator;
            _logger = logger;
        }

        public async Task<Transport?> VerifyTransportByTypeAsync(string type)
        {
            if(type.IsNullOrEmpty()) return null;
            var transports = await GetByTypeAsync(type);
            var transport = transports.FirstOrDefault();
            if (transport == null)
            {
                throw new Exception("Type de transport inexistant");
            }
            return transport;
        }

        public async Task<IEnumerable<Transport>> GetByTypeAsync(string type)
        {
            var transports = await _repository.GetAllAsync();
            return transports
                .Where(t => t.Type.Equals(type, StringComparison.OrdinalIgnoreCase))
                .Select(t => new Transport
                {
                    TransportId = t.TransportId,
                    Type = t.Type
                });
        }

        public async Task<IEnumerable<Transport>> GetAllAsync()
        {
            var transports = await _repository.GetAllAsync();
            return transports.Select(t => new Transport
            {
                TransportId = t.TransportId,
                Type = t.Type
            });
        }

        public async Task<Transport?> GetByIdAsync(string id)
        {
            var transport = await _repository.GetByIdAsync(id);
            if (transport == null) return null;

            return new Transport
            {
                TransportId = transport.TransportId,
                Type = transport.Type
            };
        }

        public async Task<string> CreateAsync(Transport transport)
        {
            if (string.IsNullOrWhiteSpace(transport.TransportId))
            {
                transport.TransportId = _sequenceGenerator.GenerateSequence("seq_transport_id", "TRN", 6, "-");
            }

            await _repository.AddAsync(transport);
            await _repository.SaveChangesAsync();
            _logger.LogInformation("Transport créé avec l'ID: {TransportId}", transport.TransportId);
            return transport.TransportId;
        }

        public async Task<bool> UpdateAsync(Transport transport)
        {
            var existing = await _repository.GetByIdAsync(transport.TransportId);
            if (existing == null) return false;

            existing.Type = transport.Type;
            await _repository.UpdateAsync(existing);
            await _repository.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return false;

            await _repository.DeleteAsync(existing);
            await _repository.SaveChangesAsync();
            return true;
        }
    }
}

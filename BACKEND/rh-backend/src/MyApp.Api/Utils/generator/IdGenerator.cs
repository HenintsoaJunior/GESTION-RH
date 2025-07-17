using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

namespace MyApp.Api.Utils.generator
{
    public class IdGenerator
    {
        private readonly DbContext _context;
        private readonly ILogger<IdGenerator> _logger;

        public IdGenerator(DbContext context, ILogger<IdGenerator> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<string> GenerateIdAsync(string sequenceName, string prefix)
        {
            try
            {
                // Exécuter une requête SQL pour obtenir la prochaine valeur de la séquence
                var sql = $"SELECT '{prefix}' + RIGHT('0000' + CAST(NEXT VALUE FOR {sequenceName} AS VARCHAR(4)), 4)";
                var id = await _context.Database.SqlQueryRaw<string>(sql).FirstOrDefaultAsync();

                if (string.IsNullOrEmpty(id))
                {
                    _logger.LogError("Failed to generate ID for sequence {SequenceName} with prefix {Prefix}", sequenceName, prefix);
                    throw new InvalidOperationException($"Failed to generate ID for sequence {sequenceName}");
                }

                _logger.LogInformation("Generated ID: {Id} for sequence {SequenceName}", id, sequenceName);
                return id;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating ID for sequence {SequenceName}", sequenceName);
                throw;
            }
        }
    }
}

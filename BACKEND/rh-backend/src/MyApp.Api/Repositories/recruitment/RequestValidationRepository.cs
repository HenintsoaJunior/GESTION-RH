using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.users;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Repositories.recruitment;

public interface IRequestValidationRepository
{
    Task<List<User>> GetAllDirectors();
}

public class RequestValidationRepository : IRequestValidationRepository
{
    private readonly AppDbContext _dbCtx;
    private readonly ISequenceGenerator _generator;
    private readonly ILogger<RequestValidationRepository> _logger;

    public RequestValidationRepository(AppDbContext ctx, ISequenceGenerator sqc
    , ILogger<RequestValidationRepository> log
    ) {
        _dbCtx = ctx; _generator = sqc;
        _logger = log;
    }

    
    public async Task<List<User>> GetAllDirectors() {
        try {
            var query = @"SELECT * FROM users u WHERE 
                position LIKE 'Directeur%' OR position LIKE 'Directrice%'";
            
            var directors = await _dbCtx.Users.FromSqlRaw(query)
                .AsNoTracking().ToListAsync();

            return directors;
        }
        catch (Exception ex) {
            _logger.LogError(ex, "Error fetching directors");
            throw;
        }
    }
}

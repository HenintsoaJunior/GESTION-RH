using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Hangfire;

namespace MyApp.Api.Services.mission
{
    public class MissionStatusBackgroundService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<MissionStatusBackgroundService> _logger;

        public MissionStatusBackgroundService(
            IServiceProvider serviceProvider,
            ILogger<MissionStatusBackgroundService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Mission Status Background Service démarré");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using (var scope = _serviceProvider.CreateScope())
                    {
                        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                        
                        await dbContext.Database.ExecuteSqlRawAsync(
                            "EXEC sp_update_all_mission_status",
                            stoppingToken);
                        
                        _logger.LogInformation("Statuts des missions mis à jour à {time}", 
                            DateTimeOffset.Now);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Erreur lors de la mise à jour des statuts des missions");
                }

                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
            }
        }
    }

    public static class MissionStatusUpdater
    {
        [AutomaticRetry(Attempts = 0)]
        public static void UpdateMissionStatuses()
        {
            var serviceProvider = ServiceProviderAccessor.ServiceProvider;
            using var scope = serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            
            dbContext.Database.ExecuteSqlRaw("EXEC sp_update_all_mission_status");
        }
    }

    public static class ServiceProviderAccessor
    {
        private static IServiceProvider? _serviceProvider;
        
        public static IServiceProvider ServiceProvider => _serviceProvider 
            ?? throw new InvalidOperationException("ServiceProvider n'a pas été initialisé");
        
        public static void Initialize(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }
    }
}
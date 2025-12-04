using MyApp.Api.Entities.mission;
using MyApp.Api.Models.dto.mission;
using MyApp.Api.Repositories.mission;

namespace MyApp.Api.Services.mission
{
    public interface IMissionPaiementService
    {
       Task<MissionPaiementResult> GeneratePaiementsAsync(string employeeId, string missionId);
    }

    public class MissionPaiementService : IMissionPaiementService
    {
        private readonly IMissionRepository _repository;
        private readonly ICompensationScaleService _compensationScaleService;
        private readonly ICompensationService _compensationService;
        private readonly ILogger<MissionPaiementService> _logger;

        public MissionPaiementService(
            IMissionRepository repository,
            ICompensationScaleService compensationScaleService,
            ICompensationService compensationService,
            ILogger<MissionPaiementService> logger)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _compensationScaleService = compensationScaleService ?? throw new ArgumentNullException(nameof(compensationScaleService));
            _compensationService = compensationService ?? throw new ArgumentNullException(nameof(compensationService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<MissionPaiementResult> GeneratePaiementsAsync(string employeeId, string missionId)
        {
            try
            {
                var mission = await _repository.GetByIdAsync(employeeId, missionId);

                if (mission == null)
                {
                    return new MissionPaiementResult
                    {
                        DailyPaiements = new List<DailyPaiement>(),
                        Mission = null
                    };
                }

                var paiementResult = await GeneratePaymentsForAssignation(mission);
                await CreateCompensationsForResultAsync(paiementResult, mission);

                return paiementResult;
            }
            catch (Exception ex)
            {
                throw new Exception($"Erreur lors de la génération des paiements pour l'employé {employeeId} et la mission {missionId} : {ex.Message}", ex);
            }
        }

        private async Task<MissionPaiementResult> GeneratePaymentsForAssignation(Mission mission)
        {
            var missionPaiement = new MissionPaiement();
            return await missionPaiement.GeneratePaiement(mission, _compensationScaleService);
        }
        private async Task CreateCompensationsForResultAsync(MissionPaiementResult paiementResult, Mission mission)
        {
            if (paiementResult.DailyPaiements == null || !paiementResult.DailyPaiements.Any())
            {
                return;
            }
            foreach (var dailyPaiement in paiementResult.DailyPaiements)
            {
                var compensationDto = new CompensationDTO
                {
                    MissionId = mission.MissionId,
                    EmployeeId = mission.EmployeeId,
                    PaymentDate = dailyPaiement.Date,
                    Devise = "MGA",
                    Status = "unpaid",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = null,
                    TransportAmount = CalculateTransportAmount(dailyPaiement.CompensationScales?.ToList() ?? new List<CompensationScale>(), mission.TransportId),
                    BreakfastAmount = 0m,
                    LunchAmount = 0m,
                    DinnerAmount = 0m,
                    AccommodationAmount = 0m,
                    CommunicationAmount = 0m,
                    VisaAmount = 0m,
                    MedicalExpensesAmount = 0m,
                    TaxesAmount = 0m
                };
                if (dailyPaiement.CompensationScales != null)
                {
                    foreach (var cs in dailyPaiement.CompensationScales)
                    {
                        if (cs?.ExpenseType?.Type == null) continue;
                        var amount = cs.Amount;
                        switch (cs.ExpenseType.Type)
                        {
                            case "Petit Déjeuner":
                                compensationDto.BreakfastAmount += amount;
                                break;
                            case "Déjeuner":
                                compensationDto.LunchAmount += amount;
                                break;
                            case "Dinner":
                                compensationDto.DinnerAmount += amount;
                                break;
                            case "Hébergement":
                                compensationDto.AccommodationAmount += amount;
                                break;
                            case "Communication":
                                compensationDto.CommunicationAmount += amount;
                                break;
                            case "Visa sur place":
                                compensationDto.VisaAmount += amount;
                                break;
                            case "Frais médicaux":
                                compensationDto.MedicalExpensesAmount += amount;
                                break;
                            case "Taxes":
                                compensationDto.TaxesAmount += amount;
                                break;
                        }
                    }
                }
                try
                {
                    var compensationId = await _compensationService.CreateAsync(compensationDto);
                    _logger.LogInformation("Compensation {CompensationId} créée pour la date {Date} de l'assignation {MissionId}", compensationId, dailyPaiement.Date, mission.MissionId);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Erreur lors de la création de la compensation pour la date {Date} de l'assignation {MissionId}", dailyPaiement.Date, mission.MissionId);
                }
            }
        }

        private static decimal CalculateTransportAmount(List<CompensationScale> compensationScales, string? transportId)
        {
            return compensationScales
                .Where(scale => scale.TransportId == transportId && scale.TransportId != null)
                .Sum(scale => scale.Amount);
        }
    }
}
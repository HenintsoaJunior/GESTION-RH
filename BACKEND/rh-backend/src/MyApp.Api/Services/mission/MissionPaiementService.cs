using MyApp.Api.Entities.mission;
using MyApp.Api.enums;
using MyApp.Api.Models.dto.mission;
using MyApp.Api.Repositories.mission;

namespace MyApp.Api.Services.mission
{
    public interface IMissionPaiementService
    {
       Task<MissionPaiementResult> GeneratePaiementsAsync(string employeeId, string missionId);
       Task<ExpensePaiementResult> GenerateExpensePaiementsAsync(string? employeeId = null, string? missionId = null);
    }

    public class MissionPaiementService : IMissionPaiementService
    {
        private readonly IMissionRepository _repository;
        private readonly ICompensationScaleService _compensationScaleService;
        private readonly ICompensationService _compensationService;
        private readonly ILogger<MissionPaiementService> _logger;
        private readonly IExpenseCompensationScaleService _expenseCompensationScaleService;

        public MissionPaiementService(
            IMissionRepository repository,
            ICompensationScaleService compensationScaleService,
            ICompensationService compensationService,
            IExpenseCompensationScaleService expenseCompensationScaleService,
            ILogger<MissionPaiementService> logger)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _compensationScaleService = compensationScaleService ?? throw new ArgumentNullException(nameof(compensationScaleService));
            _compensationService = compensationService ?? throw new ArgumentNullException(nameof(compensationService));
            _expenseCompensationScaleService = expenseCompensationScaleService ?? throw new ArgumentNullException(nameof(expenseCompensationScaleService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<ExpensePaiementResult> GenerateExpensePaiementsAsync(string? employeeId = null, string? missionId = null)
        {
            try
            {
                if (string.IsNullOrEmpty(employeeId) || string.IsNullOrEmpty(missionId))
                {
                    return new ExpensePaiementResult
                    {
                        DailyPaiements = new List<DailyExpensePaiement>(),
                        Mission = null,
                        TransportAmount = 0m,
                        VisaAmount = 0m
                    };
                }

                var mission = await _repository.GetByIdAsync(employeeId!, missionId!);
                
                if (mission == null)
                {
                    return new ExpensePaiementResult
                    {
                        DailyPaiements = new List<DailyExpensePaiement>(),
                        Mission = null,
                        TransportAmount = 0m,
                        VisaAmount = 0m
                    };
                }

                var paiementResult = await GenerateExpensePaymentsForMission(mission);
                
                // Ajouter le montant du visa depuis la mission si IsVisa = 1
                if (mission.IsVisa == 1 && mission.AmountVisaEur.HasValue)
                {
                    paiementResult.VisaAmount = mission.AmountVisaEur.Value;
                }
                
                await CreateExpenseCompensationsForResultAsync(paiementResult, mission);

                return paiementResult;
            }
            catch (Exception ex)
            {
                throw new Exception($"Erreur lors de la génération des paiements des frais : {ex.Message}", ex);
            }
        }

        private async Task CreateExpenseCompensationsForResultAsync(ExpensePaiementResult paiementResult, Mission mission)
        {
            if (paiementResult.DailyPaiements == null || !paiementResult.DailyPaiements.Any())
            {
                // Créer quand même une compensation pour le visa si applicable
                if (paiementResult.VisaAmount > 0)
                {
                    await CreateVisaCompensationAsync(mission, paiementResult.VisaAmount);
                }
                return;
            }
            
            var dailyPaiements = paiementResult.DailyPaiements.OrderBy(d => d.Date).ToList();
            var firstDate = dailyPaiements.FirstOrDefault()?.Date;
            if (firstDate == null) return;
            
            var numberOfDays = dailyPaiements.Count;
            
            // Calculer les montants des frais spéciaux
            decimal totalCommunication = dailyPaiements.Sum(d => CalculateExpenseAmountExpense(
                d.CompensationScales?.ToList() ?? new List<ExpenseCompensationScale>(), "Communication"));
            
            decimal totalMedical = dailyPaiements.Sum(d => CalculateExpenseAmountExpense(
                d.CompensationScales?.ToList() ?? new List<ExpenseCompensationScale>(), "Frais médicaux"));
            
            // Note: Le montant du visa vient maintenant de paiementResult.VisaAmount
            // qui est défini dans GenerateExpensePaiementsAsync
            
            for (int i = 0; i < dailyPaiements.Count; i++)
            {
                var dailyPaiement = dailyPaiements[i];
                var isFirstDay = i == 0;
                
                var compensationDto = new CompensationDTO
                {
                    MissionId = mission!.MissionId,
                    EmployeeId = mission.EmployeeId,
                    PaymentDate = dailyPaiement.Date,
                    Devise = "EUR",
                    Status = "unpaid",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = null,
                    TransportAmount = 0m,
                    BreakfastAmount = 0m,
                    LunchAmount = 0m,
                    DinnerAmount = 0m,
                    AccommodationAmount = 0m,
                    CommunicationAmount = 0m,
                    VisaAmount = 0m,
                    MedicalExpensesAmount = 0m,
                    TaxesAmount = 0m
                };
                
                // Si InclPdj = 1, on ne compte pas le petit déjeuner
                bool excludeBreakfast = mission.InclPdj == 1;
                
                if (dailyPaiement.CompensationScales != null)
                {
                    foreach (var cs in dailyPaiement.CompensationScales)
                    {
                        if (cs?.ExpenseType?.Type == null) continue;
                        
                        var amount = cs.Amount;
                        var type = cs.ExpenseType.Type;
                        
                        // Exclure les types qui sont regroupés
                        if (type == "Communication" || type == "Frais médicaux")
                        {
                            continue;
                        }
                        
                        // Exclure le petit déjeuner si InclPdj = 1
                        if (excludeBreakfast && (type == "Petit Déjeuner" || type == "petit dejeuner"))
                        {
                            continue;
                        }
                        
                        switch (type)
                        {
                            case "Transport":
                                compensationDto.TransportAmount += amount;
                                break;
                            case "Petit Déjeuner":
                            case "petit dejeuner":
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
                            case "Taxes":
                                compensationDto.TaxesAmount += amount;
                                break;
                        }
                    }
                }
                
                // Ajouter les montants regroupés seulement au premier jour
                if (isFirstDay)
                {
                    compensationDto.CommunicationAmount = totalCommunication;
                    compensationDto.MedicalExpensesAmount = totalMedical;
                    
                    // Ajouter le montant du visa au premier jour
                    compensationDto.VisaAmount = paiementResult.VisaAmount;
                }
                
                try
                {
                    var compensationId = await _compensationService.CreateAsync(compensationDto);
                    _logger.LogInformation("Compensation {CompensationId} créée pour la date {Date} de l'assignation {MissionId}", 
                        compensationId, dailyPaiement.Date, mission.MissionId);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Erreur lors de la création de la compensation pour la date {Date} de l'assignation {MissionId}", 
                        dailyPaiement.Date, mission.MissionId);
                }
            }
            
            // Si aucune daily paiement mais qu'il y a un visa, créer une compensation spécifique
            if (dailyPaiements.Count == 0 && paiementResult.VisaAmount > 0)
            {
                await CreateVisaCompensationAsync(mission, paiementResult.VisaAmount);
            }
        }
        
        private async Task CreateVisaCompensationAsync(Mission mission, decimal visaAmount)
        {
            var compensationDto = new CompensationDTO
            {
                MissionId = mission.MissionId,
                EmployeeId = mission.EmployeeId,
                PaymentDate = mission.DepartureDate ?? DateTime.UtcNow,
                Devise = "EUR",
                Status = "unpaid",
                CreatedAt = DateTime.UtcNow,
                    UpdatedAt = null,
                TransportAmount = 0m,
                BreakfastAmount = 0m,
                LunchAmount = 0m,
                DinnerAmount = 0m,
                AccommodationAmount = 0m,
                CommunicationAmount = 0m,
                VisaAmount = visaAmount,
                MedicalExpensesAmount = 0m,
                TaxesAmount = 0m
            };
            
            try
            {
                var compensationId = await _compensationService.CreateAsync(compensationDto);
                _logger.LogInformation("Compensation {CompensationId} créée pour le visa de la mission {MissionId}", 
                    compensationId, mission.MissionId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la création de la compensation pour le visa de la mission {MissionId}", 
                    mission.MissionId);
            }
        }

        public static decimal CalculateExpenseAmountExpense(List<ExpenseCompensationScale> compensationScales, string expenseType)
        {
            return compensationScales
                .Where(scale => scale.ExpenseType?.Type == expenseType)
                .Sum(scale => scale.Amount);
        }

        private async Task<ExpensePaiementResult> GenerateExpensePaymentsForMission(Mission mission)
        {
            var expensePaiement = new ExpensePaiement();
            var result = await expensePaiement.GeneratePaiement(mission, _expenseCompensationScaleService);
            return result;
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
                
                // Si InclPdj = 1, on ne compte pas le petit déjeuner
                bool excludeBreakfast = mission.InclPdj == 1;
                
                if (dailyPaiement.CompensationScales != null)
                {
                    foreach (var cs in dailyPaiement.CompensationScales)
                    {
                        if (cs?.ExpenseType?.Type == null) continue;
                        
                        var amount = cs.Amount;
                        var type = cs.ExpenseType.Type;
                        
                        // Exclure le petit déjeuner si InclPdj = 1
                        if (excludeBreakfast && (type == "Petit Déjeuner" || type == "petit dejeuner"))
                        {
                            continue;
                        }
                        
                        switch (type)
                        {
                            case "Petit Déjeuner":
                            case "petit dejeuner":
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
                
                if (mission.IsVisa == 1 && mission.AmountVisaEur.HasValue)
                {
                    compensationDto.VisaAmount = mission.AmountVisaEur.Value;
                }
                
                try
                {
                    var compensationId = await _compensationService.CreateAsync(compensationDto);
                    _logger.LogInformation("Compensation {CompensationId} créée pour la date {Date} de l'assignation {MissionId}", 
                        compensationId, dailyPaiement.Date, mission.MissionId);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Erreur lors de la création de la compensation pour la date {Date} de l'assignation {MissionId}", 
                        dailyPaiement.Date, mission.MissionId);
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
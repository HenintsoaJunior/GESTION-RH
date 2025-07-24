using MyApp.Api.Entities.employee;
using MyApp.Api.Services.employee;
using MyApp.Api.Services.mission;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace MyApp.Api.Entities.mission
{
    public class MissionPaiement
    {
        private readonly ILogger<MissionPaiement> _logger;
        private readonly ICategoriesOfEmployeeService _categoriesOfEmployeeService;

        public DateTime? Date { get; set; }
        public IEnumerable<CompensationScale>? CompensationScales { get; set; }
        public decimal? TotalAmount { get; set; }
        public MissionAssignation? MissionAssignation { get; set; }

        public MissionPaiement(ILogger<MissionPaiement> logger, ICategoriesOfEmployeeService categoriesOfEmployeeService)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _categoriesOfEmployeeService = categoriesOfEmployeeService ?? throw new ArgumentNullException(nameof(categoriesOfEmployeeService));
        }

        public async Task<IEnumerable<MissionPaiement>> GeneratePaiement(
            MissionAssignation missionAssignation, 
            ICompensationScaleService compensationScaleService)
        {
            var paiements = new List<MissionPaiement>();

            _logger.LogInformation("Starting GeneratePaiement for mission assignment ID: {MissionId}", 
                missionAssignation?.MissionId ?? "null");

            if (missionAssignation == null)
            {
                _logger.LogError("Mission assignment is null");
                throw new ArgumentNullException(nameof(missionAssignation), "Mission assignment cannot be null.");
            }

            if (compensationScaleService == null)
            {
                _logger.LogError("Compensation scale service is null");
                throw new ArgumentNullException(nameof(compensationScaleService), "Compensation scale service cannot be null.");
            }

            if (missionAssignation.Employee == null)
            {
                _logger.LogError("Employee is null for mission assignment ID: {MissionId}", missionAssignation.MissionId);
                throw new InvalidOperationException("Employee cannot be null in mission assignment.");
            }

            _logger.LogDebug("Retrieving category for employee ID: {EmployeeId}", 
                missionAssignation.Employee.EmployeeId);

            // Use DepartureDate if valid, otherwise DateTime.UtcNow
            DateTime queryDate = missionAssignation.DepartureDate != DateTime.MinValue 
                ? missionAssignation.DepartureDate 
                : DateTime.UtcNow;

            var categories = await _categoriesOfEmployeeService.GetCategoriesByEmployeeIdAsync(
                missionAssignation.Employee.EmployeeId, queryDate);

            // Take the most recent category
            var latestCategory = categories?
                .OrderByDescending(c => c.CreatedAt)
                .FirstOrDefault();

            if (latestCategory?.EmployeeCategory == null)
            {
                _logger.LogWarning("No category found for employee ID: {EmployeeId}", 
                    missionAssignation.Employee.EmployeeId);
                return paiements; // Return empty list if no category is found
            }

            _logger.LogInformation("Retrieving compensation scales for employee category ID: {CategoryId}", 
                latestCategory.EmployeeCategory.EmployeeCategoryId);
            
            var compensationScales = await compensationScaleService.GetByEmployeeCategoryAsync(
                latestCategory.EmployeeCategory.EmployeeCategoryId);
            
            if (compensationScales == null || !compensationScales.Any())
            {
                _logger.LogWarning("No compensation scales found for employee category ID: {CategoryId}", 
                    latestCategory.EmployeeCategory.EmployeeCategoryId);
                return paiements; // Return empty list if no compensation scales
            }

            _logger.LogInformation("Found {Count} compensation scales for employee category ID: {CategoryId}", 
                compensationScales.Count(), latestCategory.EmployeeCategory.EmployeeCategoryId);

            // Validate durationInDays
            if (!missionAssignation.Duration.HasValue || missionAssignation.Duration <= 0)
            {
                _logger.LogWarning("Invalid or missing duration for mission ID: {MissionId}", 
                    missionAssignation.MissionId);
                return paiements; // Return empty list if duration is invalid
            }

            _logger.LogDebug("Generating date range from {StartDate} for {Duration} days", 
                missionAssignation.DepartureDate, missionAssignation.Duration);
            List<DateTime> dates = GenerateDateRangeWithTime(missionAssignation);

            foreach (var date in dates)
            {
                _logger.LogDebug("Generating payment for date: {Date}", date);
                
                // Filtrer les compensation scales selon les horaires pour cette date
                var filteredCompensationScales = FilterCompensationScalesByTime(
                    compensationScales, 
                    missionAssignation, 
                    date);

                var paiement = new MissionPaiement(_logger, _categoriesOfEmployeeService)
                {
                    Date = date,
                    CompensationScales = filteredCompensationScales,
                    TotalAmount = filteredCompensationScales.Sum(cs => cs?.Amount ?? 0),
                    MissionAssignation = missionAssignation
                };

                paiements.Add(paiement);
                _logger.LogInformation("Generated payment for date {Date} with total amount: {TotalAmount} for mission ID: {MissionId}", 
                    date, paiement.TotalAmount, missionAssignation.MissionId);
            }

            _logger.LogInformation("Completed GeneratePaiement for mission assignment ID: {MissionId}. Generated {Count} payments", 
                missionAssignation.MissionId, paiements.Count);
            return paiements;
        }

        /// <summary>
        /// Filtre les compensation scales en fonction des horaires de départ et de retour
        /// </summary>
        private IEnumerable<CompensationScale> FilterCompensationScalesByTime(
            IEnumerable<CompensationScale> compensationScales,
            MissionAssignation missionAssignation,
            DateTime currentDate)
        {
            var filteredScales = new List<CompensationScale>();

            foreach (var scale in compensationScales)
            {
                // Si c'est un transport, on l'inclut toujours
                if (scale.TransportId != null)
                {
                    filteredScales.Add(scale);
                    continue;
                }

                // Si c'est un ExpenseType, on vérifie les horaires
                if (scale.ExpenseType != null)
                {
                    bool shouldInclude = ShouldIncludeExpenseType(
                        scale.ExpenseType, 
                        missionAssignation, 
                        currentDate);

                    if (shouldInclude)
                    {
                        filteredScales.Add(scale);
                        _logger.LogDebug("Included ExpenseType {ExpenseTypeId} for date {Date}", 
                            scale.ExpenseType.ExpenseTypeId, currentDate);
                    }
                    else
                    {
                        _logger.LogDebug("Excluded ExpenseType {ExpenseTypeId} for date {Date} due to time constraints", 
                            scale.ExpenseType.ExpenseTypeId, currentDate);
                    }
                }
                else
                {
                    // Si ni transport ni expense type, on l'inclut par défaut
                    filteredScales.Add(scale);
                }
            }

            return filteredScales;
        }

        /// <summary>
        /// Détermine si un ExpenseType doit être inclus selon les horaires de la mission
        /// L'employé doit être présent pendant la période de l'ExpenseType pour en bénéficier
        /// </summary>
        private bool ShouldIncludeExpenseType(
            ExpenseType expenseType,
            MissionAssignation missionAssignation,
            DateTime currentDate)
        {
            // Si l'ExpenseType n'a pas d'horaires définis, on l'inclut
            if (!expenseType.TimeStart.HasValue || !expenseType.TimeEnd.HasValue)
            {
                return true;
            }

            bool isFirstDay = currentDate.Date == missionAssignation.DepartureDate.Date;
            bool isLastDay = missionAssignation.ReturnDate.HasValue && 
                           currentDate.Date == missionAssignation.ReturnDate.Value.Date;
            bool isSingleDay = isFirstDay && isLastDay;

            TimeSpan expenseStart = expenseType.TimeStart.Value;
            TimeSpan expenseEnd = expenseType.TimeEnd.Value;
            
            // Vérifier si la période traverse minuit (ex: 21:00-06:00)
            bool spansOvernight = expenseStart > expenseEnd;

            // Cas spécial : mission d'une seule journée
            if (isSingleDay)
            {
                TimeSpan? departureTime = missionAssignation.DepartureTime;
                TimeSpan? returnTime = missionAssignation.ReturnTime;

                // Si on a les deux horaires
                if (departureTime.HasValue && returnTime.HasValue)
                {
                    return IsEmployeePresentDuringPeriod(
                        departureTime.Value, returnTime.Value, 
                        expenseStart, expenseEnd, spansOvernight);
                }

                // Si on n'a qu'une heure de départ - vérifier si l'employé peut encore bénéficier du repas
                if (departureTime.HasValue)
                {
                    return CanEmployeeBenefitFromArrival(departureTime.Value, expenseStart, expenseEnd, spansOvernight);
                }

                // Si on n'a qu'une heure de retour - vérifier si l'employé était présent pour le repas
                if (returnTime.HasValue)
                {
                    return CanEmployeeBenefitFromDeparture(returnTime.Value, expenseStart, expenseEnd, spansOvernight);
                }
            }

            // Premier jour (mission multi-jours) : vérifier l'heure d'arrivée
            if (isFirstDay && !isSingleDay && missionAssignation.DepartureTime.HasValue)
            {
                TimeSpan arrivalTime = missionAssignation.DepartureTime.Value;
                return CanEmployeeBenefitFromArrival(arrivalTime, expenseStart, expenseEnd, spansOvernight);
            }

            // Dernier jour (mission multi-jours) : vérifier l'heure de départ
            if (isLastDay && !isSingleDay && missionAssignation.ReturnTime.HasValue)
            {
                TimeSpan departureTime = missionAssignation.ReturnTime.Value;
                return CanEmployeeBenefitFromDeparture(departureTime, expenseStart, expenseEnd, spansOvernight);
            }

            // Pour les jours intermédiaires, tous les ExpenseTypes sont inclus
            return true;
        }

        /// <summary>
        /// Vérifie si l'employé est présent pendant toute la période de l'ExpenseType (mission d'une journée)
        /// </summary>
        private bool IsEmployeePresentDuringPeriod(
            TimeSpan arrivalTime, TimeSpan departureTime, 
            TimeSpan expenseStart, TimeSpan expenseEnd, 
            bool spansOvernight)
        {
            if (spansOvernight)
            {
                // Pour une période qui traverse minuit (ex: Hébergement 21:00-06:00)
                // L'employé doit être présent soit pendant la partie soirée, soit pendant la partie matinale
                bool presentEveningPart = arrivalTime <= expenseStart && departureTime > expenseStart;
                bool presentMorningPart = arrivalTime < expenseEnd && departureTime >= expenseEnd;
                bool presentFullNight = arrivalTime <= expenseStart && departureTime >= expenseEnd;
                
                return presentEveningPart || presentMorningPart || presentFullNight;
            }
            else
            {
                // Pour une période normale (ex: Déjeuner 12:00-13:30)
                // L'employé doit arriver avant ou au début ET partir après le début
                bool canBenefit = arrivalTime <= expenseEnd && departureTime > expenseStart;
                
                if (!canBenefit)
                {
                    _logger.LogDebug("Employee not present during ExpenseType period. " +
                        "Arrival: {ArrivalTime}, Departure: {DepartureTime}, ExpenseType: {TimeStart}-{TimeEnd}", 
                        arrivalTime, departureTime, expenseStart, expenseEnd);
                }
                
                return canBenefit;
            }
        }

        /// <summary>
        /// Vérifie si l'employé peut bénéficier de l'ExpenseType en fonction de son heure d'arrivée
        /// </summary>
        private bool CanEmployeeBenefitFromArrival(
            TimeSpan arrivalTime, 
            TimeSpan expenseStart, TimeSpan expenseEnd, 
            bool spansOvernight)
        {
            if (spansOvernight)
            {
                // Pour l'hébergement (21:00-06:00), si on arrive avant 21:00 ou entre 21:00 et minuit, 
                // ou entre minuit et 06:00, on peut en bénéficier
                bool canBenefit = arrivalTime <= expenseEnd || arrivalTime <= expenseStart;
                
                if (!canBenefit)
                {
                    _logger.LogDebug("Arrival time {ArrivalTime} too late for overnight ExpenseType {TimeStart}-{TimeEnd}", 
                        arrivalTime, expenseStart, expenseEnd);
                }
                
                return canBenefit;
            }
            else
            {
                // Pour un repas normal, si on arrive après la fin du repas, on ne peut pas en bénéficier
                // Exemple: Petit déjeuner 06:30-08:00, si arrivée à 10:00, pas de petit déjeuner
                bool canBenefit = arrivalTime <= expenseEnd;
                
                if (!canBenefit)
                {
                    _logger.LogDebug("Arrival time {ArrivalTime} is after ExpenseType end time {TimeEnd}", 
                        arrivalTime, expenseEnd);
                }
                
                return canBenefit;
            }
        }

        /// <summary>
        /// Vérifie si l'employé peut bénéficier de l'ExpenseType en fonction de son heure de départ
        /// </summary>
        private bool CanEmployeeBenefitFromDeparture(
            TimeSpan departureTime, 
            TimeSpan expenseStart, TimeSpan expenseEnd, 
            bool spansOvernight)
        {
            if (spansOvernight)
            {
                // Pour l'hébergement (21:00-06:00), l'employé peut en bénéficier s'il part pendant la période
                // Il doit partir soit après 21:00 (partie soirée) soit avant ou à 06:00 (partie matinale)
                // Si il part à 07:00, c'est après la fin de l'hébergement donc pas d'hébergement
                bool canBenefit = departureTime > expenseStart || departureTime <= expenseEnd;
                
                if (!canBenefit)
                {
                    _logger.LogDebug("Departure time {DepartureTime} is outside overnight ExpenseType period {TimeStart}-{TimeEnd}", 
                        departureTime, expenseStart, expenseEnd);
                }
                
                return canBenefit;
            }
            else
            {
                // Pour un repas normal, si on part avant le début du repas, on ne peut pas en bénéficier
                // Exemple: si départ à 07:00, on peut avoir le petit déjeuner (06:30-08:00) mais pas le déjeuner
                bool canBenefit = departureTime > expenseStart;
                
                if (!canBenefit)
                {
                    _logger.LogDebug("Departure time {DepartureTime} is before ExpenseType start time {TimeStart}", 
                        departureTime, expenseStart);
                }
                
                return canBenefit;
            }
        }

        public List<DateTime> GenerateDateRange(DateTime startDate, int durationInDays)
        {
            var dates = new List<DateTime>();
            
            if (durationInDays <= 0)
            {
                _logger.LogError("Invalid duration: {Duration}. Duration must be positive.", durationInDays);
                throw new ArgumentException("Duration must be positive.", nameof(durationInDays));
            }

            _logger.LogDebug("Generating date range from {StartDate} for {Duration} days", startDate, durationInDays);
            for (int i = 0; i < durationInDays; i++)
            {
                var date = startDate.AddDays(i);
                dates.Add(date);
                _logger.LogDebug("Added date: {Date}", date);
            }
            
            _logger.LogInformation("Generated {Count} dates for date range", dates.Count);
            return dates;
        }

        /// <summary>
        /// Génère la plage de dates en tenant compte des heures de départ et de retour
        /// </summary>
        public List<DateTime> GenerateDateRangeWithTime(MissionAssignation missionAssignation)
        {
            var dates = new List<DateTime>();
            
            if (missionAssignation == null)
            {
                _logger.LogError("Mission assignment is null");
                throw new ArgumentNullException(nameof(missionAssignation));
            }

            DateTime startDate = missionAssignation.DepartureDate.Date;
            DateTime endDate;

            // Déterminer la date de fin basée sur ReturnDate si disponible
            if (missionAssignation.ReturnDate.HasValue)
            {
                endDate = missionAssignation.ReturnDate.Value.Date;
                _logger.LogDebug("Using ReturnDate: {ReturnDate} as end date", endDate);
            }
            else if (missionAssignation.Duration.HasValue)
            {
                // Si pas de ReturnDate, utiliser Duration - 1 car Duration inclut le jour de départ
                endDate = startDate.AddDays(missionAssignation.Duration.Value - 1);
                _logger.LogDebug("Using Duration {Duration} to calculate end date: {EndDate}", 
                    missionAssignation.Duration.Value, endDate);
            }
            else
            {
                _logger.LogWarning("Neither ReturnDate nor Duration is available, using only departure date");
                endDate = startDate;
            }

            // Générer toutes les dates de la période
            DateTime currentDate = startDate;
            while (currentDate <= endDate)
            {
                dates.Add(currentDate);
                _logger.LogDebug("Added date: {Date}", currentDate);
                currentDate = currentDate.AddDays(1);
            }

            _logger.LogInformation("Generated {Count} dates from {StartDate} to {EndDate}", 
                dates.Count, startDate, endDate);
            
            return dates;
        }
    }
}
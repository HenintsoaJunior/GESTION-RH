using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using MyApp.Api.Entities.mission;
using MyApp.Api.Models.dto.mission;
using MyApp.Api.Services.mission;
namespace MyApp.Api.Entities.mission
{
    // Classe pour représenter le résultat avec missionAssignation une seule fois
    public class MissionPaiementResult
    {
        public MissionAssignation? MissionAssignation { get; set; }
        public IEnumerable<DailyPaiement> DailyPaiements { get; set; } = new List<DailyPaiement>();
        public decimal TotalAmount => DailyPaiements?.Sum(dp => dp.TotalAmount) ?? 0;
        // Utilisé pour générer la section de description du PDF
        // Utilisé pour générer le résumé de la mission dans le PDF
        public object GetDescriptionForPdf()
        {
            try
            {
                if (MissionAssignation == null)
                    return new { };
                return new
                {
                    Mission = MissionAssignation.Mission?.Name ?? "N/A",
                    Nom = ($"{MissionAssignation.Employee.FirstName} {MissionAssignation.Employee.LastName}"),
                    Matricule = ($" {MissionAssignation.Employee.EmployeeCode}"),
                    Direction = ($" {(MissionAssignation.Employee.Direction != null ? MissionAssignation.Employee.Direction.DirectionName : "N/A")}"),
                    Department = ($" {(MissionAssignation.Employee.Department != null ? MissionAssignation.Employee.Department.DepartmentName : "N/A")}"),
                    Service = ($" {(MissionAssignation.Employee.Service != null ? MissionAssignation.Employee.Service.ServiceName : "N/A")}"),
                    Transport = MissionAssignation.Transport?.Type ?? "N/A",
                    Départ = MissionAssignation.DepartureDate.ToString("dd/MM/yyyy") + " " + (MissionAssignation.DepartureTime?.ToString(@"hh\:mm") ?? "N/A"),
                    Retour = MissionAssignation.ReturnDate?.ToString("dd/MM/yyyy") + " " + (MissionAssignation.ReturnTime?.ToString(@"hh\:mm") ?? "N/A"),
                    Durée = $"{MissionAssignation.Duration ?? 0} jours"
                };
            }
            catch (Exception ex)
            {
               throw new Exception($"Erreur lors de la récupération de la description: {ex.Message}", ex);
            }
        }
        // Utilisé pour générer les tableaux du PDF
        public List<object> GetTablesForPdf()
        {
            var tables = new List<object>();
            try
            {
                // Créer la ligne des titres : "Date", <types...>, "Total"
                var headers = new List<string> { "Date" };
                headers.Add("Transport");
                headers.Add("Petit Déjeuner");
                headers.Add("Déjeuner");
                headers.Add("Dinner");
                headers.Add("Hébergement");
                headers.Add("Total");
                tables.Add(headers);
                // Générer les lignes des données
                foreach (var daily in DailyPaiements)
                {
                    var row = new List<string>
                    {
                        // Date
                        daily.Date?.ToString("dd/MM/yyyy") ?? "N/A"
                    };
                    // Remplir les montants pour ce jour
                    var transportDaily = 0m;
                    var petitDejDaily = 0m;
                    var dejeunerDaily = 0m;
                    var dinerDaily = 0m;
                    var hebergementDaily = 0m;
                    if (daily.CompensationScales != null)
                    {
                        var scales = daily.CompensationScales.ToList();
                        transportDaily = MissionAssignationService.CalculateTransportAmount(scales, MissionAssignation!.TransportId);
                        petitDejDaily = MissionAssignationService.CalculateExpenseAmount(scales, "Petit Déjeuner");
                        dejeunerDaily = MissionAssignationService.CalculateExpenseAmount(scales, "Déjeuner");
                        dinerDaily = MissionAssignationService.CalculateExpenseAmount(scales, "Dinner");
                        hebergementDaily = MissionAssignationService.CalculateExpenseAmount(scales, "Hébergement");
                    }
                    row.Add(transportDaily.ToString("N2"));
                    row.Add(petitDejDaily.ToString("N2"));
                    row.Add(dejeunerDaily.ToString("N2"));
                    row.Add(dinerDaily.ToString("N2"));
                    row.Add(hebergementDaily.ToString("N2"));
                    // Total pour le jour
                    var dailyTotal = transportDaily + petitDejDaily + dejeunerDaily + dinerDaily + hebergementDaily;
                    row.Add(dailyTotal.ToString("N2"));
                    tables.Add(row);
                }
                // Ligne totale
                var finalRow = new List<string> { "Total" };
                for (int i = 0; i < 4; i++)
                {
                    finalRow.Add(" ");
                }
                finalRow.Add(TotalAmount.ToString("N2"));
                tables.Add(finalRow);
            }
            catch (Exception ex)
            {
                throw new Exception($"Erreur lors de la récupération du tableau: {ex.Message}", ex);
            }
            return tables;
        }
    }
    // Classe pour représenter le paiement d'une journée
    public class DailyPaiement
    {
        public DateTime? Date { get; set; }
        public IEnumerable<CompensationScale>? CompensationScales { get; set; }
        public decimal TotalAmount { get; set; }
        public MissionAssignation? MissionAssignation { get; set; }
    }
    public class MissionPaiement
    {
        public DateTime? Date { get; set; }
        public IEnumerable<CompensationScale>? CompensationScales { get; set; }
        public decimal TotalAmount { get; set; }
        public MissionAssignation? MissionAssignation { get; set; }
        public MissionPaiement()
        {
        }
        public async Task<MissionPaiementResult> GeneratePaiement(
            MissionAssignation? missionAssignation,
            ICompensationScaleService compensationScaleService)
        {
            // Validation avec vérification null
            if (missionAssignation == null)
            {
                throw new ArgumentNullException(nameof(missionAssignation));
            }
            ValidateInputs(missionAssignation, compensationScaleService);
            var compensationScales = await compensationScaleService.GetAllAsync();
            // Conversion en liste pour éviter les énumérations multiples
            var compensationScalesList = compensationScales.ToList();
            if (!compensationScalesList.Any())
            {
                return new MissionPaiementResult
                {
                    MissionAssignation = missionAssignation,
                    DailyPaiements = new List<DailyPaiement>()
                };
            }
            var dailyPaiements = GeneratePaymentsForDates(missionAssignation, compensationScalesList);
            return new MissionPaiementResult
            {
                MissionAssignation = missionAssignation,
                DailyPaiements = dailyPaiements
            };
        }
        public async Task<(decimal TotalAmount, DateTime DateDebut)> GenerateTotalPaiementAsync(
            MissionAssignation missionAssignation,
            ICompensationScaleService compensationScaleService)
        {
            // Validation avec vérification null
            if (missionAssignation == null)
            {
                throw new ArgumentNullException(nameof(missionAssignation));
            }
            ValidateInputs(missionAssignation, compensationScaleService);
            var dateDebut = missionAssignation.DepartureDate;
            var compensationScales = await compensationScaleService.GetAllAsync();
            // Conversion en liste pour éviter les énumérations multiples
            var compensationScalesList = compensationScales.ToList();
            if (!compensationScalesList.Any())
            {
                return (0m, dateDebut);
            }
            var totalAmount = GenerateTotalPaymentsForDates(missionAssignation, compensationScalesList);
            return (totalAmount, dateDebut);
        }
        private void ValidateInputs(MissionAssignation missionAssignation, ICompensationScaleService compensationScaleService)
        {
            if (missionAssignation == null)
            {
                throw new ArgumentNullException(nameof(missionAssignation), "Mission assignment cannot be null.");
            }
            if (compensationScaleService == null)
            {
                throw new ArgumentNullException(nameof(compensationScaleService), "Compensation scale service cannot be null.");
            }
            if (missionAssignation.Employee == null)
            {
                throw new InvalidOperationException("Employee cannot be null in mission assignment.");
            }
        }
        private List<DailyPaiement> GeneratePaymentsForDates(
            MissionAssignation missionAssignation,
            IEnumerable<CompensationScale> compensationScales)
        {
            if (!IsValidDuration(missionAssignation))
            {
                return new List<DailyPaiement>();
            }
            var scales = compensationScales.ToList();
            var dates = GenerateDateRangeWithTime(missionAssignation);
            var dailyPaiements = new List<DailyPaiement>();
            foreach (var date in dates)
            {
                var dailyPaiement = CreateDailyPaymentForDate(missionAssignation, scales, date);
                dailyPaiements.Add(dailyPaiement);
            }
            return dailyPaiements;
        }
        private decimal GenerateTotalPaymentsForDates(
            MissionAssignation missionAssignation,
            IEnumerable<CompensationScale> compensationScales)
        {
            if (!IsValidDuration(missionAssignation))
            {
                return 0m;
            }
            var scales = compensationScales.ToList();
            var dates = GenerateDateRangeWithTime(missionAssignation);
            var totalAmount = 0m;
            foreach (var date in dates)
            {
                var dailyTotal = CalculateDailyTotalForDate(missionAssignation, scales, date);
                totalAmount += dailyTotal;
            }
            return totalAmount;
        }
        private decimal CalculateDailyTotalForDate(
            MissionAssignation missionAssignation,
            IEnumerable<CompensationScale> compensationScales,
            DateTime date)
        {
            var filteredCompensationScales = FilterCompensationScalesByTime(
                compensationScales, missionAssignation, date).ToList();
            return filteredCompensationScales.Sum(cs => cs?.Amount ?? 0);
        }
        private bool IsValidDuration(MissionAssignation missionAssignation)
        {
            return missionAssignation.Duration.HasValue && missionAssignation.Duration > 0;
        }
        private DailyPaiement CreateDailyPaymentForDate(
            MissionAssignation missionAssignation,
            IEnumerable<CompensationScale> compensationScales,
            DateTime date)
        {
            var filteredCompensationScales = FilterCompensationScalesByTime(
                compensationScales, missionAssignation, date).ToList();
            return new DailyPaiement
            {
                Date = date,
                CompensationScales = filteredCompensationScales,
                TotalAmount = filteredCompensationScales.Sum(cs => cs?.Amount ?? 0)
            };
        }
        private IEnumerable<CompensationScale> FilterCompensationScalesByTime(
            IEnumerable<CompensationScale> compensationScales,
            MissionAssignation missionAssignation,
            DateTime currentDate)
        {
            var filteredScales = new List<CompensationScale>();
            foreach (var scale in compensationScales)
            {
                if (ShouldIncludeScale(scale, missionAssignation, currentDate))
                {
                    filteredScales.Add(scale);
                }
            }
            return filteredScales;
        }
        private bool ShouldIncludeScale(
            CompensationScale scale,
            MissionAssignation missionAssignation,
            DateTime currentDate)
        {
            if (scale.TransportId != null)
            {
                return scale.TransportId == missionAssignation.TransportId;
            }
            if (scale.ExpenseType != null)
            {
                return ShouldIncludeExpenseType(scale.ExpenseType, missionAssignation, currentDate);
            }
            return true;
        }
        private bool ShouldIncludeExpenseType(
            ExpenseType expenseType,
            MissionAssignation missionAssignation,
            DateTime currentDate)
        {
            var dayInfo = GetDayInfo(missionAssignation, currentDate);
            if (expenseType.TimeStart == null && expenseType.TimeEnd == null)
            {
                if (expenseType.Type == "Transport")
                {
                    return true; // Per day for transport
                }
                else
                {
                    return dayInfo.IsFirstDay; // One-time on first day for specials
                }
            }
            if (!expenseType.TimeStart.HasValue || !expenseType.TimeEnd.HasValue)
                return true;
            var timeInfo = GetTimeInfo(expenseType);
            if (dayInfo.IsSingleDay)
                return HandleSingleDayMission(missionAssignation, timeInfo);
            if (dayInfo.IsFirstDay)
                return HandleFirstDay(missionAssignation, timeInfo);
            if (dayInfo.IsLastDay)
                return HandleLastDay(missionAssignation, timeInfo);
            return true;
        }
       
        private (bool IsFirstDay, bool IsLastDay, bool IsSingleDay) GetDayInfo(
            MissionAssignation missionAssignation,
            DateTime currentDate)
        {
            bool isFirstDay = currentDate.Date == missionAssignation.DepartureDate.Date;
            bool isLastDay = missionAssignation.ReturnDate.HasValue &&
                           currentDate.Date == missionAssignation.ReturnDate.Value.Date;
            bool isSingleDay = isFirstDay && isLastDay;
            return (isFirstDay, isLastDay, isSingleDay);
        }
        private (TimeSpan ExpenseStart, TimeSpan ExpenseEnd, bool SpansOvernight) GetTimeInfo(ExpenseType expenseType)
        {
            if (!expenseType.TimeStart.HasValue || !expenseType.TimeEnd.HasValue)
            {
                throw new InvalidOperationException("ExpenseType TimeStart and TimeEnd must have values.");
            }
            TimeSpan expenseStart = expenseType.TimeStart.Value;
            TimeSpan expenseEnd = expenseType.TimeEnd.Value;
            bool spansOvernight = expenseStart > expenseEnd;
            return (expenseStart, expenseEnd, spansOvernight);
        }
        private bool HandleSingleDayMission(
            MissionAssignation missionAssignation,
            (TimeSpan ExpenseStart, TimeSpan ExpenseEnd, bool SpansOvernight) timeInfo)
        {
            TimeSpan? departureTime = missionAssignation.DepartureTime;
            TimeSpan? returnTime = missionAssignation.ReturnTime;
            if (departureTime.HasValue && returnTime.HasValue)
            {
                return IsEmployeePresentDuringPeriod(
                    departureTime.Value, returnTime.Value,
                    timeInfo.ExpenseStart, timeInfo.ExpenseEnd, timeInfo.SpansOvernight);
            }
            if (departureTime.HasValue)
                return CanEmployeeBenefitFromArrival(departureTime.Value, timeInfo.ExpenseStart, timeInfo.ExpenseEnd, timeInfo.SpansOvernight);
            if (returnTime.HasValue)
                return CanEmployeeBenefitFromDeparture(returnTime.Value, timeInfo.ExpenseStart, timeInfo.ExpenseEnd, timeInfo.SpansOvernight);
            return true;
        }
        private bool HandleFirstDay(
            MissionAssignation missionAssignation,
            (TimeSpan ExpenseStart, TimeSpan ExpenseEnd, bool SpansOvernight) timeInfo)
        {
            if (!missionAssignation.DepartureTime.HasValue)
                return true;
            TimeSpan arrivalTime = missionAssignation.DepartureTime.Value;
            return CanEmployeeBenefitFromArrival(arrivalTime, timeInfo.ExpenseStart, timeInfo.ExpenseEnd, timeInfo.SpansOvernight);
        }
        private bool HandleLastDay(
            MissionAssignation missionAssignation,
            (TimeSpan ExpenseStart, TimeSpan ExpenseEnd, bool SpansOvernight) timeInfo)
        {
            if (!missionAssignation.ReturnTime.HasValue)
                return true;
            TimeSpan departureTime = missionAssignation.ReturnTime.Value;
            return CanEmployeeBenefitFromDeparture(departureTime, timeInfo.ExpenseStart, timeInfo.ExpenseEnd, timeInfo.SpansOvernight);
        }
        private bool IsEmployeePresentDuringPeriod(
            TimeSpan arrivalTime, TimeSpan departureTime,
            TimeSpan expenseStart, TimeSpan expenseEnd,
            bool spansOvernight)
        {
            if (spansOvernight)
                return IsEmployeePresentOvernight(arrivalTime, departureTime, expenseStart, expenseEnd);
            else
                return IsEmployeePresentRegular(arrivalTime, departureTime, expenseStart, expenseEnd);
        }
        private bool IsEmployeePresentOvernight(
            TimeSpan arrivalTime, TimeSpan departureTime,
            TimeSpan expenseStart, TimeSpan expenseEnd)
        {
            var normalizedEnd = NormalizeOvernightEnd(expenseEnd, true);
           
            TimeSpan normalizedDeparture = departureTime;
            if (departureTime < expenseStart)
            {
                normalizedDeparture = departureTime.Add(TimeSpan.FromHours(24));
            }
           
            bool presentEvening = arrivalTime <= expenseStart && normalizedDeparture > expenseStart;
            bool presentMorningNight = arrivalTime < normalizedEnd && normalizedDeparture >= expenseEnd.Add(TimeSpan.FromHours(24)); // Ajusté pour fin
           
            bool partialEvening = arrivalTime >= expenseStart && arrivalTime < TimeSpan.FromHours(24) && normalizedDeparture > arrivalTime;
           
            return presentEvening || presentMorningNight || partialEvening;
        }
        private bool IsEmployeePresentRegular(
            TimeSpan arrivalTime, TimeSpan departureTime,
            TimeSpan expenseStart, TimeSpan expenseEnd)
        {
            return arrivalTime <= expenseEnd && departureTime > expenseStart;
        }
        private TimeSpan NormalizeOvernightEnd(TimeSpan expenseEnd, bool spansOvernight)
        {
            if (spansOvernight)
            {
                return expenseEnd.Add(TimeSpan.FromHours(24));
            }
            return expenseEnd;
        }
        private bool CanEmployeeBenefitFromArrival(
            TimeSpan arrivalTime,
            TimeSpan expenseStart, TimeSpan expenseEnd,
            bool spansOvernight)
        {
            if (spansOvernight)
                return CanBenefitOvernightFromArrival(arrivalTime, expenseStart, expenseEnd);
            else
                return CanBenefitRegularFromArrival(arrivalTime, expenseEnd);
        }
        private bool CanBenefitOvernightFromArrival(TimeSpan arrivalTime, TimeSpan expenseStart, TimeSpan expenseEnd)
        {
            var normalizedEnd = NormalizeOvernightEnd(expenseEnd, true);
           
            bool arrivesDuringEvening = arrivalTime >= expenseStart && arrivalTime < TimeSpan.FromHours(24);
            bool arrivesBeforeMorning = arrivalTime <= normalizedEnd;
           
            return arrivesDuringEvening || arrivesBeforeMorning;
        }
        private bool CanBenefitRegularFromArrival(TimeSpan arrivalTime, TimeSpan expenseEnd)
        {
            return arrivalTime <= expenseEnd;
        }
        private bool CanEmployeeBenefitFromDeparture(
            TimeSpan departureTime,
            TimeSpan expenseStart, TimeSpan expenseEnd,
            bool spansOvernight)
        {
            if (spansOvernight)
                return CanBenefitOvernightFromDeparture(departureTime, expenseStart, expenseEnd);
            else
                return CanBenefitRegularFromDeparture(departureTime, expenseStart);
        }
        private bool CanBenefitOvernightFromDeparture(TimeSpan departureTime, TimeSpan expenseStart, TimeSpan expenseEnd)
        {
            var normalizedEnd = NormalizeOvernightEnd(expenseEnd, true);
           
            bool departsAfterEvening = departureTime > expenseStart;
            bool departsAfterMorning = departureTime >= normalizedEnd;
           
            bool departsDuringMorning = departureTime > TimeSpan.Zero && departureTime <= expenseEnd;
           
            return departsAfterEvening || departsAfterMorning || departsDuringMorning;
        }
        private bool CanBenefitRegularFromDeparture(TimeSpan departureTime, TimeSpan expenseStart)
        {
            return departureTime > expenseStart;
        }
        public List<DateTime> GenerateDateRange(DateTime startDate, int durationInDays)
        {
            if (durationInDays <= 0)
            {
                throw new ArgumentException("Duration must be positive.", nameof(durationInDays));
            }
            var dates = new List<DateTime>();
           
            for (int i = 0; i < durationInDays; i++)
            {
                var date = startDate.AddDays(i);
                dates.Add(date);
            }
           
            return dates;
        }
        public List<DateTime> GenerateDateRangeWithTime(MissionAssignation missionAssignation)
        {
            if (missionAssignation == null)
            {
                throw new ArgumentNullException(nameof(missionAssignation));
            }
            DateTime startDate = missionAssignation.DepartureDate.Date;
            DateTime endDate = CalculateEndDate(missionAssignation, startDate);
            var dates = GenerateDatesInRange(startDate, endDate);
           
            return dates;
        }
        private DateTime CalculateEndDate(MissionAssignation missionAssignation, DateTime startDate)
        {
            if (missionAssignation.ReturnDate.HasValue)
            {
                return missionAssignation.ReturnDate.Value.Date;
            }
           
            if (missionAssignation.Duration.HasValue)
            {
                var endDate = startDate.AddDays(missionAssignation.Duration.Value - 1);
                return endDate;
            }
            return startDate;
        }
        private List<DateTime> GenerateDatesInRange(DateTime startDate, DateTime endDate)
        {
            var dates = new List<DateTime>();
            DateTime currentDate = startDate;
           
            while (currentDate <= endDate)
            {
                dates.Add(currentDate);
                currentDate = currentDate.AddDays(1);
            }
            return dates;
        }
    }
    // Nouvelle classe pour le paiement des frais (Expense)
    public class ExpensePaiementResult
    {
        public MissionAssignation? MissionAssignation { get; set; }
        public decimal TransportAmount { get; set; }
        public IEnumerable<DailyExpensePaiement> DailyPaiements { get; set; } = new List<DailyExpensePaiement>();
        public decimal TotalAmount => TransportAmount + (DailyPaiements?.Sum(dp => dp.TotalAmount) ?? 0);
    }
    public class DailyExpensePaiement
    {
        public DateTime? Date { get; set; }
        public IEnumerable<ExpenseCompensationScale>? CompensationScales { get; set; }
        public decimal TotalAmount { get; set; }
        public MissionAssignation? MissionAssignation { get; set; }
    }
    public class ExpensePaiement
    {
        public DateTime? Date { get; set; }
        public IEnumerable<ExpenseCompensationScale>? CompensationScales { get; set; }
        public decimal TotalAmount { get; set; }
        public MissionAssignation? MissionAssignation { get; set; }
        public ExpensePaiement()
        {
        }
        public async Task<ExpensePaiementResult> GeneratePaiement(
            MissionAssignation? missionAssignation,
            IExpenseCompensationScaleService expenseCompensationScaleService)
        {
            // Validation avec vérification null
            if (missionAssignation == null)
            {
                throw new ArgumentNullException(nameof(missionAssignation));
            }
            ValidateInputs(missionAssignation, expenseCompensationScaleService);
            // Récupérer la zone de la mission
            if (missionAssignation.Mission?.Lieu?.ZoneId == null)
            {
                throw new InvalidOperationException("La zone de la mission n'est pas définie.");
            }
            var zoneId = missionAssignation.Mission.Lieu.ZoneId;
            var criteria = new ExpenseCompensationScaleDTOForm { ZoneId = zoneId };
            var allScales = await expenseCompensationScaleService.GetByCriteriaAsync(criteria);
            var allScalesList = allScales.ToList();
            if (!allScalesList.Any())
            {
                return new ExpensePaiementResult
                {
                    MissionAssignation = missionAssignation,
                    TransportAmount = 0m,
                    DailyPaiements = new List<DailyExpensePaiement>()
                };
            }
            // No separation: use all scales for daily payments
            var dailyPaiements = GeneratePaymentsForDates(missionAssignation, allScalesList);
            return new ExpensePaiementResult
            {
                MissionAssignation = missionAssignation,
                TransportAmount = 0m, // Transport included in daily
                DailyPaiements = dailyPaiements
            };
        }
        public async Task<(decimal TotalAmount, DateTime DateDebut)> GenerateTotalPaiementAsync(
            MissionAssignation missionAssignation,
            IExpenseCompensationScaleService expenseCompensationScaleService)
        {
            // Validation avec vérification null
            if (missionAssignation == null)
            {
                throw new ArgumentNullException(nameof(missionAssignation));
            }
            ValidateInputs(missionAssignation, expenseCompensationScaleService);
            var dateDebut = missionAssignation.DepartureDate;
            // Récupérer la zone de la mission
            if (missionAssignation.Mission?.Lieu?.ZoneId == null)
            {
                throw new InvalidOperationException("La zone de la mission n'est pas définie.");
            }
            var zoneId = missionAssignation.Mission.Lieu.ZoneId;
            var criteria = new ExpenseCompensationScaleDTOForm { ZoneId = zoneId };
            var allScales = await expenseCompensationScaleService.GetByCriteriaAsync(criteria);
            var allScalesList = allScales.ToList();
            decimal totalAmount = 0m;
            if (allScalesList.Any())
            {
                totalAmount = GenerateTotalPaymentsForDates(missionAssignation, allScalesList);
            }
            return (totalAmount, dateDebut);
        }
        private void ValidateInputs(MissionAssignation missionAssignation, IExpenseCompensationScaleService expenseCompensationScaleService)
        {
            if (missionAssignation == null)
            {
                throw new ArgumentNullException(nameof(missionAssignation), "Mission assignment cannot be null.");
            }
            if (expenseCompensationScaleService == null)
            {
                throw new ArgumentNullException(nameof(expenseCompensationScaleService), "Expense compensation scale service cannot be null.");
            }
            if (missionAssignation.Employee == null)
            {
                throw new InvalidOperationException("Employee cannot be null in mission assignment.");
            }
        }
        private List<DailyExpensePaiement> GeneratePaymentsForDates(
            MissionAssignation missionAssignation,
            IEnumerable<ExpenseCompensationScale> expenseScales)
        {
            if (!IsValidDuration(missionAssignation))
            {
                return new List<DailyExpensePaiement>();
            }
            var scales = expenseScales.ToList();
            var dates = GenerateDateRangeWithTime(missionAssignation);
            var dailyPaiements = new List<DailyExpensePaiement>();
            foreach (var date in dates)
            {
                var dailyPaiement = CreateDailyPaymentForDate(missionAssignation, scales, date);
                dailyPaiements.Add(dailyPaiement);
            }
            return dailyPaiements;
        }
        private decimal GenerateTotalPaymentsForDates(
            MissionAssignation missionAssignation,
            IEnumerable<ExpenseCompensationScale> expenseScales)
        {
            if (!IsValidDuration(missionAssignation))
            {
                return 0m;
            }
            var scales = expenseScales.ToList();
            var dates = GenerateDateRangeWithTime(missionAssignation);
            var totalAmount = 0m;
            foreach (var date in dates)
            {
                var dailyTotal = CalculateDailyTotalForDate(missionAssignation, scales, date);
                totalAmount += dailyTotal;
            }
            return totalAmount;
        }
        private decimal CalculateDailyTotalForDate(
            MissionAssignation missionAssignation,
            IEnumerable<ExpenseCompensationScale> expenseScales,
            DateTime date)
        {
            var filteredCompensationScales = FilterCompensationScalesByTime(
                expenseScales, missionAssignation, date).ToList();
            return filteredCompensationScales.Sum(cs => cs?.Amount ?? 0);
        }
        private bool IsValidDuration(MissionAssignation missionAssignation)
        {
            return missionAssignation.Duration.HasValue && missionAssignation.Duration > 0;
        }
        private DailyExpensePaiement CreateDailyPaymentForDate(
            MissionAssignation missionAssignation,
            IEnumerable<ExpenseCompensationScale> expenseScales,
            DateTime date)
        {
            var filteredCompensationScales = FilterCompensationScalesByTime(
                expenseScales, missionAssignation, date).ToList();
            return new DailyExpensePaiement
            {
                Date = date,
                CompensationScales = filteredCompensationScales,
                TotalAmount = filteredCompensationScales.Sum(cs => cs?.Amount ?? 0),
                MissionAssignation = missionAssignation
            };
        }
        private IEnumerable<ExpenseCompensationScale> FilterCompensationScalesByTime(
            IEnumerable<ExpenseCompensationScale> expenseScales,
            MissionAssignation missionAssignation,
            DateTime currentDate)
        {
            var filteredScales = new List<ExpenseCompensationScale>();
            foreach (var scale in expenseScales)
            {
                if (ShouldIncludeScale(scale, missionAssignation, currentDate))
                {
                    filteredScales.Add(scale);
                }
            }
            return filteredScales;
        }
        private bool ShouldIncludeScale(
            ExpenseCompensationScale scale,
            MissionAssignation missionAssignation,
            DateTime currentDate)
        {
            if (scale.ExpenseType != null)
            {
                return ShouldIncludeExpenseType(scale.ExpenseType, missionAssignation, currentDate);
            }
            return false; // Seulement les frais avec type
        }
        private bool ShouldIncludeExpenseType(
            ExpenseType expenseType,
            MissionAssignation missionAssignation,
            DateTime currentDate)
        {
            var dayInfo = GetDayInfo(missionAssignation, currentDate);
            if (expenseType.TimeStart == null && expenseType.TimeEnd == null)
            {
                if (expenseType.Type == "Transport" || expenseType.Type == "Taxes")
                {
                    return true; // Per day for transport and taxes
                }
                else
                {
                    return dayInfo.IsFirstDay; // One-time on first day for other specials
                }
            }
            if (!expenseType.TimeStart.HasValue || !expenseType.TimeEnd.HasValue)
                return true;
            var timeInfo = GetTimeInfo(expenseType);
            if (dayInfo.IsSingleDay)
                return HandleSingleDayMission(missionAssignation, timeInfo);
            if (dayInfo.IsFirstDay)
                return HandleFirstDay(missionAssignation, timeInfo);
            if (dayInfo.IsLastDay)
                return HandleLastDay(missionAssignation, timeInfo);
            return true; // Intermediate days include all ExpenseTypes
        }
        private (bool IsFirstDay, bool IsLastDay, bool IsSingleDay) GetDayInfo(
            MissionAssignation missionAssignation,
            DateTime currentDate)
        {
            bool isFirstDay = currentDate.Date == missionAssignation.DepartureDate.Date;
            bool isLastDay = missionAssignation.ReturnDate.HasValue &&
                           currentDate.Date == missionAssignation.ReturnDate.Value.Date;
            bool isSingleDay = isFirstDay && isLastDay;
            return (isFirstDay, isLastDay, isSingleDay);
        }
        private (TimeSpan ExpenseStart, TimeSpan ExpenseEnd, bool SpansOvernight) GetTimeInfo(ExpenseType expenseType)
        {
            if (!expenseType.TimeStart.HasValue || !expenseType.TimeEnd.HasValue)
            {
                throw new InvalidOperationException("ExpenseType TimeStart and TimeEnd must have values.");
            }
            TimeSpan expenseStart = expenseType.TimeStart.Value;
            TimeSpan expenseEnd = expenseType.TimeEnd.Value;
            bool spansOvernight = expenseStart > expenseEnd;
            return (expenseStart, expenseEnd, spansOvernight);
        }
        private bool HandleSingleDayMission(
            MissionAssignation missionAssignation,
            (TimeSpan ExpenseStart, TimeSpan ExpenseEnd, bool SpansOvernight) timeInfo)
        {
            TimeSpan? departureTime = missionAssignation.DepartureTime;
            TimeSpan? returnTime = missionAssignation.ReturnTime;
            if (departureTime.HasValue && returnTime.HasValue)
            {
                return IsEmployeePresentDuringPeriod(
                    departureTime.Value, returnTime.Value,
                    timeInfo.ExpenseStart, timeInfo.ExpenseEnd, timeInfo.SpansOvernight);
            }
            if (departureTime.HasValue)
                return CanEmployeeBenefitFromArrival(departureTime.Value, timeInfo.ExpenseStart, timeInfo.ExpenseEnd, timeInfo.SpansOvernight);
            if (returnTime.HasValue)
                return CanEmployeeBenefitFromDeparture(returnTime.Value, timeInfo.ExpenseStart, timeInfo.ExpenseEnd, timeInfo.SpansOvernight);
            return true;
        }
        private bool HandleFirstDay(
            MissionAssignation missionAssignation,
            (TimeSpan ExpenseStart, TimeSpan ExpenseEnd, bool SpansOvernight) timeInfo)
        {
            if (!missionAssignation.DepartureTime.HasValue)
                return true;
            TimeSpan arrivalTime = missionAssignation.DepartureTime.Value;
            return CanEmployeeBenefitFromArrival(arrivalTime, timeInfo.ExpenseStart, timeInfo.ExpenseEnd, timeInfo.SpansOvernight);
        }
        private bool HandleLastDay(
            MissionAssignation missionAssignation,
            (TimeSpan ExpenseStart, TimeSpan ExpenseEnd, bool SpansOvernight) timeInfo)
        {
            if (!missionAssignation.ReturnTime.HasValue)
                return true;
            TimeSpan departureTime = missionAssignation.ReturnTime.Value;
            return CanEmployeeBenefitFromDeparture(departureTime, timeInfo.ExpenseStart, timeInfo.ExpenseEnd, timeInfo.SpansOvernight);
        }
        private bool IsEmployeePresentDuringPeriod(
            TimeSpan arrivalTime, TimeSpan departureTime,
            TimeSpan expenseStart, TimeSpan expenseEnd,
            bool spansOvernight)
        {
            if (spansOvernight)
                return IsEmployeePresentOvernight(arrivalTime, departureTime, expenseStart, expenseEnd);
            else
                return IsEmployeePresentRegular(arrivalTime, departureTime, expenseStart, expenseEnd);
        }
        private bool IsEmployeePresentOvernight(
            TimeSpan arrivalTime, TimeSpan departureTime,
            TimeSpan expenseStart, TimeSpan expenseEnd)
        {
            var normalizedEnd = NormalizeOvernightEnd(expenseEnd, true);
           
            TimeSpan normalizedDeparture = departureTime;
            if (departureTime < expenseStart)
            {
                normalizedDeparture = departureTime.Add(TimeSpan.FromHours(24));
            }
           
            bool presentEvening = arrivalTime <= expenseStart && normalizedDeparture > expenseStart;
            bool presentMorningNight = arrivalTime < normalizedEnd && normalizedDeparture >= expenseEnd.Add(TimeSpan.FromHours(24)); // Ajusté pour fin
           
            bool partialEvening = arrivalTime >= expenseStart && arrivalTime < TimeSpan.FromHours(24) && normalizedDeparture > arrivalTime;
           
            return presentEvening || presentMorningNight || partialEvening;
        }
        private bool IsEmployeePresentRegular(
            TimeSpan arrivalTime, TimeSpan departureTime,
            TimeSpan expenseStart, TimeSpan expenseEnd)
        {
            return arrivalTime <= expenseEnd && departureTime > expenseStart;
        }
        private TimeSpan NormalizeOvernightEnd(TimeSpan expenseEnd, bool spansOvernight)
        {
            if (spansOvernight)
            {
                return expenseEnd.Add(TimeSpan.FromHours(24));
            }
            return expenseEnd;
        }
        private bool CanEmployeeBenefitFromArrival(
            TimeSpan arrivalTime,
            TimeSpan expenseStart, TimeSpan expenseEnd,
            bool spansOvernight)
        {
            if (spansOvernight)
                return CanBenefitOvernightFromArrival(arrivalTime, expenseStart, expenseEnd);
            else
                return CanBenefitRegularFromArrival(arrivalTime, expenseEnd);
        }
        private bool CanBenefitOvernightFromArrival(TimeSpan arrivalTime, TimeSpan expenseStart, TimeSpan expenseEnd)
        {
            var normalizedEnd = NormalizeOvernightEnd(expenseEnd, true);
           
            bool arrivesDuringEvening = arrivalTime >= expenseStart && arrivalTime < TimeSpan.FromHours(24);
            bool arrivesBeforeMorning = arrivalTime <= normalizedEnd;
           
            return arrivesDuringEvening || arrivesBeforeMorning;
        }
        private bool CanBenefitRegularFromArrival(TimeSpan arrivalTime, TimeSpan expenseEnd)
        {
            return arrivalTime <= expenseEnd;
        }
        private bool CanEmployeeBenefitFromDeparture(
            TimeSpan departureTime,
            TimeSpan expenseStart, TimeSpan expenseEnd,
            bool spansOvernight)
        {
            if (spansOvernight)
                return CanBenefitOvernightFromDeparture(departureTime, expenseStart, expenseEnd);
            else
                return CanBenefitRegularFromDeparture(departureTime, expenseStart);
        }
        private bool CanBenefitOvernightFromDeparture(TimeSpan departureTime, TimeSpan expenseStart, TimeSpan expenseEnd)
        {
            var normalizedEnd = NormalizeOvernightEnd(expenseEnd, true);
           
            bool departsAfterEvening = departureTime > expenseStart;
            bool departsAfterMorning = departureTime >= normalizedEnd;
           
            bool departsDuringMorning = departureTime > TimeSpan.Zero && departureTime <= expenseEnd;
           
            return departsAfterEvening || departsAfterMorning || departsDuringMorning;
        }
        private bool CanBenefitRegularFromDeparture(TimeSpan departureTime, TimeSpan expenseStart)
        {
            return departureTime > expenseStart;
        }
        public List<DateTime> GenerateDateRange(DateTime startDate, int durationInDays)
        {
            if (durationInDays <= 0)
            {
                throw new ArgumentException("Duration must be positive.", nameof(durationInDays));
            }
            var dates = new List<DateTime>();
           
            for (int i = 0; i < durationInDays; i++)
            {
                var date = startDate.AddDays(i);
                dates.Add(date);
            }
           
            return dates;
        }
        public List<DateTime> GenerateDateRangeWithTime(MissionAssignation missionAssignation)
        {
            if (missionAssignation == null)
            {
                throw new ArgumentNullException(nameof(missionAssignation));
            }
            DateTime startDate = missionAssignation.DepartureDate.Date;
            DateTime endDate = CalculateEndDate(missionAssignation, startDate);
            var dates = GenerateDatesInRange(startDate, endDate);
           
            return dates;
        }
        private DateTime CalculateEndDate(MissionAssignation missionAssignation, DateTime startDate)
        {
            if (missionAssignation.ReturnDate.HasValue)
            {
                return missionAssignation.ReturnDate.Value.Date;
            }
           
            if (missionAssignation.Duration.HasValue)
            {
                var endDate = startDate.AddDays(missionAssignation.Duration.Value - 1);
                return endDate;
            }
            return startDate;
        }
        private List<DateTime> GenerateDatesInRange(DateTime startDate, DateTime endDate)
        {
            var dates = new List<DateTime>();
            DateTime currentDate = startDate;
           
            while (currentDate <= endDate)
            {
                dates.Add(currentDate);
                currentDate = currentDate.AddDays(1);
            }
            return dates;
        }
    }
}
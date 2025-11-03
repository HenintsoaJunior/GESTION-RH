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
                    Départ = MissionAssignation.DepartureDate.ToString("dd/MM/yyyy")+" "+ MissionAssignation.DepartureTime, 
                    Retour = MissionAssignation.ReturnDate?.ToString("dd/MM/yyyy") +" "+ MissionAssignation.ReturnTime ?? "N/A",
                    Durée = MissionAssignation.Duration + " jours"
                };
            }
            catch (Exception ex)
            {
               throw new Exception($"Erreur lors de la recuperation de la description: {ex.Message}", ex);
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
                headers.Add("Diner");
                headers.Add("Hebergement");
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
                    if (daily.CompensationScales != null)
                    {
                        var scales = daily.CompensationScales.ToList();
                        row.Add(MissionAssignationService.CalculateTransportAmount(scales, MissionAssignation!.TransportId).ToString("N2"));
                        row.Add(MissionAssignationService.CalculateExpenseAmount(scales, "Petit Déjeuner").ToString("N2"));
                        row.Add(MissionAssignationService.CalculateExpenseAmount(scales, "Déjeuner").ToString("N2"));
                        row.Add(MissionAssignationService.CalculateExpenseAmount(scales, "Dinner").ToString("N2"));
                        row.Add(MissionAssignationService.CalculateExpenseAmount(scales, "Hébergement").ToString("N2"));
                    }


                    // Total
                    row.Add(daily.TotalAmount.ToString("N2"));
                    tables.Add(row);
                }
                var finalRow = new List<string>();
                finalRow.Add("Total");
                for (int i = 0; i < 5; i++)
                {
                    finalRow.Add(" ");
                }
                finalRow.Add(TotalAmount.ToString(CultureInfo.InvariantCulture));
                tables.Add(finalRow);
            }
            catch (Exception ex)
            {
                throw new Exception($"Erreur lors de la recuperation du tableau: {ex.Message}", ex);
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
        public MissionAssignation? MissionAssignation { get; set; } // Nouvelle propriété
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
            // NOUVELLE CONDITION: Filtrer par TransportId
            if (scale.TransportId != null)
            {
                // Inclure seulement si le TransportId du scale correspond à celui de la mission
                return scale.TransportId == missionAssignation.TransportId;
            }

            if (scale.ExpenseType != null)
            {
                return ShouldIncludeExpenseType(scale.ExpenseType, missionAssignation, currentDate);
            }

            return true; // Default include if neither transport nor expense type
        }

        private bool ShouldIncludeExpenseType(
            ExpenseType expenseType,
            MissionAssignation missionAssignation,
            DateTime currentDate)
        {
            if (!expenseType.TimeStart.HasValue || !expenseType.TimeEnd.HasValue)
                return true;

            var dayInfo = GetDayInfo(missionAssignation, currentDate);
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
            bool presentMorningNight = arrivalTime < normalizedEnd && normalizedDeparture >= expenseEnd.Add(TimeSpan.FromHours(24));  // Ajusté pour fin
            
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
                    Départ = MissionAssignation.DepartureDate.ToString("dd/MM/yyyy")+" "+ MissionAssignation.DepartureTime, 
                    Retour = MissionAssignation.ReturnDate?.ToString("dd/MM/yyyy") +" "+ MissionAssignation.ReturnTime ?? "N/A",
                    Durée = MissionAssignation.Duration + " jours"
                };
            }
            catch (Exception ex)
            {
               throw new Exception($"Erreur lors de la recuperation de la description: {ex.Message}", ex);
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
                headers.Add("Dîner");
                headers.Add("Hébergement");
                headers.Add("Total");

                tables.Add(headers);

                var expenseTypes = new[] { "Petit Déjeuner", "Déjeuner", "Dinner", "Hébergement" };
                var dailyRows = new List<List<string>>();
                bool isFirstDay = true;

                foreach (var daily in DailyPaiements)
                {
                    var row = new List<string>
                    {
                        // Date
                        daily.Date?.ToString("dd/MM/yyyy") ?? "N/A"
                    };

                    // Transport (seulement le premier jour)
                    string transStr = isFirstDay ? TransportAmount.ToString("N2") : "0.00";
                    row.Add(transStr);

                    // Remplir les montants pour ce jour (frais seulement)
                    decimal dailyExpenseTotal = 0m;
                    if (daily.CompensationScales != null)
                    {
                        foreach (var type in expenseTypes)
                        {
                            var scale = daily.CompensationScales.FirstOrDefault(s => s.ExpenseType?.Type == type);
                            var amount = scale?.Amount ?? 0m;
                            row.Add(amount.ToString("N2"));
                            dailyExpenseTotal += amount;
                        }
                    }
                    else
                    {
                        for (int i = 0; i < expenseTypes.Length; i++)
                        {
                            row.Add("0.00");
                        }
                    }

                    // Total de la ligne (frais du jour + transport si premier jour)
                    decimal rowTotal = dailyExpenseTotal + (isFirstDay ? TransportAmount : 0m);
                    row.Add(rowTotal.ToString("N2"));
                    dailyRows.Add(row);
                    isFirstDay = false;
                }
                tables.AddRange(dailyRows);

                // Ligne totale
                var totalRow = new List<string> { "Total", TransportAmount.ToString("N2") };
                decimal sumPetit = dailyRows.Sum(r => decimal.Parse(r[2]));
                decimal sumDejeuner = dailyRows.Sum(r => decimal.Parse(r[3]));
                decimal sumDiner = dailyRows.Sum(r => decimal.Parse(r[4]));
                decimal sumHebergement = dailyRows.Sum(r => decimal.Parse(r[5]));
                totalRow.Add(sumPetit.ToString("N2"));
                totalRow.Add(sumDejeuner.ToString("N2"));
                totalRow.Add(sumDiner.ToString("N2"));
                totalRow.Add(sumHebergement.ToString("N2"));
                decimal grandTotal = TransportAmount + sumPetit + sumDejeuner + sumDiner + sumHebergement;
                totalRow.Add(grandTotal.ToString("N2"));
                tables.Add(totalRow);
            }
            catch (Exception ex)
            {
                throw new Exception($"Erreur lors de la recuperation du tableau: {ex.Message}", ex);
            }

            return tables;
        }
    }

    // Classe pour représenter le paiement d'une journée (frais seulement)
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

            // Séparer transport et frais
            var transportScale = allScalesList.FirstOrDefault(s => s.IsTransport == 1);
            var expenseScales = allScalesList.Where(s => s.IsTransport == 0).ToList();
            var transportAmount = transportScale?.Amount ?? 0m;
    
            if (!expenseScales.Any())
            {
                return new ExpensePaiementResult
                {
                    MissionAssignation = missionAssignation,
                    TransportAmount = transportAmount,
                    DailyPaiements = new List<DailyExpensePaiement>()
                };
            }
    
            var dailyPaiements = GeneratePaymentsForDates(missionAssignation, expenseScales);
            
            return new ExpensePaiementResult
            {
                MissionAssignation = missionAssignation,
                TransportAmount = transportAmount,
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

            decimal transportAmount = 0m;
            decimal totalExpenses = 0m;

            if (allScalesList.Any())
            {
                // Séparer transport et frais
                var transportScale = allScalesList.FirstOrDefault(s => s.IsTransport == 1);
                transportAmount = transportScale?.Amount ?? 0m;

                var expenseScales = allScalesList.Where(s => s.IsTransport == 0).ToList();

                if (expenseScales.Any())
                {
                    totalExpenses = GenerateTotalPaymentsForDates(missionAssignation, expenseScales);
                }
            }

            var totalAmount = transportAmount + totalExpenses;

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
            if (!expenseType.TimeStart.HasValue || !expenseType.TimeEnd.HasValue)
                return true;

            var dayInfo = GetDayInfo(missionAssignation, currentDate);
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
            bool presentMorningNight = arrivalTime < normalizedEnd && normalizedDeparture >= expenseEnd.Add(TimeSpan.FromHours(24));  // Ajusté pour fin
            
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
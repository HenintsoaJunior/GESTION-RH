using MyApp.Api.Entities.employee;
using MyApp.Api.Services.employee;
using MyApp.Api.Services.mission;

namespace MyApp.Api.Entities.mission
{
    // Classe pour représenter le résultat avec missionAssignation une seule fois
    public class MissionPaiementResult
    {
        public MissionAssignation? MissionAssignation { get; set; }
        public IEnumerable<DailyPaiement> DailyPaiements { get; set; } = new List<DailyPaiement>();
        public decimal TotalAmount => DailyPaiements?.Sum(dp => dp.TotalAmount) ?? 0;
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
        private ICategoriesOfEmployeeService _categoriesOfEmployeeService = null!;

        public DateTime? Date { get; set; }
        public IEnumerable<CompensationScale>? CompensationScales { get; set; }
        public decimal TotalAmount { get; set; }
        public MissionAssignation? MissionAssignation { get; set; }

        public MissionPaiement()
        {
        }
        public MissionPaiement(ICategoriesOfEmployeeService categoriesOfEmployeeService)
        {
            _categoriesOfEmployeeService = categoriesOfEmployeeService ?? throw new ArgumentNullException(nameof(categoriesOfEmployeeService));
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
    
            var latestCategory = await GetLatestEmployeeCategory(missionAssignation);
            if (latestCategory?.EmployeeCategory == null)
            {
                return new MissionPaiementResult
                {
                    MissionAssignation = missionAssignation,
                    DailyPaiements = new List<DailyPaiement>()
                };
            }
    
            var compensationScales = await GetCompensationScales(compensationScaleService, latestCategory);

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

        private async Task<CategoriesOfEmployee?> GetLatestEmployeeCategory(MissionAssignation missionAssignation)
        {
            DateTime queryDate = missionAssignation.DepartureDate != DateTime.MinValue 
                ? missionAssignation.DepartureDate 
                : DateTime.UtcNow;

            var categories = await _categoriesOfEmployeeService.GetCategoriesByEmployeeIdAsync(
                missionAssignation.Employee.EmployeeId, queryDate);

            return categories?
                .OrderByDescending(c => c.CreatedAt)
                .FirstOrDefault();
        }

        private async Task<IEnumerable<CompensationScale>> GetCompensationScales(
            ICompensationScaleService compensationScaleService, 
            CategoriesOfEmployee? latestCategory)
        {
            if (latestCategory?.EmployeeCategory?.EmployeeCategoryId == null)
            {
                return Enumerable.Empty<CompensationScale>();
            }

            var compensationScales = await compensationScaleService.GetByEmployeeCategoryAsync(
                latestCategory.EmployeeCategory.EmployeeCategoryId);

            return compensationScales ?? Enumerable.Empty<CompensationScale>();
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
            bool presentEveningPart = arrivalTime <= expenseStart && departureTime > expenseStart;
            bool presentMorningPart = arrivalTime < expenseEnd && departureTime >= expenseEnd;
            bool presentFullNight = arrivalTime <= expenseStart && departureTime >= expenseEnd;

            return presentEveningPart || presentMorningPart || presentFullNight;
        }

        private bool IsEmployeePresentRegular(
            TimeSpan arrivalTime, TimeSpan departureTime, 
            TimeSpan expenseStart, TimeSpan expenseEnd)
        {
            return arrivalTime <= expenseEnd && departureTime > expenseStart;
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
            return arrivalTime <= expenseEnd || arrivalTime <= expenseStart;
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
            return departureTime > expenseStart || departureTime <= expenseEnd;
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
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using MyApp.Api.Entities.mission;
using MyApp.Api.Models.dto.mission;
using MyApp.Api.Services.mission;

namespace MyApp.Api.Entities.mission
{
    public class MissionPaiementResult
    {
        public Mission? Mission { get; set; } 
        public IEnumerable<DailyPaiement> DailyPaiements { get; set; } = new List<DailyPaiement>();
        public decimal TotalAmount => DailyPaiements?.Sum(dp => dp.TotalAmount) ?? 0;
    }
        

    public class DailyPaiement
    {
        public DateTime? Date { get; set; }
        public IEnumerable<CompensationScale>? CompensationScales { get; set; }
        public decimal TotalAmount { get; set; }
        public Mission? Mission { get; set; }  
    }

    public class MissionPaiement
    {
        public DateTime? Date { get; set; }
        public IEnumerable<CompensationScale>? CompensationScales { get; set; }
        public decimal TotalAmount { get; set; }
        public Mission? Mission { get; set; }  

        public MissionPaiement() { }

        public async Task<MissionPaiementResult> GeneratePaiement(
            Mission? mission,
            ICompensationScaleService compensationScaleService)
        {
            if (mission == null)
                throw new ArgumentNullException(nameof(mission));

            ValidateInputs(mission, compensationScaleService);

            var compensationScales = await compensationScaleService.GetAllAsync();
            var scalesList = compensationScales.ToList();

            if (!scalesList.Any())
            {
                return new MissionPaiementResult
                {
                    Mission = mission,
                    DailyPaiements = new List<DailyPaiement>()
                };
            }

            var dailyPaiements = GeneratePaymentsForDates(mission, scalesList);

            return new MissionPaiementResult
            {
                Mission = mission,
                DailyPaiements = dailyPaiements
            };
        }

        public async Task<(decimal TotalAmount, DateTime DateDebut)> GenerateTotalPaiementAsync(
            Mission mission,
            ICompensationScaleService compensationScaleService)
        {
            if (mission == null)
                throw new ArgumentNullException(nameof(mission));

            ValidateInputs(mission, compensationScaleService);

            var dateDebut = mission.DepartureDate ?? DateTime.Today;
            var compensationScales = await compensationScaleService.GetAllAsync();
            var scalesList = compensationScales.ToList();

            if (!scalesList.Any())
                return (0m, dateDebut);

            var totalAmount = GenerateTotalPaymentsForDates(mission, scalesList);
            return (totalAmount, dateDebut);
        }

        private void ValidateInputs(Mission mission, ICompensationScaleService compensationScaleService)
        {
            if (mission == null)
                throw new ArgumentNullException(nameof(mission));
            if (compensationScaleService == null)
                throw new ArgumentNullException(nameof(compensationScaleService));
            if (mission.Employee == null)
                throw new InvalidOperationException("Employee cannot be null in mission.");
        }

        private List<DailyPaiement> GeneratePaymentsForDates(Mission mission, IEnumerable<CompensationScale> compensationScales)
        {
            if (!IsValidDuration(mission))
                return new List<DailyPaiement>();

            var scales = compensationScales.ToList();
            var dates = GenerateDateRangeWithTime(mission);
            var dailyPaiements = new List<DailyPaiement>();

            foreach (var date in dates)
            {
                var dailyPaiement = CreateDailyPaymentForDate(mission, scales, date);
                dailyPaiements.Add(dailyPaiement);
            }

            return dailyPaiements;
        }

        private DailyPaiement CreateDailyPaymentForDate(Mission mission, IEnumerable<CompensationScale> compensationScales, DateTime date)
        {
            var filtered = FilterCompensationScalesByTime(compensationScales, mission, date).ToList();

            return new DailyPaiement
            {
                Date = date,
                CompensationScales = filtered,
                TotalAmount = filtered.Sum(cs => cs?.Amount ?? 0m),
                Mission = mission
            };
        }

        private decimal GenerateTotalPaymentsForDates(Mission mission, IEnumerable<CompensationScale> compensationScales)
        {
            if (!IsValidDuration(mission))
                return 0m;

            var scales = compensationScales.ToList();
            var dates = GenerateDateRangeWithTime(mission);
            decimal total = 0m;

            foreach (var date in dates)
                total += CalculateDailyTotalForDate(mission, scales, date);

            return total;
        }

        private decimal CalculateDailyTotalForDate(Mission mission, IEnumerable<CompensationScale> compensationScales, DateTime date)
        {
            var filtered = FilterCompensationScalesByTime(compensationScales, mission, date).ToList();
            return filtered.Sum(cs => cs?.Amount ?? 0m);
        }

        private bool IsValidDuration(Mission mission)
            => mission.Duration.HasValue && mission.Duration > 0;

        private IEnumerable<CompensationScale> FilterCompensationScalesByTime(IEnumerable<CompensationScale> compensationScales, Mission mission, DateTime currentDate)
        {
            var filtered = new List<CompensationScale>();
            foreach (var scale in compensationScales)
            {
                if (ShouldIncludeScale(scale, mission, currentDate))
                    filtered.Add(scale);
            }
            return filtered;
        }

        private bool ShouldIncludeScale(CompensationScale scale, Mission mission, DateTime currentDate)
        {
            if (scale.TransportId != null)
                return scale.TransportId == mission.TransportId;

            if (scale.ExpenseType != null)
                return ShouldIncludeExpenseType(scale.ExpenseType, mission, currentDate);

            return true;
        }

        private bool ShouldIncludeExpenseType(ExpenseType expenseType, Mission mission, DateTime currentDate)
        {
            var dayInfo = GetDayInfo(mission, currentDate);

            if (expenseType.TimeStart == null && expenseType.TimeEnd == null)
            {
                if (expenseType.Type == "Transport")
                    return true;
                return dayInfo.IsFirstDay;
            }

            if (!expenseType.TimeStart.HasValue || !expenseType.TimeEnd.HasValue)
                return true;

            var timeInfo = GetTimeInfo(expenseType);

            if (dayInfo.IsSingleDay)
                return HandleSingleDayMission(mission, timeInfo);
            if (dayInfo.IsFirstDay)
                return HandleFirstDay(mission, timeInfo);
            if (dayInfo.IsLastDay)
                return HandleLastDay(mission, timeInfo);

            return true;
        }

        private (bool IsFirstDay, bool IsLastDay, bool IsSingleDay) GetDayInfo(Mission mission, DateTime currentDate)
        {
            bool isFirstDay = mission.DepartureDate.HasValue && currentDate.Date == mission.DepartureDate.Value.Date;
            bool isLastDay = mission.ReturnDate.HasValue && currentDate.Date == mission.ReturnDate.Value.Date;
            bool isSingleDay = isFirstDay && isLastDay;
            return (isFirstDay, isLastDay, isSingleDay);
        }

        private (TimeSpan ExpenseStart, TimeSpan ExpenseEnd, bool SpansOvernight) GetTimeInfo(ExpenseType expenseType)
        {
            if (!expenseType.TimeStart.HasValue || !expenseType.TimeEnd.HasValue)
                throw new InvalidOperationException("ExpenseType TimeStart and TimeEnd must have values.");

            var start = expenseType.TimeStart.Value;
            var end = expenseType.TimeEnd.Value;
            bool spansOvernight = start > end;
            return (start, end, spansOvernight);
        }

        private bool HandleSingleDayMission(Mission mission, (TimeSpan ExpenseStart, TimeSpan ExpenseEnd, bool SpansOvernight) timeInfo)
        {
            var departure = mission.DepartureTime;
            var returnTime = mission.ReturnTime;

            if (departure.HasValue && returnTime.HasValue)
                return IsEmployeePresentDuringPeriod(departure.Value, returnTime.Value, timeInfo.ExpenseStart, timeInfo.ExpenseEnd, timeInfo.SpansOvernight);

            if (departure.HasValue)
                return CanEmployeeBenefitFromArrival(departure.Value, timeInfo.ExpenseStart, timeInfo.ExpenseEnd, timeInfo.SpansOvernight);

            if (returnTime.HasValue)
                return CanEmployeeBenefitFromDeparture(returnTime.Value, timeInfo.ExpenseStart, timeInfo.ExpenseEnd, timeInfo.SpansOvernight);

            return true;
        }

        private bool HandleFirstDay(Mission mission, (TimeSpan ExpenseStart, TimeSpan ExpenseEnd, bool SpansOvernight) timeInfo)
            => !mission.DepartureTime.HasValue || CanEmployeeBenefitFromArrival(mission.DepartureTime.Value, timeInfo.ExpenseStart, timeInfo.ExpenseEnd, timeInfo.SpansOvernight);

        private bool HandleLastDay(Mission mission, (TimeSpan ExpenseStart, TimeSpan ExpenseEnd, bool SpansOvernight) timeInfo)
            => !mission.ReturnTime.HasValue || CanEmployeeBenefitFromDeparture(mission.ReturnTime.Value, timeInfo.ExpenseStart, timeInfo.ExpenseEnd, timeInfo.SpansOvernight);

        private bool IsEmployeePresentDuringPeriod(TimeSpan arrival, TimeSpan departure, TimeSpan start, TimeSpan end, bool overnight)
            => overnight ? IsEmployeePresentOvernight(arrival, departure, start, end) : IsEmployeePresentRegular(arrival, departure, start, end);

        private bool IsEmployeePresentOvernight(TimeSpan arrival, TimeSpan departure, TimeSpan start, TimeSpan end)
        {
            var normalizedEnd = end.Add(TimeSpan.FromHours(24));
            var normalizedDeparture = departure < start ? departure.Add(TimeSpan.FromHours(24)) : departure;

            return (arrival <= start && normalizedDeparture > start) ||
                   (arrival < normalizedEnd && normalizedDeparture >= normalizedEnd) ||
                   (arrival >= start && arrival < TimeSpan.FromHours(24) && normalizedDeparture > arrival);
        }

        private bool IsEmployeePresentRegular(TimeSpan arrival, TimeSpan departure, TimeSpan start, TimeSpan end)
            => arrival <= end && departure > start;

        private bool CanEmployeeBenefitFromArrival(TimeSpan arrival, TimeSpan start, TimeSpan end, bool overnight)
            => overnight ? (arrival >= start || arrival <= end.Add(TimeSpan.FromHours(24))) : arrival <= end;

        private bool CanEmployeeBenefitFromDeparture(TimeSpan departure, TimeSpan start, TimeSpan end, bool overnight)
            => overnight ? (departure > start || departure >= end.Add(TimeSpan.FromHours(24))) : departure > start;

        public List<DateTime> GenerateDateRangeWithTime(Mission mission)
        {
            if (mission == null) throw new ArgumentNullException(nameof(mission));

            var startDate = mission.DepartureDate?.Date ?? DateTime.Today;
            var endDate = mission.ReturnDate?.Date ?? startDate.AddDays(mission.Duration.GetValueOrDefault(1) - 1);

            var dates = new List<DateTime>();
            for (var date = startDate; date <= endDate; date = date.AddDays(1))
                dates.Add(date);

            return dates;
        }
    }

    // ====================== EXPENSE PAIEMENT ======================

    public class ExpensePaiementResult
    {
        public Mission? Mission { get; set; }  
        public decimal TransportAmount { get; set; }
        public IEnumerable<DailyExpensePaiement> DailyPaiements { get; set; } = new List<DailyExpensePaiement>();
        public decimal TotalAmount => TransportAmount + (DailyPaiements?.Sum(dp => dp.TotalAmount) ?? 0);
    }

    public class DailyExpensePaiement
    {
        public DateTime? Date { get; set; }
        public IEnumerable<ExpenseCompensationScale>? CompensationScales { get; set; }
        public decimal TotalAmount { get; set; }
        public Mission? Mission { get; set; }  
    }

    public class ExpensePaiement
    {
        public DateTime? Date { get; set; }
        public IEnumerable<ExpenseCompensationScale>? CompensationScales { get; set; }
        public decimal TotalAmount { get; set; }
        public Mission? Mission { get; set; }  

        public ExpensePaiement() { }

        public async Task<ExpensePaiementResult> GeneratePaiement(
            Mission? mission,
            IExpenseCompensationScaleService service)
        {
            if (mission == null)
                throw new ArgumentNullException(nameof(mission));

            ValidateInputs(mission, service);

            if (mission.Lieu?.ZoneId == null)
                throw new InvalidOperationException("La zone de la mission n'est pas définie.");

            var criteria = new ExpenseCompensationScaleDTOForm { ZoneId = mission.Lieu.ZoneId };
            var allScales = await service.GetByCriteriaAsync(criteria);
            var scalesList = allScales.ToList();

            if (!scalesList.Any())
            {
                return new ExpensePaiementResult
                {
                    Mission = mission,
                    TransportAmount = 0m,
                    DailyPaiements = new List<DailyExpensePaiement>()
                };
            }

            var dailyPaiements = GeneratePaymentsForDates(mission, scalesList);

            return new ExpensePaiementResult
            {
                Mission = mission,
                TransportAmount = 0m,
                DailyPaiements = dailyPaiements
            };
        }

        public async Task<(decimal TotalAmount, DateTime DateDebut)> GenerateTotalPaiementAsync(
            Mission mission,
            IExpenseCompensationScaleService service)
        {
            if (mission == null)
                throw new ArgumentNullException(nameof(mission));

            ValidateInputs(mission, service);

            if (mission.Lieu?.ZoneId == null)
                throw new InvalidOperationException("La zone de la mission n'est pas définie.");

            var criteria = new ExpenseCompensationScaleDTOForm { ZoneId = mission.Lieu.ZoneId };
            var allScales = await service.GetByCriteriaAsync(criteria);
            var scalesList = allScales.ToList();

            var total = scalesList.Any() ? GenerateTotalPaymentsForDates(mission, scalesList) : 0m;
            var dateDebut = mission.DepartureDate ?? DateTime.Today;

            return (total, dateDebut);
        }

        private void ValidateInputs(Mission mission, IExpenseCompensationScaleService service)
        {
            if (mission == null) throw new ArgumentNullException(nameof(mission));
            if (service == null) throw new ArgumentNullException(nameof(service));
            if (mission.Employee == null) throw new InvalidOperationException("Employee cannot be null.");
        }

        private List<DailyExpensePaiement> GeneratePaymentsForDates(Mission mission, IEnumerable<ExpenseCompensationScale> scales)
        {
            if (!IsValidDuration(mission)) return new List<DailyExpensePaiement>();

            var dates = GenerateDateRangeWithTime(mission);
            var result = new List<DailyExpensePaiement>();

            foreach (var date in dates)
                result.Add(CreateDailyPaymentForDate(mission, scales, date));

            return result;
        }

        private decimal GenerateTotalPaymentsForDates(Mission mission, IEnumerable<ExpenseCompensationScale> scales)
        {
            if (!IsValidDuration(mission)) return 0m;
            return GeneratePaymentsForDates(mission, scales).Sum(x => x.TotalAmount);
        }

        private DailyExpensePaiement CreateDailyPaymentForDate(Mission mission, IEnumerable<ExpenseCompensationScale> scales, DateTime date)
        {
            var filtered = FilterCompensationScalesByTime(scales, mission, date).ToList();
            return new DailyExpensePaiement
            {
                Date = date,
                CompensationScales = filtered,
                TotalAmount = filtered.Sum(x => x?.Amount ?? 0m),
                Mission = mission
            };
        }

        private bool IsValidDuration(Mission mission)
            => mission.Duration.HasValue && mission.Duration > 0;

        private IEnumerable<ExpenseCompensationScale> FilterCompensationScalesByTime(IEnumerable<ExpenseCompensationScale> scales, Mission mission, DateTime currentDate)
        {
            var result = new List<ExpenseCompensationScale>();
            foreach (var scale in scales)
            {
                if (scale.ExpenseType != null && ShouldIncludeExpenseType(scale.ExpenseType, mission, currentDate))
                    result.Add(scale);
            }
            return result;
        }

        private bool ShouldIncludeExpenseType(ExpenseType type, Mission mission, DateTime currentDate)
        {
            var dayInfo = GetDayInfo(mission, currentDate);

            if (type.TimeStart == null && type.TimeEnd == null)
                return type.Type is "Transport" or "Taxes" || dayInfo.IsFirstDay;

            if (!type.TimeStart.HasValue || !type.TimeEnd.HasValue)
                return true;

            var timeInfo = GetTimeInfo(type);

            if (dayInfo.IsSingleDay) return HandleSingleDayMission(mission, timeInfo);
            if (dayInfo.IsFirstDay) return HandleFirstDay(mission, timeInfo);
            if (dayInfo.IsLastDay) return HandleLastDay(mission, timeInfo);

            return true;
        }

        private (bool IsFirstDay, bool IsLastDay, bool IsSingleDay) GetDayInfo(Mission mission, DateTime currentDate)
        {
            bool first = mission.DepartureDate.HasValue && currentDate.Date == mission.DepartureDate.Value.Date;
            bool last = mission.ReturnDate.HasValue && currentDate.Date == mission.ReturnDate.Value.Date;
            return (first, last, first && last);
        }

        private (TimeSpan ExpenseStart, TimeSpan ExpenseEnd, bool SpansOvernight) GetTimeInfo(ExpenseType type)
        {
            var start = type.TimeStart!.Value;
            var end = type.TimeEnd!.Value;
            return (start, end, start > end);
        }

        private bool HandleSingleDayMission(Mission mission, (TimeSpan Start, TimeSpan End, bool Overnight) time)
        {
            var dep = mission.DepartureTime;
            var ret = mission.ReturnTime;

            if (dep.HasValue && ret.HasValue)
                return IsEmployeePresentDuringPeriod(dep.Value, ret.Value, time.Start, time.End, time.Overnight);

            if (dep.HasValue) return CanEmployeeBenefitFromArrival(dep.Value, time.Start, time.End, time.Overnight);
            if (ret.HasValue) return CanEmployeeBenefitFromDeparture(ret.Value, time.Start, time.End, time.Overnight);

            return true;
        }

        private bool HandleFirstDay(Mission mission, (TimeSpan Start, TimeSpan End, bool Overnight) time)
            => !mission.DepartureTime.HasValue || CanEmployeeBenefitFromArrival(mission.DepartureTime.Value, time.Start, time.End, time.Overnight);

        private bool HandleLastDay(Mission mission, (TimeSpan Start, TimeSpan End, bool Overnight) time)
            => !mission.ReturnTime.HasValue || CanEmployeeBenefitFromDeparture(mission.ReturnTime.Value, time.Start, time.End, time.Overnight);

        private bool IsEmployeePresentDuringPeriod(TimeSpan arr, TimeSpan dep, TimeSpan s, TimeSpan e, bool overnight)
            => overnight ? IsEmployeePresentOvernight(arr, dep, s, e) : IsEmployeePresentRegular(arr, dep, s, e);

        private bool IsEmployeePresentOvernight(TimeSpan arr, TimeSpan dep, TimeSpan s, TimeSpan e)
        {
            var end24 = e.Add(TimeSpan.FromHours(24));
            var dep24 = dep < s ? dep.Add(TimeSpan.FromHours(24)) : dep;

            return (arr <= s && dep24 > s) ||
                   (arr < end24 && dep24 >= end24) ||
                   (arr >= s && arr < TimeSpan.FromHours(24) && dep24 > arr);
        }

        private bool IsEmployeePresentRegular(TimeSpan arr, TimeSpan dep, TimeSpan s, TimeSpan e)
            => arr <= e && dep > s;

        private bool CanEmployeeBenefitFromArrival(TimeSpan arr, TimeSpan s, TimeSpan e, bool overnight)
            => overnight ? (arr >= s || arr <= e.Add(TimeSpan.FromHours(24))) : arr <= e;

        private bool CanEmployeeBenefitFromDeparture(TimeSpan dep, TimeSpan s, TimeSpan e, bool overnight)
            => overnight ? (dep > s || dep >= e.Add(TimeSpan.FromHours(24))) : dep > s;

        public List<DateTime> GenerateDateRangeWithTime(Mission mission)
        {
            if (mission == null) throw new ArgumentNullException(nameof(mission));

            var start = mission.DepartureDate?.Date ?? DateTime.Today;
            var end = mission.ReturnDate?.Date ?? start.AddDays(mission.Duration.GetValueOrDefault(1) - 1);

            var dates = new List<DateTime>();
            for (var d = start; d <= end; d = d.AddDays(1))
                dates.Add(d);
            return dates;
        }
    }
}
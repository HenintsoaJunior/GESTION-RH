using MyApp.Api.Entities.employee;
using MyApp.Api.Services.mission;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace MyApp.Api.Entities.mission
{
    public class MissionPaiement
    {
        private readonly ILogger<MissionPaiement> _logger;

        public DateTime? Date { get; set; }
        public IEnumerable<CompensationScale>? CompensationScales { get; set; }
        public decimal? TotalAmount { get; set; }
        public MissionAssignation? MissionAssignation { get; set; } // Added MissionAssignation property

        public MissionPaiement(ILogger<MissionPaiement> logger)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<IEnumerable<MissionPaiement>> GeneratePaiement(
            MissionAssignation missionAssignation, 
            ICompensationScaleService compensationScaleService)
        {
            var paiements = new List<MissionPaiement>();

            _logger.LogInformation("Starting GeneratePaiement for mission assignment ID: {MissionId}", 
                missionAssignation?.MissionId);

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

            _logger.LogDebug("Processing mission for employee ID: {EmployeeId}, Category: {CategoryId}", 
                missionAssignation.Employee.EmployeeId, missionAssignation.Employee.EmployeeCategoryId);

            _logger.LogInformation("Retrieving compensation scales for employee category ID: {CategoryId}", 
                missionAssignation.Employee.EmployeeCategoryId);
            var compensationScales = await compensationScaleService.GetByEmployeeCategoryAsync(
                missionAssignation.Employee.EmployeeCategoryId);
            
            if (compensationScales == null || !compensationScales.Any())
            {
                _logger.LogWarning("No compensation scales found for employee category ID: {CategoryId}", 
                    missionAssignation.Employee.EmployeeCategoryId);
                return paiements;
            }

            _logger.LogInformation("Found {Count} compensation scales for employee category ID: {CategoryId}", 
                compensationScales.Count(), missionAssignation.Employee.EmployeeCategoryId);

            _logger.LogDebug("Generating date range from {StartDate} for {Duration} days", 
                missionAssignation.DepartureDate, missionAssignation.Duration);
            List<DateTime> dates = GenerateDateRange(missionAssignation.DepartureDate, missionAssignation.Duration);

            foreach (var date in dates)
            {
                _logger.LogDebug("Generating payment for date: {Date}", date);
                var paiement = new MissionPaiement(_logger)
                {
                    Date = date,
                    CompensationScales = compensationScales,
                    TotalAmount = compensationScales.Sum(cs => cs?.Amount ?? 0),
                    MissionAssignation = missionAssignation // Assign the MissionAssignation
                };

                paiements.Add(paiement);
                _logger.LogInformation("Generated payment for date {Date} with total amount: {TotalAmount} for mission ID: {MissionId}", 
                    date, paiement.TotalAmount, missionAssignation.MissionId);
            }

            _logger.LogInformation("Completed GeneratePaiement for mission assignment ID: {MissionId}. Generated {Count} payments", 
                missionAssignation.MissionId, paiements.Count);
            return paiements;
        }

        public List<DateTime> GenerateDateRange(DateTime startDate, int? durationInDays)
        {
            var dates = new List<DateTime>();
            
            if (durationInDays < 0)
            {
                _logger.LogError("Invalid duration: {Duration}. Duration cannot be negative.", durationInDays);
                throw new ArgumentException("Duration cannot be negative.", nameof(durationInDays));
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
    }
}
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Entities.employee;
using MyApp.Api.Services.mission;

namespace MyApp.Api.Entities.mission
{
    [Table("mission")]
    public class MissionPaiement
    {
        public DateTime? Date { get; set; }
        public IEnumerable<CompensationScale>? CompensationScales { get; set; }
        public decimal? TotalAmount { get; set; }

        public static IEnumerable<MissionPaiement> GeneratePaiement(MissionAssignation missionAssignation, CompensationScaleService compensationScaleService)
        {
            var paiements = new List<MissionPaiement>();

            // 1. Récupération de l'employé
            Employee employee = missionAssignation.Employee;

            // 2. Récupération des compensation scales liés à la catégorie de l'employé
            var compensationScalesTask = compensationScaleService.GetByEmployeeCategoryAsync(employee.EmployeeCategory.EmployeeCategoryId);
            compensationScalesTask.Wait(); // si tu veux le rendre synchrone, sinon utilise async
            var compensationScales = compensationScalesTask.Result;

            // 3. Récupération des dates selon la durée
            List<DateTime> dates = GenerateDateRange(missionAssignation.DepartureDate, missionAssignation.Duration);

            // 4. Génération des paiements par jour
            foreach (var date in dates)
            {
                var paiement = new MissionPaiement
                {
                    Date = date,
                    CompensationScales = compensationScales,
                    TotalAmount = compensationScales.Sum(cs => cs.Amount) // ou toute autre logique métier
                };

                paiements.Add(paiement);
            }

            return paiements;
        }

        public static List<DateTime> GenerateDateRange(DateTime startDate, int durationInDays)
        {
            var dates = new List<DateTime>();
            for (int i = 0; i < durationInDays; i++)
            {
                dates.Add(startDate.AddDays(i));
            }
            return dates;
        }
    }
}

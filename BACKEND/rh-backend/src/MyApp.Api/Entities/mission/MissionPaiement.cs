using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Entities.mission
{
    [Table("mission")]
    public class MissionPaiement
    {
        public DateTime? Date { get; set; }
        public IEnumerable<CompensationScale>? CompensationScales { get; set; }
        public decimal? TotalAmount { get; set; }

        public static IEnumerable<MissionPaiement> GeneratePaiement(MissionAssignation missionAssignation) {
            
        }
    }
}

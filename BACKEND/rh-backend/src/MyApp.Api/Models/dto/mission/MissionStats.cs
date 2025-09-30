namespace MyApp.Api.Models.list.mission;

public class MissionStats
{
    public int Total { get; set; }
    public int EnCours { get; set; }
    public int Planifiee { get; set; }
    public int Terminee { get; set; }
    public int Annulee { get; set; }
}

public class MissionStatsValidation
{
    public int Total { get; set; }
    public int EnAttente { get; set; }
    public int Approuvee { get; set; }
    public int Rejetee { get; set; }
}
namespace MyApp.Api.Models.dto.mission
{
    public class LieuDTOList
    {
        public string LieuId { get; set; } = string.Empty;
        public string Nom { get; set; } = string.Empty;
        public string AdresseComplete => $"{Adresse}, {Ville}, {CodePostal}, {Pays}";
        private string Adresse { get; set; } = string.Empty;
        private string Ville { get; set; } = string.Empty;
        private string CodePostal { get; set; } = string.Empty;
        private string Pays { get; set; } = string.Empty;
        public int NombreMissions { get; set; }
    }
}
namespace MyApp.Api.Models.dto.users
{
    public class RoleHabilitationDTOForm
    {
        public List<string> HabilitationIds { get; set; } = new List<string>();
        public List<string> RoleIds { get; set; } = new List<string>();
    }
}
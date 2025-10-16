using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Models.dto.users
{
    public class HabilitationDTOForm
    {
        public string Label { get; set; } = null!;
        public string GroupId { get; set; } = null!;
    }

    public class UserHabilitationDTOForm
    {
        public IEnumerable<string> HabilitationIds { get; set; } = new List<string>();
        public required IEnumerable<string> RoleIds { get; set; }
        public required string UserId { get; set; }
        
    }

    public class HabilitationGroupDTOForm
    {
        [Required]
        [MaxLength(100)]
        public string Label { get; set; } = null!;
    }
}
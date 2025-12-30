using System.ComponentModel;
using System.Runtime.Serialization;
using MyApp.Api.Converters;
using System.Text.Json.Serialization;
namespace MyApp.Api.enums
{
    [JsonConverter(typeof(EnumDescriptionJsonConverter<MissionStatus>))]
    public enum MissionStatus
    {
        [Description("unknown")]
        [EnumMember(Value = "unknown")]
        Unknown = 0,

        [Description("En attente de validation")]
        [EnumMember(Value = "pending approval")]
        PendingApproval = 1,

        [Description("Paiement en cours")]
        [EnumMember(Value = "payment in progress")]
        PaymentInProgress = 2,

        [Description("Planifié")]
        [EnumMember(Value = "planned")]
        Planned = 3,

        [Description("En cours d'exécution")]
        [EnumMember(Value = "in progress")]
        InProgress = 4,

        [Description("Terminé")]
        [EnumMember(Value = "completed")]
        Completed = 5,

        [Description("Clôturé")]
        [EnumMember(Value = "closed")]
        Closed = 6,

        [Description("Annulé")]
        [EnumMember(Value = "canceled")]
        Canceled = 7,

        [Description("Mission Rejeté")]
        [EnumMember(Value = "mission rejected")]
        MissionRejected = 8
    }
}
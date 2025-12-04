using System.ComponentModel;
using System.Runtime.Serialization;
using MyApp.Api.Converters;
using System.Text.Json.Serialization;

namespace MyApp.Api.enums
{
    [JsonConverter(typeof(EnumDescriptionJsonConverter<MissionType>))]
    public enum MissionType
    {
        [Description("Inconnu")]
        [EnumMember(Value = "unknown")]
        Unknown = 0,

        [Description("Nationale")]
        [EnumMember(Value = "Nationale")]
        National = 1,

        [Description("Internationale")]
        [EnumMember(Value = "Internationale")]
        International = 2
    }
}
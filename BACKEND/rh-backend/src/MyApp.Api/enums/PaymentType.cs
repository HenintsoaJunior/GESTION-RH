using System.ComponentModel;
using System.Runtime.Serialization;
using MyApp.Api.Converters;
using System.Text.Json.Serialization;

namespace MyApp.Api.enums
{
    [JsonConverter(typeof(EnumDescriptionJsonConverter<PaymentType>))]
    public enum PaymentType
    {

        [Description("Indemnité")]
        [EnumMember(Value = "Indemnité")]
        Indemnite = 1,

        [Description("Note de frais")]
        [EnumMember(Value = "Note de frais")]
        NoteFrais = 2
    }
}
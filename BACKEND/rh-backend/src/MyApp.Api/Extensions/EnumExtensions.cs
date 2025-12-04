using System.ComponentModel;
using System.Reflection;
using System.Runtime.Serialization;

namespace MyApp.Api.Extensions
{
    public static class EnumExtensions
    {
        public static string GetEnumMemberValue(this Enum value)
        {
            var field = value.GetType().GetField(value.ToString());
            var attribute = field?.GetCustomAttribute<EnumMemberAttribute>();
            return attribute?.Value ?? value.ToString().ToLowerInvariant();
        }

        public static string GetDescription(this Enum value)
        {
            var field = value.GetType().GetField(value.ToString());
            var attribute = field?.GetCustomAttribute<DescriptionAttribute>();
            return attribute?.Description ?? value.ToString();
        }

        /// <summary>
        /// Parse une string → enum en utilisant les [EnumMember(Value = "...")]
        /// Fonctionne automatiquement pour tous les enums qui utilisent [EnumMember]
        /// </summary>
        public static T ParseFromMemberValue<T>(this string? value) where T : struct, Enum
        {
            if (string.IsNullOrWhiteSpace(value))
                return GetDefaultValue<T>();

            var normalized = value.Trim().ToLowerInvariant();

            foreach (var field in typeof(T).GetFields(BindingFlags.Public | BindingFlags.Static))
            {
                var attr = field.GetCustomAttribute<EnumMemberAttribute>();
                if (attr?.Value?.Trim().ToLowerInvariant() == normalized)
                {
                    return (T)field.GetValue(null)!;
                }
            }

            // Fallback : essai par nom d'enum
            if (Enum.TryParse<T>(value, ignoreCase: true, out var result))
                return result;

            return GetDefaultValue<T>();
        }

        /// <summary>
        /// Retourne la valeur par défaut de l'enum (0 ou celle avec [DefaultValue] si tu veux)
        /// </summary>
        private static T GetDefaultValue<T>() where T : struct, Enum
        {
            // On prend la première valeur définie (généralement Unknown = 0 ou PendingApproval)
            return Enum.GetValues(typeof(T)).Cast<T>().First();
        }
    }
}
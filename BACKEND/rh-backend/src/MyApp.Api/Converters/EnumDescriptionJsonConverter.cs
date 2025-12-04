using System;
using System.ComponentModel;
using System.Linq;
using System.Reflection;
using System.Runtime.Serialization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace MyApp.Api.Converters;

public class EnumDescriptionJsonConverter<T> : JsonConverter<T> where T : struct, Enum
{
    private static readonly Lazy<Dictionary<string, T>> _descriptionMap = new(InitDescriptionMap);
    private static readonly Lazy<Dictionary<string, T>> _enumMemberMap = new(InitEnumMemberMap);
    private static readonly T _defaultValue = GetDefaultValue();

    public override T Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        // Gestion des valeurs numériques
        if (reader.TokenType == JsonTokenType.Number)
        {
            if (reader.TryGetInt32(out int numericValue))
            {
                if (Enum.IsDefined(typeof(T), numericValue))
                {
                    return (T)Enum.ToObject(typeof(T), numericValue);
                }
            }
            return _defaultValue;
        }

        // Comportement existant pour les chaînes
        if (reader.TokenType != JsonTokenType.String)
            return _defaultValue;

        var stringValue = reader.GetString();
        
        if (string.IsNullOrWhiteSpace(stringValue))
            return _defaultValue;

        var normalized = stringValue.Trim();

        // 1. Recherche par EnumMember value
        if (_enumMemberMap.Value.TryGetValue(normalized, out var enumMemberResult))
            return enumMemberResult;

        // 2. Recherche par description
        if (_descriptionMap.Value.TryGetValue(normalized, out var descResult))
            return descResult;

        // 3. Parsing standard (case insensitive)
        if (Enum.TryParse<T>(normalized, true, out var parsed) && Enum.IsDefined(typeof(T), parsed))
            return parsed;

        return _defaultValue;
    }

    public override void Write(Utf8JsonWriter writer, T value, JsonSerializerOptions options)
    {
        // Écriture en nombre pour correspondre au format du frontend
        writer.WriteNumberValue(Convert.ToInt32(value));
    }

    private static Dictionary<string, T> InitDescriptionMap()
    {
        var map = new Dictionary<string, T>(StringComparer.OrdinalIgnoreCase);
        
        foreach (var field in typeof(T).GetFields(BindingFlags.Public | BindingFlags.Static))
        {
            var description = field.GetCustomAttribute<DescriptionAttribute>()?.Description;
            if (!string.IsNullOrEmpty(description))
            {
                map[description] = (T)field.GetValue(null)!;
            }
        }
        
        return map;
    }

    private static Dictionary<string, T> InitEnumMemberMap()
    {
        var map = new Dictionary<string, T>(StringComparer.OrdinalIgnoreCase);
        
        foreach (var field in typeof(T).GetFields(BindingFlags.Public | BindingFlags.Static))
        {
            var enumMember = field.GetCustomAttribute<EnumMemberAttribute>()?.Value;
            if (!string.IsNullOrEmpty(enumMember))
            {
                map[enumMember] = (T)field.GetValue(null)!;
            }
        }
        
        return map;
    }

    private static T GetDefaultValue()
    {
        return Enum.GetValues(typeof(T)).Cast<T>().FirstOrDefault();
    }
}
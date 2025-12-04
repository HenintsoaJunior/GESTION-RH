using System.Reflection;
using MyApp.Api.Converters;
using System.Text.Json.Serialization;

namespace MyApp.Api.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static void RegisterServicesAndRepositories(this IServiceCollection services)
        {
            var assembly = Assembly.GetExecutingAssembly();

            var repoTypes = assembly.GetTypes()
                .Where(t => t.IsClass && !t.IsAbstract && t.Name.EndsWith("Repository"))
                .ToList();

            foreach (var implType in repoTypes)
            {
                var interfaceType = implType.GetInterface($"I{implType.Name}");
                if (interfaceType != null)
                    services.AddScoped(interfaceType, implType);
            }

            var serviceTypes = assembly.GetTypes()
                .Where(t => t.IsClass && !t.IsAbstract && t.Name.EndsWith("Service"))
                .ToList();

            foreach (var implType in serviceTypes)
            {
                var interfaceType = implType.GetInterface($"I{implType.Name}");
                if (interfaceType != null)
                    services.AddScoped(interfaceType, implType);
            }
        }

        public static IServiceCollection AddAllEnumDescriptionConverters(this IServiceCollection services)
        {
            var assembly = Assembly.GetExecutingAssembly();

            // On récupère le type générique ouvert une seule fois
            var openConverterType = typeof(EnumDescriptionJsonConverter<>);

            var enumTypes = assembly.GetTypes()
                .Where(t => t.IsEnum)
                .ToList();

            foreach (var enumType in enumTypes)
            {
                var attr = enumType.GetCustomAttribute<JsonConverterAttribute>();
                if (attr == null) continue;

                var converterType = attr.ConverterType;
                if (converterType == null) continue;

                bool isOurConverter = converterType.IsGenericType &&
                    converterType.GetGenericTypeDefinition() == openConverterType;

                bool isClosedOurConverter = converterType.IsGenericType &&
                    converterType.GetGenericTypeDefinition() == openConverterType;

                if (!isOurConverter && !isClosedOurConverter) continue;

                var closedConverterType = openConverterType.MakeGenericType(enumType);
                var instance = Activator.CreateInstance(closedConverterType);

                if (instance is JsonConverter converter)
                {
                    services.ConfigureHttpJsonOptions(options =>
                    {
                        options.SerializerOptions.Converters.Add(converter);
                    });
                }
            }

            return services;
        }
    }
}
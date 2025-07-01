using System.Reflection;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Repositories;
using MyApp.Api.Services;

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
    }
}
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Repositories;
using MyApp.Api.Services;

namespace MyApp.Api.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));
            services.AddScoped<IProductRepository, ProductRepository>();
            services.AddScoped<IProductService, ProductService>();
            services.AddAutoMapper(typeof(Program));
            return services;
        }
    }
}
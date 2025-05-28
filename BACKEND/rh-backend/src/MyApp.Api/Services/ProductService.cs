using MyApp.Api.Models;
using MyApp.Api.Entities;
using MyApp.Api.Repositories;

namespace MyApp.Api.Services
{
    public interface IProductService
    {
        Task<IEnumerable<ProductDto>> GetAllAsync();
        Task<ProductDto?> GetByIdAsync(int id);
        Task<ProductDto> CreateAsync(ProductDto dto);
        Task<ProductDto?> UpdateAsync(int id, ProductDto dto);
        Task<bool> DeleteAsync(int id);
    }

    public class ProductService : IProductService
    {
        private readonly IProductRepository _repository;

        public ProductService(IProductRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<ProductDto>> GetAllAsync()
        {
            var products = await _repository.GetAllAsync();
            return products.Select(MapToDto);
        }

        public async Task<ProductDto?> GetByIdAsync(int id)
        {
            var product = await _repository.GetByIdAsync(id);
            return product == null ? null : MapToDto(product);
        }

        public async Task<ProductDto> CreateAsync(ProductDto dto)
        {
            var product = new Product
            {
                Name = dto.Name,
                Price = dto.Price
            };
            var created = await _repository.CreateAsync(product);
            return MapToDto(created);
        }

        public async Task<ProductDto?> UpdateAsync(int id, ProductDto dto)
        {
            if (!await _repository.ExistsAsync(id))
                return null;

            var product = new Product
            {
                Id = id,
                Name = dto.Name,
                Price = dto.Price
            };

            var updated = await _repository.UpdateAsync(product);
            return MapToDto(updated);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            if (!await _repository.ExistsAsync(id))
                return false;

            await _repository.DeleteAsync(id);
            return true;
        }

        private ProductDto MapToDto(Product product)
        {
            return new ProductDto
            {
                Id = product.Id,
                Name = product.Name,
                Price = product.Price
            };
        }
    }
}

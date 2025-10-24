using MyApp.Api.Models.dto.currency;

namespace MyApp.Api.Services.currency
{
    public interface ICurrencyService
    {
        Task<CurrencyRatesDto> GetCurrencyRatesAsync();

        Task<ConvertedAmountDto> ConvertToMGAAsync(decimal amount, string fromCurrency);
    }

// --------------------------------------------------------------------------------

    public class CurrencyService : ICurrencyService
    {
        private const string TARGET_CURRENCY = "MGA";

        private readonly IConfiguration _configuration;
        private readonly string _apiDeviseUrl;

        private readonly HttpClient _httpClient;
        
        public CurrencyService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
            
            _apiDeviseUrl = _configuration.GetSection("API:Currency").Value 
                            ?? throw new InvalidOperationException("La section de configuration 'API:Currency' est manquante ou vide.");
        }

// --------------------------------------------------------------------------------

        public async Task<CurrencyRatesDto> GetCurrencyRatesAsync()
        {
            try
            {
                var rates = await _httpClient.GetFromJsonAsync<CurrencyRatesDto>(_apiDeviseUrl);

                if (rates == null || rates.Rates == null)
                {
                    throw new InvalidOperationException("La réponse de l'API des devises est nulle ou vide.");
                }

                return rates;
            }
            catch (HttpRequestException ex)
            {
                throw new Exception($"Échec de la récupération des devises: Erreur HTTP - {ex.Message}", ex);
            }
            catch (Exception ex)
            {
                throw new Exception($"Échec de la récupération des devises: {ex.Message}", ex);
            }
        }

// --------------------------------------------------------------------------------

        public async Task<ConvertedAmountDto> ConvertToMGAAsync(decimal amount, string fromCurrency)
        {
            if (string.IsNullOrWhiteSpace(fromCurrency))
            {
                throw new ArgumentException("La devise source ne peut être nulle ou vide.", nameof(fromCurrency));
            }

            string standardizedFromCurrency = fromCurrency.ToUpperInvariant();

            if (standardizedFromCurrency == TARGET_CURRENCY)
            {
                return new ConvertedAmountDto { ConvertedAmount = amount };
            }

            CurrencyRatesDto rates;
            try
            {
                rates = await GetCurrencyRatesAsync();
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Échec de la conversion: {ex.Message}", ex);
            }

            if (rates.Rates == null || !rates.Rates.TryGetValue(standardizedFromCurrency, out decimal fromRate) ||
                !rates.Rates.TryGetValue(TARGET_CURRENCY, out decimal mgaRate))
            {
                throw new InvalidOperationException($"Devise non supportée ou non disponible: {fromCurrency}.");
            }

            if (fromRate == 0)
            {
                throw new InvalidOperationException($"Le taux de conversion pour la devise source {fromCurrency} est invalide (zéro).");
            }

            decimal baseAmount = amount / fromRate;

            decimal mgaAmount = baseAmount * mgaRate;

            return new ConvertedAmountDto { ConvertedAmount = mgaAmount };
        }
    }
}
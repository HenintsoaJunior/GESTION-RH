using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using MyApp.Api.Data;

namespace MyApp.Api.Utils.generator
{
    public interface ISequenceGenerator
    {
        string GenerateSequence(string sequenceName, string prefix, int suffixLength = 6, string separator = "-");
    }

    public class SequenceGenerator : ISequenceGenerator
    {
        private readonly AppDbContext _context;
        private readonly ILogger<SequenceGenerator> _logger;

        public SequenceGenerator(AppDbContext context, ILogger<SequenceGenerator> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public string GenerateSequence(string sequenceName, string prefix, int suffixLength = 6, string separator = "-")
        {
            _logger.LogInformation("Début de génération de séquence - Nom: {SequenceName}, Préfixe: {Prefix}, Longueur suffixe: {SuffixLength}, Séparateur: {Separator}", 
                sequenceName, prefix, suffixLength, separator);

            // Validation des paramètres avec logs
            if (string.IsNullOrWhiteSpace(sequenceName))
            {
                _logger.LogError("Échec de génération de séquence - Le nom de la séquence est vide ou null");
                throw new ArgumentException("Le nom de la séquence ne peut pas être vide", nameof(sequenceName));
            }

            if (string.IsNullOrWhiteSpace(prefix))
            {
                _logger.LogError("Échec de génération de séquence - Le préfixe est vide ou null pour la séquence {SequenceName}", sequenceName);
                throw new ArgumentException("Le préfixe ne peut pas être vide", nameof(prefix));
            }

            if (suffixLength <= 0)
            {
                _logger.LogError("Échec de génération de séquence - La longueur du suffixe ({SuffixLength}) doit être positive pour la séquence {SequenceName}", 
                    suffixLength, sequenceName);
                throw new ArgumentException("La longueur du suffixe doit être positive", nameof(suffixLength));
            }

            if (!IsValidSequenceName(sequenceName))
            {
                _logger.LogError("Échec de génération de séquence - Le nom de la séquence '{SequenceName}' contient des caractères non valides", sequenceName);
                throw new ArgumentException("Le nom de la séquence contient des caractères non valides", nameof(sequenceName));
            }

            _logger.LogDebug("Validation des paramètres réussie pour la séquence {SequenceName}", sequenceName);

            int currentCounter;
            try
            {
                var sql = $"SELECT NEXT VALUE FOR {sequenceName}";
                _logger.LogDebug("Exécution de la requête SQL: {SqlQuery}", sql);

                // Vérifier la connexion à la base de données
                var connectionState = _context.Database.GetDbConnection().State;
                _logger.LogDebug("État de la connexion à la base de données: {ConnectionState}", connectionState);

                if (connectionState != System.Data.ConnectionState.Open)
                {
                    _logger.LogInformation("Ouverture de la connexion à la base de données pour la séquence {SequenceName}", sequenceName);
                    _context.Database.OpenConnection();
                }

                var result = _context.Database.SqlQueryRaw<int>(sql).AsEnumerable();
                _logger.LogDebug("Requête SQL exécutée avec succès pour la séquence {SequenceName}", sequenceName);

                currentCounter = result.First();
                _logger.LogInformation("Valeur de séquence récupérée avec succès - Séquence: {SequenceName}, Valeur: {CounterValue}", 
                    sequenceName, currentCounter);
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("Sequence does not exist") || ex.Message.Contains("Invalid object name"))
            {
                _logger.LogError(ex, "Erreur de séquence inexistante - La séquence '{SequenceName}' n'existe pas dans la base de données", sequenceName);
                throw new InvalidOperationException($"La séquence '{sequenceName}' n'existe pas dans la base de données. Créez-la avec: CREATE SEQUENCE {sequenceName} START WITH 1 INCREMENT BY 1", ex);
            }
            catch (Microsoft.Data.SqlClient.SqlException ex)
            {
                _logger.LogError(ex, "Erreur SQL lors de la récupération de la séquence '{SequenceName}' - Code d'erreur: {ErrorNumber}, Message: {ErrorMessage}", 
                    sequenceName, ex.Number, ex.Message);
                throw new InvalidOperationException($"Erreur SQL lors de la récupération de la séquence '{sequenceName}': {ex.Message}", ex);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur inattendue lors de la récupération de la séquence '{SequenceName}' - Type: {ExceptionType}, Message: {ErrorMessage}", 
                    sequenceName, ex.GetType().Name, ex.Message);
                throw new InvalidOperationException($"Erreur lors de la récupération de la séquence '{sequenceName}'. Vérifiez qu'elle existe dans la base de données.", ex);
            }

            try
            {
                // Génération du suffixe avec validation
                if (currentCounter < 0)
                {
                    _logger.LogWarning("Valeur de séquence négative détectée - Séquence: {SequenceName}, Valeur: {CounterValue}", 
                        sequenceName, currentCounter);
                }

                string suffix = currentCounter.ToString().PadLeft(suffixLength, '0');
                _logger.LogDebug("Suffixe généré - Valeur originale: {CounterValue}, Suffixe formaté: {Suffix}", 
                    currentCounter, suffix);

                // Vérification de la longueur du suffixe
                if (suffix.Length > suffixLength)
                {
                    _logger.LogWarning("Le suffixe généré ({Suffix}) dépasse la longueur demandée ({SuffixLength}) pour la séquence {SequenceName}", 
                        suffix, suffixLength, sequenceName);
                }

                string result = $"{prefix}{separator}{suffix}";
                _logger.LogInformation("Séquence générée avec succès - Séquence: {SequenceName}, Résultat: {GeneratedSequence}", 
                    sequenceName, result);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la génération du format final pour la séquence '{SequenceName}' - Valeur: {CounterValue}", 
                    sequenceName, currentCounter);
                throw new InvalidOperationException($"Erreur lors de la génération du format final pour la séquence '{sequenceName}'", ex);
            }
        }

        private bool IsValidSequenceName(string sequenceName)
        {
            _logger.LogDebug("Validation du nom de séquence: {SequenceName}", sequenceName);

            if (string.IsNullOrEmpty(sequenceName))
            {
                _logger.LogDebug("Nom de séquence invalide - vide ou null");
                return false;
            }

            if (!char.IsLetter(sequenceName[0]) && sequenceName[0] != '_')
            {
                _logger.LogDebug("Nom de séquence invalide - Premier caractère '{FirstChar}' n'est pas une lettre ou underscore", sequenceName[0]);
                return false;
            }

            foreach (char c in sequenceName)
            {
                if (!char.IsLetterOrDigit(c) && c != '_')
                {
                    _logger.LogDebug("Nom de séquence invalide - Caractère non valide '{InvalidChar}' trouvé", c);
                    return false;
                }
            }

            _logger.LogDebug("Nom de séquence valide: {SequenceName}", sequenceName);
            return true;
        }
    }
}
using System;
using Microsoft.EntityFrameworkCore;
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

        public SequenceGenerator(AppDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public string GenerateSequence(string sequenceName, string prefix, int suffixLength = 6, string separator = "-")
        {
            if (string.IsNullOrWhiteSpace(sequenceName))
                throw new ArgumentException("Le nom de la séquence ne peut pas être vide", nameof(sequenceName));
            if (string.IsNullOrWhiteSpace(prefix))
                throw new ArgumentException("Le préfixe ne peut pas être vide", nameof(prefix));
            if (suffixLength <= 0)
                throw new ArgumentException("La longueur du suffixe doit être positive", nameof(suffixLength));
            if (!IsValidSequenceName(sequenceName))
                throw new ArgumentException("Le nom de la séquence contient des caractères non valides", nameof(sequenceName));
                
            int currentCounter;
            try
            {
                var sql = $"SELECT NEXT VALUE FOR {sequenceName}";
                currentCounter = _context.Database.SqlQueryRaw<int>(sql).AsEnumerable().First();
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Erreur lors de la récupération de la séquence '{sequenceName}'. Vérifiez qu'elle existe dans la base de données.", ex);
            }

            string suffix = currentCounter.ToString().PadLeft(suffixLength, '0');
            return $"{prefix}{separator}{suffix}";
        }

        private bool IsValidSequenceName(string sequenceName)
        {
           if (string.IsNullOrEmpty(sequenceName))
                return false;

            if (!char.IsLetter(sequenceName[0]) && sequenceName[0] != '_')
                return false;

            foreach (char c in sequenceName)
            {
                if (!char.IsLetterOrDigit(c) && c != '_')
                    return false;
            }

            return true;
        }
    }
}
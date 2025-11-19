using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Models.dto.tmp;

namespace MyApp.Api.Entities.tmp
{
    [Table("tmp_employee")]
    public class TmpEmployee
    {
        [Key]
        [Column("tmp_employee_id")]
        [MaxLength(250)]
        public string? TmpEmployeeId { get; set; }

        [Column("site")]
        [MaxLength(50)]
        public string? Site { get; set; }

        [Column("mle")]
        [MaxLength(50)]
        public string? Mle { get; set; }

        [Column("nom")]
        [MaxLength(100)]
        public string? Nom { get; set; }

        [Column("prenom")]
        [MaxLength(100)]
        public string? Prenom { get; set; }
        
        [Column("date_naissance")]
        public DateTime? DateNaissance { get; set; }

        [Column("lieu_naissance")]
        [MaxLength(100)]
        public string? LieuNaissance { get; set; }

        [Column("numero_cin")]
        [MaxLength(50)]
        public string? NumeroCin { get; set; }

        [Column("date_cin")]
        public DateTime? DateCin { get; set; }

        [Column("lieu_cin")]
        [MaxLength(100)]
        public string? LieuCin { get; set; }

        [Column("sexe")]
        [MaxLength(50)]
        public string? Sexe { get; set; }

        [Column("nationalite")]
        [MaxLength(50)]
        public string? Nationalite { get; set; }

        [Column("telephone")]
        [MaxLength(20)]
        public string? Telephone { get; set; }

        [Column("date_anciennete")]
        public DateTime? DateAnciennete { get; set; }

        [Column("type_contrat")]
        [MaxLength(50)]
        public string? TypeContrat { get; set; }

        [Column("intitule_poste")]
        [MaxLength(100)]
        public string? IntitulePoste { get; set; }

        [Column("categorie")]
        [MaxLength(50)]
        public string? Categorie { get; set; }

        [Column("unite")]
        [MaxLength(100)]
        public string? Unite { get; set; }

        [Column("service")]
        [MaxLength(100)]
        public string? Service { get; set; }

        [Column("department")]
        [MaxLength(100)]
        public string? Department { get; set; }

        [Column("direction")]
        [MaxLength(100)]
        public string? Direction { get; set; }

        [Column("date_fin_contrat")]
        public DateTime? DateFinContrat { get; set; }

        public TmpEmployee() { }

        public TmpEmployee(TmpEmployeeFormDTO dto)
        {
            Site = dto.Site;
            Mle = dto.Mle;
            Nom = dto.Nom;
            Prenom = dto.Prenom;
            DateNaissance = dto.DateNaissance;
            LieuNaissance = dto.LieuNaissance;
            NumeroCin = dto.NumeroCin;
            DateCin = dto.DateCin;
            LieuCin = dto.LieuCin;
            Sexe = dto.Sexe;
            Nationalite = dto.Nationalite;
            Telephone = dto.Telephone;
            DateAnciennete = dto.DateAnciennete;
            TypeContrat = dto.TypeContrat;
            IntitulePoste = dto.IntitulePoste;
            Categorie = dto.Categorie;
            Unite = dto.Unite;
            Service = dto.Service;
            Department = dto.Department;
            Direction = dto.Direction;
            DateFinContrat = dto.DateFinContrat;
        }
    }
}

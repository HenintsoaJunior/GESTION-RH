using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Models.form.candidates;

namespace MyApp.Api.Entities.candidates
{
    [Table("candidates")]
    public class Candidate : BaseEntity
    {
        [Key]
        [Column("candidate_id")]
        [MaxLength(50)]
        public string CandidateId { get; set; } = null!;

        [Required]
        [Column("last_name")]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [Column("first_name")]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Column("birth_date")]
        public DateTime? BirthDate { get; set; }

        [Column("address")]
        [MaxLength(255)]
        public string? Address { get; set; }

        [Required]
        [Column("email")]
        [MaxLength(100)]
        public string Email { get; set; } = string.Empty;

        public Candidate()
        {
        }
        public Candidate(CandidateDTOForm dto)
        {
            LastName = dto.LastName;
            FirstName = dto.FirstName;
            BirthDate = dto.BirthDate;
            Address = dto.Address;
            Email = dto.Email;
        }
    }
}

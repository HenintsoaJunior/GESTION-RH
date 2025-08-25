using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Entities.candidates;
using MyApp.Api.Entities.jobs;
using MyApp.Api.Models.dto.application;

namespace MyApp.Api.Entities.application
{
    [Table("applications")]
    public class Application
    {
        [Key]
        [Column("application_id")]
        [MaxLength(50)]
        public string ApplicationId { get; set; } = null!;

        [Column("application_date")]
        public DateTime? ApplicationDate { get; set; }

        [Required]
        [Column("cv")]
        public byte[] Cv { get; set; } = null!;

        [Required]
        [Column("motivation_letter")]
        public byte[] MotivationLetter { get; set; } = null!;

        [Column("matching_score")]
        public short? MatchingScore { get; set; }

        [Column("status")]
        [MaxLength(20)]
        public string Status { get; set; } = "SOUMIS";

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }

        [Required]
        [Column("offer_id")]
        [MaxLength(50)]
        public string? OfferId { get; set; } = null!;

        [ForeignKey("OfferId")]
        public JobOffer? JobOffer { get; set; }

        [Required]
        [Column("candidate_id")]
        [MaxLength(50)]
        public string CandidateId { get; set; } = null!;

        [ForeignKey("CandidateId")]
        public Candidate? Candidate { get; set; }

        public Application()
        {
        }

        public Application(ApplicationDTOForm dto)
        {
            ApplicationDate = dto.ApplicationDate;
            Cv = dto.Cv;
            MotivationLetter = dto.MotivationLetter;
            MatchingScore = dto.MatchingScore;
            Status = dto.Status;
            OfferId = dto.OfferId;
            CandidateId = dto.CandidateId;  
        }
    }
}

using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Entities
{
    public abstract class Reason : BaseEntity
    {
        [Column("name")]
        [MaxLength(255)]
        public string Name { get; set; } = null!;
    }
}

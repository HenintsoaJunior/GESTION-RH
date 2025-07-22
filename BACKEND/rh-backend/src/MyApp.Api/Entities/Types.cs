using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Entities
{
    public abstract class Types : BaseEntity
    {
        [Column("type")]
        [MaxLength(255)]
        public string Type { get; set; } = string.Empty;
    }
}

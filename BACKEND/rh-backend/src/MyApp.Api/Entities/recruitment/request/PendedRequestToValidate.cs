using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;

[Keyless]
public class PendedRequestToValidate
{
    [Column("requests_per_validator_id")]
    public string RequestsPerValidatorId { get; set; } = "";

    [Column("request_id")]
    public string RequestId { get; set; } = "";

    [Column("validator_id")]
    public string ValidatorId { get; set; } = "";

    [Column("is_validated")]
    public bool IsValidated { get; set; }

    [Column("v_order")]
    public int Order { get; set; }
}

namespace MyApp.Api.Entities.certificate;

public class HostingCertificate : Cerfificate
{
    public decimal Amount { get; set; }
    public List<string>? Costs { get; set; }
}